import { builder } from "./authentication-request";
import { post } from "./http-manager";

export function createAuthorizeURL(
  scopes,
  state,
  showDialog,
  responseType = "code",
) {
  return builder()
    .withPath("/authorize")
    .withQueryParameters({
      client_id: this.getClientId(),
      response_type: responseType,
      redirect_uri: this.getRedirectURI(),
      scope: scopes.join("%20"),
      state: state,
      show_dialog: showDialog && !!showDialog,
    })
    .build()
    .getURL();
}
export function clientCredentialsGrant(callback) {
  return builder()
    .withPath("/api/token")
    .withBodyParameters({
      grant_type: "client_credentials",
    })
    .withHeaders({
      Authorization:
        "Basic " +
        new Buffer.from(
          this.getClientId() + ":" + this.getClientSecret(),
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    })
    .build()
    .execute(post, callback);
}
export function authorizationCodeGrant(code, callback) {
  return builder()
    .withPath("/api/token")
    .withBodyParameters({
      grant_type: "authorization_code",
      redirect_uri: this.getRedirectURI(),
      code: code,
      client_id: this.getClientId(),
      client_secret: this.getClientSecret(),
    })
    .withHeaders({ "Content-Type": "application/x-www-form-urlencoded" })
    .build()
    .execute(post, callback);
}
export function refreshAccessToken(callback) {
  return builder()
    .withPath("/api/token")
    .withBodyParameters({
      grant_type: "refresh_token",
      refresh_token: this.getRefreshToken(),
    })
    .withHeaders({
      Authorization:
        "Basic " +
        new Buffer.from(
          this.getClientId() + ":" + this.getClientSecret(),
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    })
    .build()
    .execute(post, callback);
}
