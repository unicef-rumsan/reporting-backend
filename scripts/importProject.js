const { reportApi, scripts, sourceApi } = require("./_common");

const projectsMapping = (list) =>
  list.map((item) => {
    return {
      id: item.id,
      name: item.name,
      projectManager: item.project_manager,
      location: item.location,
      status: item.status,
      // allocations: item.allocations,
      aidConnectActive: item.aid_connect.isActive,
      financialInstitutions: item.financial_institutions,
    };
  });

const script = {
  async migrateProjects() {
    console.log("Fetching Projects");

    try {
      const projects = await sourceApi.get("/reports/projects");

      const projectData = projectsMapping(projects.data);

      await reportApi.post("/projects/bulk", projectData);

      console.log("Project bulk created");
    } catch (err) {
      console.log("Project: ", err?.response?.data);
    }
  },
};

(async () => {
  await script.migrateProjects();
})();
