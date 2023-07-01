import {
  TimeoutError,
  WebapiError,
  WebapiRegularError,
  WebapiAuthenticationError,
  WebapiPlayerError,
} from "./response-error";

const HttpManager = {};

const _getParametersFromRequest = (request) => {
  const options = {};

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

const _toError = (response) => {
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

  return new WebapiError(
    response.body,
    response.headers,
    response.statusCode,
    response.body
  );
};

HttpManager._makeRequest = (method, options, uri, callback) => {
  const headers = options.headers || {};
  const body = options.data || null;
  const queryParams = options.query || {};

  fetch(uri, {
    method,
    headers,
    body,
    query: queryParams,
  })
    .then((response) => response.json())
    .then((data) => {
      const response = {
        body: data,
        headers: {},
        statusCode: 200,
      };
      callback(null, response);
    })
    .catch((error) => {
      if (error.timeout) {
        callback(new TimeoutError());
      } else if (error.response) {
        callback(_toError(error.response));
      } else {
        callback(error);
      }
    });
};

HttpManager.get = (request, callback) => {
  const options = _getParametersFromRequest(request);
  const method = "GET";

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

HttpManager.post = (request, callback) => {
  const options = _getParametersFromRequest(request);
  const method = "POST";

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

HttpManager.del = (request, callback) => {
  const options = _getParametersFromRequest(request);
  const method = "DELETE";

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

HttpManager.put = (request, callback) => {
  const options = _getParametersFromRequest(request);
  const method = "PUT";

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

export default HttpManager;
