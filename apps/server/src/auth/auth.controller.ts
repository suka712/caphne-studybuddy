import { Request, Response } from "express";
import { loginWithGoogle } from "./auth.service.js";

export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  const result = await loginWithGoogle(idToken);

  res.json({
    success: true,
    ...result,
  });
};
