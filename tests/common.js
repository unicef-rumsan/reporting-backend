const config = require("config");
const Pool = require("pg-pool");

const { host, username, database, password } = config.get("db");

async function connectToTestDatbase() {
  const connectionConfig = {
    host,
    user: username,
    database,
    password,
    port: 5432,
  };
  const pool = new Pool(connectionConfig);
  const client = await pool.connect();
  return { client, pool };
}

async function closeConnection(connection) {
  const { client, pool } = connection;
  await client.release();
  await pool.end();
}

async function resetDatabase(connection) {
  const { pool } = connection;
  await pool.query(`
        DO
        $func$
        BEGIN
          EXECUTE (
            SELECT 'TRUNCATE TABLE ' || string_agg(oid::regclass::text, ', ') || ' CASCADE'
              FROM pg_class
              WHERE relkind = 'r'
              AND relnamespace = 'public'::regnamespace
          );
        END
        $func$;
      `);
}

module.exports = { connectToTestDatbase, resetDatabase, closeConnection };
