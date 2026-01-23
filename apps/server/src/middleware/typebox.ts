import { NextFunction, Request, Response } from "express";
import { TSchema } from "typebox";
import Compile from "typebox/compile";

export function typeboxMiddleware(schema: TSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const C = Compile(schema);
    const valid = C.Check(req.body);
    if (!valid) {
      return res
        .status(400)
        .json({ message: "Invalid request body", errors: C.Errors(req.body) });
    }
    next();
  };
}
