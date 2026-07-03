import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import "dotenv/config"
const s3 = new S3Client({
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  region: "us-east-005",
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
});
export async function downloadFolder(prefix: string) {
  console.log(prefix);
  const allFiles = await s3.send(
    new ListObjectsV2Command({
      Bucket: "uploader1",
      Prefix: prefix,
    }),
  );
  console.log(allFiles);
  const allPromise =
    allFiles.Contents?.map(async ({ Key }) => {
        if (!Key) {
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);
      console.log(finalOutputPath);
      
        // const outputFile=fs.createWriteStream(finalOutputPath);
        const dirName = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }

        const response = await s3.send(
          new GetObjectCommand({
            Bucket: "uploader1",
            Key,
          }),
        );
        await new Promise<void>((resolve, reject) => {
          const outputFile = fs.createWriteStream(finalOutputPath);
          (response.Body as Readable)
            .pipe(outputFile)
            .on("finish", resolve)
            .on("error", reject);
        });

    }) || [];
  console.log("awaiting");
  await Promise.all(allPromise);
}
