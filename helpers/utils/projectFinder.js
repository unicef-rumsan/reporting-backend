const { Op } = require("sequelize");

/**
 * @param {object} table
 * @param {object} query
 * @param {object} req
 *
 */
async function finderByProjectId(table, query, req) {
  let projectsQuery = req.headers.projectid
    ? {
        projects: {
          [Op.contains]: [req.headers.projectid],
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
