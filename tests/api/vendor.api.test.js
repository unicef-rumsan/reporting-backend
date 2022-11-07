const config = require("config");
const request = require("supertest");

const {
  connectToTestDatbase,
  resetDatabase,
  closeConnection,
} = require("../common");

const { report_token } = config.get("app");
const URL = config.get("app.url");

const addVendor = {
  id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdv2d2727c274cu70f74f35dadf",
  name: "test",
  gender: "M",
  phone: "12345678",
  wallet_address: "0x5e18753B910F2FD118f3E0A69c18F31DD81995A5",
  gov_id: "dd12",
  agencies: [{ name: "test-agency", agec1: "test1", agec2: "test2" }],
};

const bulkAdd = [
  {
    id: "0x063e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274cu70f74f35dadf",
    name: "test",
    gender: "M",
    phone: "12345678",
    wallet_address: "0x5e18753B910F2FD118f3E0A69c18F31DD81995A5",
    gov_id: "dd12",
    agencies: [{ name: "test-agency", agec1: "test1", agec2: "test2" }],
  },
  {
    id: "0x064e9f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274cu70f74f35dadf",
    name: "test",
    gender: "M",
    phone: "12345678",
    wallet_address: "0x5e18753B910F2FD118f3E0A69c18F31DD81995A5",
    gov_id: "dd12",
    agencies: [{ name: "test-agency", agec1: "test1", agec2: "test2" }],
  },
  {
    id: "0x064e0t1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274cu70f74f35dadf",
    name: "test",
    gender: "M",
    phone: "12345678",
    wallet_address: "0x5e18753B910F2FD118f3E0A69c18F31DD81995A5",
    gov_id: "dd12",
    agencies: [{ name: "test-agency", agec1: "test1", agec2: "test2" }],
  },
];

let connection;
describe("vendor", () => {
  beforeAll(async () => {
    connection = await connectToTestDatbase();
  });

  afterAll(async () => {
    await resetDatabase(connection);
    await closeConnection(connection);
  });

  it("should add vendor", async () => {
    const token = report_token;
    const resData = await request(URL)
      .post("/api/v1/vendors")
      .set("report_token", token)
      .send(addVendor);

    const result = resData?.body?.data;

    expect(result.gender).toBe(addVendor.gender);
  });
  it("should bulkAdd", async () => {
    const token = report_token;
    const resData = await request(URL)
      .post("/api/v1/vendors/bulk")
      .set("report_token", token)
      .send(bulkAdd);
    const result = resData?.body?.data;

    expect(result[0].gender).toBe(bulkAdd[0].gender);
  });
  it("shoud getById", async () => {
    const token = report_token;
    const resData = await request(URL)
      .get(`/api/v1/vendors/${addVendor.id}`)
      .set("report_token", token);

    const result = resData?.body?.data;
    expect(result.id).toBe(addVendor.id);
    expect(result.gender).toBe(addVendor.gender);
  });
});
