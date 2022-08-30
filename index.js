const config = require("config");
const Hapi = require("@hapi/hapi");
const inert = require("@hapi/inert");
const path = require("path");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");
const Logger = require("./helpers/logger");
const WSService = require("@rumsan/core/services/webSocket");
const app = require("./app");

const { username, password, database } = config.get("db");
const SequelizeDB = require("@rumsan/core").SequelizeDB;
SequelizeDB.init(database, username, password, config.get("db"));

const registerFeats = require("./helpers/register-modules");
//const db = require("./helpers/db");

const logger = Logger.getInstance();
const port = config.get("app.port");

const server = new Hapi.Server({
  port,
  router: {
    stripTrailingSlash: true,
  },
  routes: {
    cors: {
      origin: config.has("app.cors")
        ? config.get("app.cors")[process.env.ENV_TYPE]
        : ["*"],
      additionalHeaders: [
        "cache-control",
        "x-requested-with",
        "access_token",
        "auth_signature",
        "data_signature",
        "h-captcha-response",
      ],
    },
    files: {
      relativeTo: path.join(__dirname, "public/build"),
    },
    validate: {
      failAction: async (request, h, err) => {
        if (process.env.NODE_ENV === "production") {
          // In prod, log a limited error message and throw the default Bad Request error.
          return h
            .response({
              statusCode: 400,
              error: "Bad Request",
              message: err.message,
            })
            .code(400)
            .takeover();
        }
        // During development, log and respond with the full error.
        return err;
      },
    },
  },
});

app.connectServer(server);
WSService.init({
  server: server.listener,
});

const swaggerOptions = {
  info: {
    title: "Rumsan API Service",
    version: process.env.npm_package_version,
    description: process.env.npm_package_description,
  },
  securityDefinitions: {
    jwt: {
      type: "apiKey",
      name: "access-token",
      in: "header",
    },
  },
  security: [{ jwt: [] }],
  grouping: "tags",
};

if (process.env.HEROKU_APP_NAME) {
  const name = process.env.HEROKU_APP_NAME;
  if (name.includes(".")) {
    swaggerOptions.host = process.env.HEROKU_APP_NAME;
  } else {
    swaggerOptions.host = `${process.env.HEROKU_APP_NAME}.herokuapp.com`;
  }
}

/**
 * Starts the server.
 */
async function startServer() {
  registerFeats();
  await server.register([
    inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  server.ext("onPreHandler", (request, h) => {
    const host = request.info.hostname;
    if (host.includes("herokuapp.com")) {
      swaggerOptions.host = host;
    }
    return h.continue;
  });

  server.route({
    method: "GET",
    path: "/{param*}",
    handler: (request, h) => {
      const { param } = request.params;
      if (param.includes(".")) {
        return h.file(param);
      }
      return h.file("index.html");
    },
  });
  await server.start();
  logger.info(`Server running at: ${server.info.uri}`);
  logger.info(
    `SwaggerAPI Documentation running at: ${server.info.uri}/documentation`
  );
}

// eslint-disable-next-line no-shadow, no-unused-vars
server.ext("onPostStop", (server) => {
  // onPostStop: called after the connection listeners are stopped
  // see: https://github.com/hapijs/hapi/blob/master/API.md#-serverextevents
  // app.database
  //   .disconnect()
  //   .then(() => process.exit(0))
  //   .catch((err) => {
  //     // eslint-disable-next-line no-console
  //     console.error(err);
  //     process.exit(1);
  //   });
});
let isStopping = false;
async function shutDown() {
  if (!isStopping) {
    logger.info("shutDown...");
    isStopping = true;
    const lapse = process.env.STOP_SERVER_WAIT_SECONDS
      ? process.env.STOP_SERVER_WAIT_SECONDS
      : 5;
    await server.stop({
      timeout: lapse * 1000,
    });
  }
}

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);

async function start() {
  await startServer();
}

//Database Connection

SequelizeDB.db
  .authenticate()
  .then(async () => {
    await start();
    await require("@rumsan/core/appSettings").init(SequelizeDB.db);
    console.log("Database connected...");
  })
  .catch((err) => {
    console.log("Error: " + err);
    console.log("!!!! SERVER MAY NOT HAVE STARTED !!!!");
  });
