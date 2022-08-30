const config = require("config");
const { RSError, SecureRoute } = require("@rumsan/core/utils");
const Logger = require("./helpers/logger");

const logger = Logger.getInstance();

/**
 * Class for the application.
 */
class App {
  /**
   * Constructor of the class
   */
  constructor() {
    this.feats = {};
    this.apiPath = "/api/v1";
  }

  connectServer(server) {
    // server.ext('onRequest', async (request, h) => h.continue);

    this.server = server;
  }

  /**
   * Gets a feat given the feat name.
   * @param {string} featName Name of the feat.
   */
  getFeat(featName) {
    if (!this.feats[featName]) {
      this.feats[featName] = {};
    }
    return this.feats[featName];
  }

  /**
   * Gets an operation given the feat and operation name.
   * @param {string} featName Name of the feat.
   * @param {string} operationName Name of the operation
   */
  getOperation(featName, operationName) {
    const feat = this.getFeat(featName);
    if (!feat[operationName]) {
      feat[operationName] = {
        controller: undefined,
        validator: undefined,
        route: undefined,
      };
    }
    return feat[operationName];
  }

  /**
   * Default hapi handler.
   * @param {object} request Request instance
   * @param {object} h Response instance
   */
  defaultHandle(request, h) {
    return h
      .response({
        statusCode: 401,
        error: "Not Implemented",
        message: "This feature has not been implemented.",
      })
      .code(501);
  }

  /**
   * Gets the operation validator or default.
   * @param {object} operation Operation instance.
   */
  validate(operation) {
    return operation.validator || {};
  }

  /**
   * Handlers for an operation.
   * @param {object} operation Operation instance.
   * @param {object} request Request instance.
   * @param {object} h Response instance.
   */
  async handle(operation, request, h) {
    const fn = operation.controller || this.defaultHandle;
    request.info.clientIpAddress =
      request.headers["x-real-ip"] || request.info.remoteAddress;
    try {
      if (operation.permissions) {
        const isAllowed = SecureRoute(
          config.get("app.secret"),
          operation.permissions,
          request
        );
        if (!isAllowed)
          return h
            .response({
              success: false,
              statusCode: 401,
              error: "Unauthorized",
              message: "You are not authorized to do this operation.",
            })
            .code(401);
      }

      const result = await fn(request, h);

      if (result instanceof Error) {
        return h
          .response({
            success: false,
            statusCode: result.code || 500,
            error: "Server Error",
            message: result.message,
            result,
          })
          .code(result.code || 500);
      }

      const responseFormat =
        request.headers["rs-response-format"] || request.query?.format;

      if (responseFormat === "raw") return result;
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error(`main error captured: ${error}`);

      let response = {
        success: false,
        statusCode: 500,
        error: "Server Error",
        errorName: null,
        group: null,
        message: "Some unknown error occured.",
      };

      if (error instanceof RSError) {
        let data = error.data;
        response = {
          success: false,
          statusCode: data.httpCode || 500,
          error: "Server Error",
          errorName: data.name || null,
          group: data.group || null,
          message: data.message || "Error message not specified",
        };
      } else {
        response = {
          success: false,
          statusCode: 500,
          error: "Server Error",
          errorName: null,
          group: null,
          message: `${error}`,
        };
      }

      return h.response(response).code(response.statusCode);
    }
  }

  /**
   * Register a route in hapi.
   * @param {string} featName Name of the feat.
   * @param {string} operationName Name of the operation.
   * @param {string} method Operation method.
   * @param {string} path Operation path.
   * @param {string} description Operation description.
   */
  registerRoute(featName, operationName, route) {
    const operation = this.getOperation(featName, operationName);

    // permissions
    let permissions = route.permissions || [];
    if (typeof permissions === "string") permissions = permissions.split(",");
    operation.permissions = permissions;

    // Tags
    let tags = ["api"];
    tags.push(featName);
    if (route.tags) tags = [...new Set([...tags, ...route.tags])];
    // else

    const { method, path, description, notes, uploadPayload } = route;
    const config = {
      description,
      notes,
      tags,
      validate: this.validate(operation),
      handler: route.handler
        ? route.handler
        : this.handle.bind(this, operation),
    };

    if (method === "POST" || method === "PUT") {
      config.payload = { maxBytes: 10000000 };
    }

    if (uploadPayload) {
      config.payload = config.payload || {};
      config.payload = Object.assign(config.payload, uploadPayload);
      config.plugins = {
        "hapi-swagger": {
          payloadType: "form",
          consumes: ["multipart/form-data"],
        },
      };
    }

    operation.route = {
      method,
      path: `${this.apiPath}/${featName}${path}`,
      config,
    };

    return operation.route;
  }

  /**
   * Register a controller for an operation.
   * @param {string} featName Name of the feat.
   * @param {string} operationName Name of the operation.
   * @param {object} controller Controller of the operation.
   */
  registerController(featName, operationName, controller) {
    const operation = this.getOperation(featName, operationName);
    operation.controller = controller;
  }

  /**
   * Register the validator for an operation.
   * @param {string} featName Name of the feat.
   * @param {string} operationName Name of the operation.
   * @param {object} validator Validator of the operation.
   */
  registerValidator(featName, operationName, validator) {
    const operation = this.getOperation(featName, operationName);
    operation.validator = validator;
  }

  /**
   * Register all feat operations.
   * @param {string} featName Name of the feat.
   * @param {object} routes Routes of the feat.
   * @param {object} validators Validators of the feat.
   * @param {object} controllers Controllers of the feat.
   */
  register({ name, routes, tags, validators, controllers }) {
    const approutes = [];
    const operationNames = Object.keys(routes);
    operationNames.forEach((operationName) => {
      let route = routes[operationName];
      if (route.validator) {
        validators[operationName] = route.validator;
      }
      if (validators)
        this.registerValidator(name, operationName, validators[operationName]);
      this.registerController(name, operationName, controllers[operationName]);
      if (Array.isArray(route)) {
        route = {
          method: route[0],
          path: route[1],
          description: route[2],
          permissions: route[3],
        };
      }
      approutes.push(this.registerRoute(name, operationName, route, tags));
    });
    this.server.route(approutes);
  }

  requestOptions(req, h) {
    let res = null;
    if (h) res = h.response;
    const request = req;
    const response = res;
    return {
      req,
      res,
      request,
      response,
      currentUser: req.CurrentUser,
    };
  }

  /**
   * Creates an error instance.
   * @param {string} code Error code
   * @param {string} message Error message
   */
  error(message, code) {
    const result = new Error(message);
    result.code = code || 500;
    return result;
  }
}

const instance = new App();

module.exports = instance;
