import { builder as b } from "./base-request";

var DEFAULT_HOST = "api.spotify.com",
  DEFAULT_PORT = 443,
  DEFAULT_SCHEME = "https";

export function builder(accessToken) {
  return b()
    .withHost(DEFAULT_HOST)
    .withPort(DEFAULT_PORT)
    .withScheme(DEFAULT_SCHEME)
    .withAuth(accessToken);
}
