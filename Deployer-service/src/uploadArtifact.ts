import fs from 'fs'
import {S3Client,PutObjectCommand} from '@aws-sdk/client-s3';
import 'dotenv/config';
const s3=new S3Client({
    endpoint:'https://s3.us-east-005.backblazeb2.com',
    region:'us-east-005',
    credentials:{
        accessKeyId:process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APP_KEY!,
    },
})
export const uploadArtifact= async (fileName:string,localFilePath:string)=>{
    const fileContent=fs.readFileSync(localFilePath);
     const s3Key = fileName.replace(/\\/g, '/');
    const response=await s3.send(new PutObjectCommand({
        Bucket:"uploader1",
        Body:fileContent,
        Key:s3Key,
    }));
    console.log(response);
}