import fs from 'fs'
import {S3Client,PutObjectCommand} from '@aws-sdk/client-s3';
import path from "path"
import 'dotenv/config';
const s3=new S3Client({
    endpoint:'https://s3.us-east-005.backblazeb2.com',
    region:'us-east-005',
    credentials:{
        accessKeyId:process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APP_KEY!,
    },
})

export const getAllFile= (folderPath:string)=>{
    let response:string []=[];
    const getAllfilesAndFolder=fs.readdirSync(folderPath)
    getAllfilesAndFolder.forEach(file => {
        const fullFilePath=path.join(folderPath,file);
        if(fs.statSync(fullFilePath).isDirectory()) {
            response=response.concat(getAllFile(fullFilePath))
        }
        else {
            response.push(fullFilePath);
        }

    });
    return response;
}