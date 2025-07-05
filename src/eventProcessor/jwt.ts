import { createRemoteJWKSet, errors, jwtVerify } from "@panva/jose";
import { getLogger } from "../logger.ts";
import { HEADER } from "@std/http/unstable-header";

const logger = getLogger("eventProcessor", "jwt");

export const googleJWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

export const verifyGoogleJWT = async (token: string): Promise<boolean> => {
  try {
    await jwtVerify(token, googleJWKS);
    return true;
  } catch (e) {
    if (
      e instanceof errors.JWSInvalid ||
      e instanceof errors.JWSSignatureVerificationFailed
    ) {
      return false;
    }

    throw e;
  }
};

export const extractJwt = (request: Request): string | undefined => {
  const header = request.headers.get(HEADER.Authorization);
  if (!header) {
    logger.info`Authorization header is not set`;
    return undefined;
  }

  const match = header.match(/^Bearer (.+)$/i);
  if (!match) {
    logger.error("Could not extract JWT from authorization header", {
      authorizationHeader: header,
    });
    return undefined;
  }

  return match[1];
};
