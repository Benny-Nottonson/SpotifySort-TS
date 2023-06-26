import superagent, { get, post, del, put } from "superagent";

/* Timeout */
class NamedError extends Error {
  get name() {
    return this.constructor.name;
  }
}

class TimeoutError extends NamedError {
  constructor() {
    const message =
      "A timeout occurred while communicating with Spotify's Web API.";
    super(message);
  }
}

/* Web API Parent and fallback error */
class WebapiError extends NamedError {
  constructor(body, headers, statusCode, message) {
    super(message);
    this.body = body;
    this.headers = headers;
    this.statusCode = statusCode;
  }
}

/**
 * Regular Error
 * { status : <integer>, message : <string> }
 */
class WebapiRegularError extends WebapiError {
  constructor(body, headers, statusCode) {
    const message =
      "An error occurred while communicating with Spotify's Web API.\n" +
      "Details: " +
      body.error.message +
      ".";

    super(body, headers, statusCode, message);
  }
}

/**
 * Authentication Error
 * { error : <string>, error_description : <string> }
 */
class WebapiAuthenticationError extends WebapiError {
  constructor(body, headers, statusCode) {
    const message =
      "An authentication error occurred while communicating with Spotify's Web API.\n" +
      "Details: " +
      body.error +
      (body.error_description ? " " + body.error_description + "." : ".");

    super(body, headers, statusCode, message);
  }
}

/**
 * Player Error
 * { status : <integer>, message : <string>, reason : <string> }
 */
class WebapiPlayerError extends WebapiError {
  constructor(body, headers, statusCode) {
    const message =
      "An error occurred while communicating with Spotify's Web API.\n" +
      "Details: " +
      body.error.message +
      (body.error.reason ? " " + body.error.reason + "." : ".");

    super(body, headers, statusCode, message);
  }
}

var HttpManager = {};

/* Create superagent options from the base request */
var _getParametersFromRequest = function (request) {
  var options = {};

  if (request.getQueryParameters()) {
    options.query = request.getQueryParameters();
  }

  if (
    request.getHeaders() &&
    request.getHeaders()["Content-Type"] === "application/json"
  ) {
    options.data = JSON.stringify(request.getBodyParameters());
  } else if (request.getBodyParameters()) {
    options.data = request.getBodyParameters();
  }

  if (request.getHeaders()) {
    options.headers = request.getHeaders();
  }
  return options;
};

var _toError = function (response) {
  if (
    typeof response.body === "object" &&
    response.body.error &&
    typeof response.body.error === "object" &&
    response.body.error.reason
  ) {
    return new WebapiPlayerError(
      response.body,
      response.headers,
      response.statusCode
    );
  }

  if (
    typeof response.body === "object" &&
    response.body.error &&
    typeof response.body.error === "object"
  ) {
    return new WebapiRegularError(
      response.body,
      response.headers,
      response.statusCode
    );
  }

  if (
    typeof response.body === "object" &&
    response.body.error &&
    typeof response.body.error === "string"
  ) {
    return new WebapiAuthenticationError(
      response.body,
      response.headers,
      response.statusCode
    );
  }

  /* Other type of error, or unhandled Web API error format */
  return new WebapiError(
    response.body,
    response.headers,
    response.statusCode,
    response.body
  );
};

/* Make the request to the Web API */
HttpManager._makeRequest = function (method, options, uri, callback) {
  var req = method.bind(superagent)(uri);

  if (options.query) {
    req.query(options.query);
  }

  if (options.headers) {
    req.set(options.headers);
  }

  if (options.data) {
    req.send(options.data);
  }

  req.end(function (err, response) {
    if (err) {
      if (err.timeout) {
        return callback(new TimeoutError());
      } else if (err.response) {
        return callback(_toError(err.response));
      } else {
        return callback(err);
      }
    }

    return callback(null, {
      body: response.body,
      headers: response.headers,
      statusCode: response.statusCode,
    });
  });
};

/**
 * Make a HTTP GET request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.get = function (request, callback) {
  var options = _getParametersFromRequest(request);
  var method = get;

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

/**
 * Make a HTTP POST request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.post = function (request, callback) {
  var options = _getParametersFromRequest(request);
  var method = post;

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

/**
 * Make a HTTP DELETE request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.del = function (request, callback) {
  var options = _getParametersFromRequest(request);
  var method = del;

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

/**
 * Make a HTTP PUT request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.put = function (request, callback) {
  var options = _getParametersFromRequest(request);
  var method = put;

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

export default HttpManager;
