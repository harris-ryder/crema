import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { config } from "../config.ts";
import { imageMimeTypes } from "../mime.ts";
import { selectPostImageSchema } from "../db/schema.types.ts";

export const uploadImageParams = z.object({
  file: z
    .instanceof(File)
    .refine((file) => imageMimeTypes.includes(file.type), {
      message:
        "Invalid file type. Only PNG, JPEG, and WebP images are allowed.",
    }),
});

export const uploadImage = z
  .function()
  .args(uploadImageParams)
  .returns(z.promise(selectPostImageSchema.shape.image_uri))
  .implement(async ({ file }) => {
    if (!imageMimeTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type, only the following types are allowed: " +
          imageMimeTypes.join(", ")
      );
    }

    const fileExtension = path.extname(file.name);
    const uri = randomUUID() + fileExtension;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const dir = path.join(config.dataPath, "images");

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, uri), fileBuffer);

    return uri;
  });
