import express from "express";
import cors from "cors";
import { rmSync } from "node:fs";
import { simpleGit } from "simple-git";
import { generate } from "./utils.js";
import { fileURLToPath } from "node:url";
import { uploadFile } from "./uploadFile.js";
import path from "node:path";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
import { getAllfiles } from "./getAllFile.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());

// await redis.lpush("build-queue", "shaurya");
// const hr=await redis.rpop("tasks");
// console.log(hr);

app.use(cors());

const git = simpleGit();
app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generate();
  await redis.hset("status", { [id]: "uploading" });
  await git.clone(repoUrl, path.join(__dirname, `output/${id}`));
  console.log("Cloned");
  const files = getAllfiles(path.join(__dirname, `output/${id}`));
  files.forEach(async (file) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  });
  console.log(files);
  console.log(repoUrl);
  await redis.lpush("build-queue", id);
  rmSync(path.join(__dirname, `output/${id}`), {
    recursive: true,
    force: true,
  });
  console.log("Cleaned up", id);
  await redis.hset("status", { [id]: "uploaded" });
  res.json({
    id: id,
  });
});
app.get("/status", async (req, res) => {
  const id = req.query.id;
  const response = await redis.hget("status", id as string);
  res.json({
    status: response,
  });
});

app.listen(3000);
