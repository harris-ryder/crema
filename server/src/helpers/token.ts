import { z } from "zod";
import { selectUserSchema } from "../db/schema.types.ts";
import config from "../../config.ts";
import jwt from "jsonwebtoken";

export const createTokenSchema = selectUserSchema.pick({ id: true });
export const createToken = z
  .function()
  .args(createTokenSchema)
  .returns(z.string())
  .implement((user) => {
    const { id } = user;
    return jwt.sign({ id }, config.jwt.secret);
  });

export const verifyToken = z
  .function()
  .args(z.object({ token: z.string() }))
  .returns(createTokenSchema.nullable())
  .implement(({ token }) => {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as z.infer<
        typeof createTokenSchema
      >;
      return payload;
    } catch (error) {
      console.error(error);
      return null;
    }
  });
