import path from "node:path";
import fs from "fs";
export const getAllfiles=(folderPath:string)=>{
    let response:string []=[];
    const getAllfilesAndFolder=fs.readdirSync(folderPath);
    getAllfilesAndFolder.forEach(file => {
        const fullFilePath=path.join(folderPath,file);
        if(fs.statSync(fullFilePath).isDirectory()) {
            response=response.concat(getAllfiles(fullFilePath))
        }
        else {
            response.push(fullFilePath);
        }

    });
    return response
}