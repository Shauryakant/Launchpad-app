import dotenv from "dotenv";
import { downloadFolder } from "./downloadFolder.js";
import { buildProjectLocal } from "./buildProject.js";
import { Redis } from "@upstash/redis";
dotenv.config({
  path: ".env",
});

console.log(process.env.B2_KEY_ID);
import { rmSync } from "node:fs";
import path from "path";
import { getAllFile } from "./getAllBuiltArtifact.js";
import { uploadArtifact } from "./uploadArtifact.js";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function main() {
  while (1) {
    const response = await redis.rpop("build-queue");
    if (response !== null) {
      console.log(response);
      await redis.hset("status", { [response]: "Deploying" });
      await downloadFolder(`output/${response}`);
      await buildProjectLocal(`${response}`);
      const files = getAllFile(path.join(__dirname, `output/${response}/dist`));
      console.log(files);
      const pathTillInner = path.join(__dirname, `output/${response}/dist`);
      files.forEach(async (file) => {
        await uploadArtifact(
          `dist/${response}/` + file.slice(pathTillInner.length + 1),
          file,
        );
        console.log("uploaded file:", file);
      });
      await redis.hset("status", { [response]: "Deployed" });
      rmSync(path.join(__dirname, `output/${response}`), {
        recursive: true,
        force: true,
      });
      console.log("Cleaned up", response);
    }
  }
}

main();
