import { createRemoteJWKSet, jwtVerify } from "jose";

const BaseURL = process.env.NEXT_API_CLIENT_URL;

if (!BaseURL) {
  throw new Error("NEXT_API_CLIENT_URL is missing!");
}

const JWKS = createRemoteJWKSet(new URL(`${BaseURL}/api/auth/jwks`));

const SellerAuthVerify = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Access denied",
    });
  }

  const token = authHeader
    .slice(7)
    .trim()
    .replace(/^"(.*)"$/, "$1");

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Token missing",
    });
  }

  // A JWT has three dot-separated parts: header.payload.signature
  if (token.split(".").length !== 3) {
    console.error("Token validation failed: malformed JWT format");
    return res.status(401).json({
      status: "error",
      message: "Invalid token format. Expected a Bearer JWT.",
    });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: BaseURL,
      audience: BaseURL,
      // Better Auth signs with EdDSA by default; accept RS256 as well if the
      // JWKS keys are ever switched to RSA. The JWKS itself pins each key's alg.
      algorithms: ["EdDSA", "RS256"],
    });

    req.user = {
      ...payload,
      id: payload.id ?? payload.sub,
    };

    if (req.user.role !== "seller") {
      return res.status(403).json({
        status: "error",
        message: "Permission denied",
      });
    }

    return next();
  } catch (error) {
    console.error("Token validation failed:", error.message);

    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};

export default SellerAuthVerify;
