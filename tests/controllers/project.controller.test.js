const { db } = require("../jest.setup");
const projectController = require("../../modules/project/project.controller");

const projectC = new projectController({ db });

const projectAddPayload = {
  id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadq",
  name: "test",
  project_manager: "test-manager",
  location: "bhaktapur",
  allocations: ["test"],
  financial_institutions: [{ name: "test-company-name" }],
};

const BulkAdd = [
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

describe("project controller test cases", () => {
  it("project add payload", async () => {
    const project = await projectC.add(projectAddPayload);
    expect(project.name).toBe(projectAddPayload.name);
  });

  it("project bulk add", async () => {
    const project = await projectC.bulkAdd(BulkAdd);
    console.log(project);
    expect(project[0].name).toBe(BulkAdd[0].name);
  });

  it("list project ", async () => {
    const project = await projectC.list();
    expect(Array.isArray(project)).toBe(true);
  });

  it("getById project", async () => {
    const project = await projectC.getById(projectAddPayload.id);
    expect(project.id).toBe(projectAddPayload.id);
  });
});
