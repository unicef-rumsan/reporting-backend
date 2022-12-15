const { Op } = require("sequelize");

/**
 * @param {object} table
 * @param {object} query
 * @param {object} req
 *
 */
async function finderByProjectId(table, query, projectid) {
  let projectsQuery = projectid
    ? {
        projects: {
          [Op.contains]: [projectid],
        },
      }
    : {};

  query = {
    ...query,
    where: query.where
      ? {
          ...query.where,
          ...projectsQuery,
        }
      : projectsQuery,
  };

  const list = await table.findAll(query);
  return list;
}

module.exports = { finderByProjectId };
