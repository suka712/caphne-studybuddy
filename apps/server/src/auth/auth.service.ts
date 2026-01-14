import { verifyGoogleToken } from "../oauth/google.oauth.js";
import { signAccessToken } from "../jwt/signToken.js";
import { db } from "../db/db.js";
import { users } from "../models/User.js";

export const loginWithGoogle = async (idToken: string) => {
  const payload = await verifyGoogleToken(idToken);

  if (!payload?.email) throw new Error("Invalid Google token");

  let user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, payload.email),
  });

  if (!user) {
    await db.insert(users).values({
      email: payload.email,
      name: payload.name,
      provider: "google",
    });
  } else {
    const accessToken = signAccessToken({ userId: user.id });

    return { user, accessToken };
  }
};
