const config = require("config");
const request = require("supertest");

const {
  connectToTestDatbase,
  resetDatabase,
  closeConnection,
} = require("../common");

const { report_token } = config.get("app");
const URL = config.get("app.url");

// SAMPLE DATA
const BeneficiaryToBeCreated = {
  id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
  name: "Kelli Rempel",
  wallet_address: "0x6e18753B910F2FD118f3E0A69c18F31DD81995A5",
  gender: "M",
  phone: "9814719844",
  age: 41,
  child: 2,
  group: "G",
};

let connection;
describe("POST /beneficiaries", function () {
  beforeAll(async () => {
    connection = await connectToTestDatbase();
  });

  afterEach(async () => {
    await resetDatabase(connection);
  });

  afterAll(async () => {
    await closeConnection(connection);
  });

  it("should add a Beneficiary", (done) => {
    const token = report_token;
    request(URL)
      .post("/api/v1/beneficiaries")
      .set("report_token", token)
      .send(BeneficiaryToBeCreated)
      .expect(200)
      .end((err, res) => {
        if (err) done(err);
        const { updatedBy, createdAt, createdBy, updatedAt, ...rest } =
          res?.body?.data;
        expect(rest).toEqual(BeneficiaryToBeCreated);
        done();
      });
  });
});
