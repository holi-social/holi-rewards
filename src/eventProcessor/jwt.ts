import { createRemoteJWKSet, errors, jwtVerify } from "@panva/jose";

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
