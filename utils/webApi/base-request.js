class Request {
  constructor(builder) {
    if (!builder) {
      throw new Error("No builder supplied to constructor");
    }

    this.host = builder.host;
    this.port = builder.port;
    this.scheme = builder.scheme;
    this.queryParameters = builder.queryParameters;
    this.bodyParameters = builder.bodyParameters;
    this.headers = builder.headers;
    this.path = builder.path;
  }
  _getter(key) {
    return function () {
      return this[key];
    };
  }
  getURI() {
    if (!this.scheme || !this.host || !this.port) {
      throw new Error("Missing components necessary to construct URI");
    }
    var uri = this.scheme + "://" + this.host;
    if (
      (this.scheme === "http" && this.port !== 80) ||
      (this.scheme === "https" && this.port !== 443)
    ) {
      uri += ":" + this.port;
    }
    if (this.path) {
      uri += this.path;
    }
    return uri;
  }
  getURL() {
    var uri = this.getURI();
    if (this.getQueryParameters()) {
      return uri + this.getQueryParameterString(this.getQueryParameters());
    } else {
      return uri;
    }
  }
  getQueryParameterString() {
    var queryParameters = this.getQueryParameters();
    if (queryParameters) {
      return (
        "?" +
        Object.keys(queryParameters)
          .filter(function (key) {
            return queryParameters[key] !== undefined;
          })
          .map(function (key) {
            return key + "=" + queryParameters[key];
          })
          .join("&")
      );
    }
  }
  execute(method, callback) {
    if (callback) {
      method(this, callback);
      return;
    }
    var _self = this;

    return new Promise(function (resolve, reject) {
      method(_self, function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

Request.prototype.getHost = Request.prototype._getter("host");

Request.prototype.getPort = Request.prototype._getter("port");

Request.prototype.getScheme = Request.prototype._getter("scheme");

Request.prototype.getPath = Request.prototype._getter("path");

Request.prototype.getQueryParameters =
  Request.prototype._getter("queryParameters");

Request.prototype.getBodyParameters =
  Request.prototype._getter("bodyParameters");

Request.prototype.getHeaders = Request.prototype._getter("headers");

class Builder {
  constructor() {}
  _setter(key) {
    return function (value) {
      this[key] = value;
      return this;
    };
  }
  _assigner(key) {
    return function () {
      for (var i = 0; i < arguments.length; i++) {
        this[key] = this._assign(this[key], arguments[i]);
      }

      return this;
    };
  }
  withAuth(accessToken) {
    if (accessToken) {
      this.withHeaders({ Authorization: "Bearer " + accessToken });
    }
    return this;
  }
  _assign(src, obj) {
    if (obj && Array.isArray(obj)) {
      return obj;
    }
    if (obj && typeof obj === "string") {
      return obj;
    }
    if (obj && Object.keys(obj).length > 0) {
      return Object.assign(src || {}, obj);
    }
    return src;
  }
  build() {
    return new Request(this);
  }
}

Builder.prototype.withHost = Builder.prototype._setter("host");

Builder.prototype.withPort = Builder.prototype._setter("port");

Builder.prototype.withScheme = Builder.prototype._setter("scheme");

Builder.prototype.withPath = Builder.prototype._setter("path");

Builder.prototype.withQueryParameters =
  Builder.prototype._assigner("queryParameters");

Builder.prototype.withBodyParameters =
  Builder.prototype._assigner("bodyParameters");

Builder.prototype.withHeaders = Builder.prototype._assigner("headers");

module.exports.builder = function () {
  return new Builder();
};
