import jwt from "jsonwebtoken";

interface AccessTokenPayload {
  userId: number;
}

export const signAccessToken = (payload: AccessTokenPayload) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("Missing JWT_ACCESS_SECRET");
  }

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "7d",
  });
};
