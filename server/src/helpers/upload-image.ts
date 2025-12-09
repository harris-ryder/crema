import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import config from "../../config.ts";
import { imageMimeTypes } from "../mime.ts";
import { selectPostSchema } from "../db/schema.types.ts";

export const uploadImageParams = z.object({
  file: z.instanceof(File),
});

export const uploadImage = z
  .function()
  .args(uploadImageParams)
  .returns(z.promise(selectPostSchema.shape.image_uri))
  .implement(async ({ file }) => {
    if (
      !Object.values(imageMimeTypes).some((mimeType) =>
        file.type.startsWith(mimeType)
      )
    ) {
      throw new Error(
        "Invalid file type, only the following types are allowed: " +
          Object.values(imageMimeTypes).join(", ")
      );
    }

    const fileExtension = path.extname(file.name);
    const uri = randomUUID() + fileExtension;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const dir = path.join(config.storage.dataPath, "images");

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, uri), fileBuffer);

    return uri;
  });
