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
const BulkAdd = [
  {
    id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dads",
    name: "test Rempel",
    wallet_address: "0x6e18753B910F2FD118f3E0A69c18F31DD81995A6",
    gender: "F",
    phone: "9814719874",
    age: 41,
    child: 2,
    group: "G",
  },
  {
    id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadq",
    name: "test Rempel",
    wallet_address: "0x6e18753B910F2FD118f3E0A69c18F31DD81995A1",
    gender: "M",
    phone: "9814719074",
    age: 41,
    child: 2,
    group: "B",
  },
];

let connection;
describe(" /beneficiaries api test", function () {
  beforeAll(async () => {
    connection = await connectToTestDatbase();
  });
  afterAll(async () => {
    await resetDatabase(connection);
    await closeConnection(connection);
  });

  it("should add a Beneficiary", async () => {
    const token = report_token;
    const res_data = await request(URL)
      .post("/api/v1/beneficiaries")
      .set("report_token", token)
      .send(BeneficiaryToBeCreated);
    const results = res_data?.body?.data;
    expect(results.id).toBe(BeneficiaryToBeCreated.id);
    expect(results.name).toBe(BeneficiaryToBeCreated.name);
  });

  it("should list a Beneficiary", async () => {
    const token = report_token;
    const res_data = await request(URL)
      .get("/api/v1/beneficiaries")
      .set("report_token", token);
    const results = res_data.body.data;
    expect(Array.isArray(results)).toBe(true);
  });

  it("get by id", async () => {
    const token = report_token;
    const res_data = await request(URL)
      .get(`/api/v1/beneficiaries/${BeneficiaryToBeCreated.id}`)
      .set("report_token", token);
    const results = res_data.body.data;
    // console.log("response body", results);
    expect(results.id).toBe(BeneficiaryToBeCreated.id);
    expect(results.name).toBe(BeneficiaryToBeCreated.name);
    expect(results.phone).toBe(BeneficiaryToBeCreated.phone);
  });

  it("should bulk add Beneficiary", async () => {
    const token = report_token;
    const res_data = await request(URL)
      .post("/api/v1/beneficiaries/bulk")
      .set("report_token", token)
      .send(BulkAdd);
    const results = res_data?.body?.data;
    // console.log("bulk add", results);
    expect(results[0].name).toBe(BulkAdd[0].name);
  });

  it("get count by group", async () => {
    const token = report_token;
    const res_data = await request(URL)
      .get("/api/v1/reporting/beneficiary/count-by-group")
      .set("report_token", token);
    const results = res_data.body.data;
    // console.log(results);   // last added data is displayed at first
    expect(results[0].count).toBe("1");
    expect(results[1].count).toBe("2");
  });

  it("get count by gender", async () => {
    const token = report_token;
    const res_data = await request(URL)
      .get("/api/v1/reporting/beneficiary/count-by-gender")
      .set("report_token", token);
    const results = res_data.body.data;
    // console.log(results);   // last added data is displayed at first
    expect(results[0].count).toBe("2");
    expect(results[1].count).toBe("1");
  });
});
