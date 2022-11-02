const config = require("config");
const request = require("supertest");

const {
  connectToTestDatbase,
  resetDatabase,
  closeConnection,
} = require("../common");

const { report_token } = config.get("app");
const URL = config.get("app.url");
const projectAddPayload = {
  id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadq",
  name: "test",
  project_manager: "test-manager",
  location: "bhaktapur",
  allocations: ["test"],
  financial_institutions: [{ name: "test-company-name" }],
};

const bulkAdd = [
  {
    id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35fadq",
    name: "testt",
    project_manager: "test-manager",
    location: "bhaktapur",
    allocations: ["test"],
    financial_institutions: [{ name: "test-company-name" }],
  },
  {
    id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f60f35dadq",
    name: "testtt",
    project_manager: "test-manager",
    location: "bhaktapur",
    allocations: ["test"],
    financial_institutions: [{ name: "test-company-name" }],
  },
  {
    id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c224ce70f64f35dadq",
    name: "testttt",
    project_manager: "test-manager",
    location: "bhaktapur",
    allocations: ["test"],
    financial_institutions: [{ name: "test-company-name" }],
  },
];

let connection;

describe("post projects", () => {
  beforeAll(async () => {
    connection = await connectToTestDatbase();
  });
  afterAll(async () => {
    await resetDatabase(connection);
    await closeConnection(connection);
  });

  it("should add project", async () => {
    const token = report_token;
    const resData = await request(URL)
      .post("/api/v1/projects")
      .set("report_token", token)
      .send(projectAddPayload);

    const result = resData?.body?.data;

    expect(result.name).toBe(projectAddPayload.name);
  });

  it("should bulkAdd", async () => {
    const token = report_token;
    const resData = await request(URL)
      .post("/api/v1/projects/bulk")
      .set("report_token", token)
      .send(bulkAdd);

    const result = resData?.body?.data;
    expect(result[0].name).toBe(bulkAdd[0].name);
  });

  it("should getById", async () => {
    const token = report_token;
    const resData = await request(URL)
      .get(`/api/v1/projects/${projectAddPayload.id}`)
      .set("report_token", token);

    const result = resData?.body?.data;
    expect(result.id).toBe(projectAddPayload.id);
    expect(result.name).toBe(projectAddPayload.name);
    expect(result.location).toBe(projectAddPayload.location);
    // expect(result.allocations).toBe(projectAddPayload.allocations);
    expect(result.project_manager).toBe(projectAddPayload.project_manager);
    // expect(result.financial_institutions).toBe(
    //   projectAddPayload.financial_institutions
    // );
  });
});
