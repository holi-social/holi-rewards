import {
  createRemoteJWKSet,
  errors,
  type JWTPayload,
  jwtVerify,
} from "@panva/jose";
import { HEADER } from "@std/http/unstable-header";
import { getLogger } from "../logger.ts";
import { requireEnv } from "../utils.ts";

const logger = getLogger("eventProcessor", "jwt");

export const googleJWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

export const shouldSkipJwtVerification = () =>
  Deno.env.has("SKIP_JWT_VERIFICATION");

export const verifyGoogleJWT = async (token: string): Promise<boolean> => {
  const matchEmail = requireEnv("JWT_EMAIL");

  try {
    const { payload } = await jwtVerify<JWTPayload & { email: string }>(
      token,
      googleJWKS,
    );

    if (payload.email !== matchEmail) {
      throw new errors.JWTClaimValidationFailed(
        "email does not match",
        payload,
        "email",
      );
    }

    return true;
  } catch (e) {
    if (
      e instanceof errors.JWSInvalid ||
      e instanceof errors.JWSSignatureVerificationFailed ||
      e instanceof errors.JWTClaimValidationFailed
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
