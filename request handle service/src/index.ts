import express from "express";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  Bucket$,
  Type,
} from "@aws-sdk/client-s3";
import path from "path";
import "dotenv/config";
import type { Readable } from "stream";
const s3 = new S3Client({
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  region: "us-east-005",
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
});
const app = express();
app.use(async (req, res) => {
  const host = req.hostname;
  console.log(host);
  const id = host.split(".")[0];
  console.log(id);
  let filePath = req.path;
  if (filePath == "/") {
    filePath = "/index.html";
  }
  const key = `dist/${id}${filePath}`;
  const contents = await s3.send(
    new GetObjectCommand({
      Bucket: "uploader1",
      Key: key,
    }),
  );
  const type = filePath.endsWith(".html")
    ? "text/html"
    : filePath.endsWith(".css")
      ? "text/css"
      : filePath.endsWith(".js")
        ? "application/javascript"
        : filePath.endsWith(".svg")
          ? "image/svg+xml"
          : filePath.endsWith(".png")
            ? "image/png"
            : "application/octet-stream";
  res.set("Content-Type", type);
  (contents.Body as Readable).pipe(res);
});

app.listen(3001);
