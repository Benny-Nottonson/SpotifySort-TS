import {
  TimeoutError,
  WebapiError,
  WebapiRegularError,
  WebapiAuthenticationError,
  WebapiPlayerError,
} from "./response-error";

var HttpManager = {};

/* Create fetch options from the base request */
var _getParametersFromRequest = function (request) {
  var options = {};

  if (request.getQueryParameters()) {
    var queryParams = new URLSearchParams(request.getQueryParameters());
    options.query = queryParams.toString();
  }

  if (
    request.getHeaders() &&
    request.getHeaders()["Content-Type"] === "application/json"
  ) {
    options.body = JSON.stringify(request.getBodyParameters());
  } else if (request.getBodyParameters()) {
    options.body = request.getBodyParameters();
  }

  if (request.getHeaders()) {
    options.headers = request.getHeaders();
  }
  return options;
};

var _toError = function (response) {
  if (response.error && response.error.reason) {
    return new WebapiPlayerError(
      response.error,
      response.headers,
      response.status
    );
  }

  if (response.error && typeof response.error === "object") {
    return new WebapiRegularError(
      response.error,
      response.headers,
      response.status
    );
  }

  if (response.error && typeof response.error === "string") {
    return new WebapiAuthenticationError(
      response.error,
      response.headers,
      response.status
    );
  }

  /* Other type of error, or unhandled Web API error format */
  return new WebapiError(
    response.body,
    response.headers,
    response.status,
    response.body
  );
};

/* Make the request to the Web API */
HttpManager._makeRequest = function (method, options, uri, callback) {
  var requestOptions = {
    method: method,
    headers: options.headers,
  };

  if (method !== "GET" && options.body) {
    requestOptions.body = options.body;
  }

  if (method === "GET" && options.query) {
    uri += "?" + options.query;
  }

  fetch(uri, requestOptions)
    .then(function (response) {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then(function (data) {
      return callback(null, {
        body: data,
        headers: response.headers,
        statusCode: response.status,
      });
    })
    .catch(function (error) {
      if (error.timeout) {
        return callback(new TimeoutError());
      } else if (error.status) {
        return callback(_toError(error));
      } else {
        return callback(error);
      }
    });
};

/**
 * Make a HTTP GET request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.get = function (request, callback) {
  var options = _getParametersFromRequest(request);
  var method = "GET";

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

/**
 * Make a HTTP POST request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.post = function (request, callback) {
  var options = _getParametersFromRequest(request);
  var method = "POST";

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

/**
 * Make a HTTP DELETE request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.del = function (request, callback) {
  var options = _getParametersFromRequest(request);
  var method = "DELETE";

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

/**
 * Make a HTTP PUT request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.put = function (request, callback) {
  var options = _getParametersFromRequest(request);
  var method = "PUT";

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

export default HttpManager;
