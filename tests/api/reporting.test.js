const config = require("config");
const request = require("supertest");

const {
  connectToTestDatbase,
  resetDatabase,
  closeConnection,
} = require("../common");
const { report_token } = config.get("app");
const URL = config.get("app.url");

let connection;
describe("post/reporting", () => {
  beforeAll(async () => {
    connection = await connectToTestDatbase();
  });
  afterAll(async () => {
    await resetDatabase(connection);
    await closeConnection(connection);
  });
  it("should getBeneficiaryCountByGroup ", async () => {
    const token = report_token;
    const resData = await request(URL)
      .get("/api/v1/reporting/beneficiary/count-by-group")
      .set("report_token", token);

    const result = resData?.body?.data;
    console.log(result);
    expect(result).toEqual([]);
  });

  it("should getBeneficiaryCountByGender", async () => {
    const token = report_token;
    const resData = await request(URL)
      .get("/api/v1/reporting/beneficiary/count-by-gender")
      .set("report_token", token);

    const result = resData?.body?.data;
    console.log(result);
  });
});
