import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
export const uploadArtifact = async (
  fileName: string,
  localFilePath: string,
) => {
  const fileContent = fs.readFileSync(localFilePath);
  const s3Key = fileName.replace(/\\/g, "/");
  const response = await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_ACCESS_POINT_ARN!,
      Body: fileContent,
      Key: s3Key,
    }),
  );
  console.log(response);
};
