const config = require("config");
const request = require("supertest");

const {
  connectToTestDatbase,
  resetDatabase,
  closeConnection,
} = require("../common");

const { report_token } = config.get("app");
const URL = config.get("app.url");

const transactionData = {
  id: "0x094e0t1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274cu70f74f35dadf",
  txHash: "0x0e18753B910F2FD118f3E0A69c18F31DD81995A5",
  blockNumber: "4e0f1cf92b93ff161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
  vendor: "test",
  amount: 988,
  phone: "98777",
  ward: 2,
  timeStamp: "2018-02-27 15:35:20.311",
  year: "2020",
  method: "sms",
  mode: "online",
};

let connection;
describe("post/transaction", () => {
  // test.todo("pass empty testcases");
  beforeAll(async () => {
    connection = await connectToTestDatbase();
  });
  afterAll(async () => {
    await resetDatabase(connection);
    await closeConnection(connection);
  });
  it("should add new transactions", async () => {
    const token = report_token;
    const resData = await request(URL)
      .post("/api/v1/transactions")
      .set("report_token", token)
      .send(transactionData);
    const result = resData?.body?.data;
    console.log(result);
    // expect(result.ward).toBe(transactionData.ward);
  });
  it("should getById", async () => {
    const token = report_token;
    const resData = await request(URL)
      .get(`/api/v1/transactions/${transactionData.id}`)
      .set("report_token", token);
    const result = resData?.body?.data;
    console.log(result);
    // expect(result.id).toBe(transactionData.id);
  });
});
