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

const bulkAdd = [
  {
    id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35daef",
    name: "Kel Rempel",
    wallet_address: "0x6e18753B910F2FD118f3E0A69c18F31DD81985A5",
    gender: "M",
    phone: "9814719844",
    age: 41,
    child: 2,
    group: "G",
  },
  {
    id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadd",
    name: " Rempel",
    wallet_address: "0x6e18753B910F2FD118f3E0A69c18F31DD81905A5",
    gender: "M",
    phone: "9814719844",
    age: 41,
    child: 2,
    group: "G",
  },
  {
    id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274cu70f74f35dadf",
    name: "Kelli ",
    wallet_address: "0x6e18753B910F2FD118f3E0A69c18F31DD81995A5",
    gender: "M",
    phone: "9814719844",
    age: 41,
    child: 2,
    group: "G",
  },
];

let connection;
describe("POST /beneficiaries", function () {
  beforeAll(async () => {
    connection = await connectToTestDatbase();
  });

  // afterEach(async () => {
  //   await resetDatabase(connection);
  // });

  afterAll(async () => {
    await resetDatabase(connection);
    await closeConnection(connection);
  });

  it("should add a Beneficiary", async () => {
    const token = report_token;
    const res = await request(URL)
      .post("/api/v1/beneficiaries")
      .set("report_token", token)
      .send(BeneficiaryToBeCreated);

    const result = res?.body?.data;
    expect(result.id).toBe(BeneficiaryToBeCreated.id);
    expect(result.name).toBe(BeneficiaryToBeCreated.name);
    expect(result.gender).toBe(BeneficiaryToBeCreated.gender);
    expect(result.age).toBe(BeneficiaryToBeCreated.age);
  });

  it("should getById ", async () => {
    const token = report_token;
    const resData = await request(URL)
      .get(`/api/v1/beneficiaries/${BeneficiaryToBeCreated.id}`)
      .set("report_token", token);

    const result = resData?.body?.data;
    expect(result.id).toBe(BeneficiaryToBeCreated.id);
    expect(result.name).toBe(BeneficiaryToBeCreated.name);
    expect(result.gender).toBe(BeneficiaryToBeCreated.gender);
    expect(result.age).toBe(BeneficiaryToBeCreated.age);
  });
  it("should bulkAdd", async () => {
    const token = report_token;
    const resData = await request(URL)
      .post("/api/v1/beneficiaries/bulk")
      .set("report_token", token)
      .send(bulkAdd);

    const result = resData?.body?.data;

    expect(result[0].name).toBe(bulkAdd[0].name);
  });
  it("should getBeneficiaryCountByGroup", async () => {
    const token = report_token;
    const resData = await request(URL)
      .get("/api/v1/reporting/beneficiary/count-by-group")
      .set("report_token", token);

    const result = resData?.body?.data;
    expect(result[0].count).toBe("4");
  });
  it("should getBeneficiaryByCountByGender", async () => {
    const token = report_token;
    const resData = await request(URL)
      .get("/api/v1/reporting/beneficiary/count-by-gender")
      .set("report_token", token);

    const result = resData?.body?.data;
    expect(result[0].count).toBe("4");
  });
});
