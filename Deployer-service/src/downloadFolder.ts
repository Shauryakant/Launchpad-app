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
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
export async function downloadFolder(prefix: string) {
  console.log(prefix);
  const allFiles = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_ACCESS_POINT_ARN!,
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
            Bucket: process.env.AWS_S3_ACCESS_POINT_ARN!,
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
