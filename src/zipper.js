import {createWriteStream} from "fs"
import {v1 as uuid1 } from "uuid"
import { join } from "path";
import archiver from "archiver-promise"
import { TYPE } from "./store";

export default async (content )=>{

    
    

            const outputFile= join(__dirname,"..","temp",uuid1() + ".zip")
            const archive = archiver("zip")
            const writeStream = createWriteStream(outputFile);
            archive.pipe(writeStream)
           
            if(content.type == TYPE.FOLDER){
                 archive.directory(content.path,content.mask)
            }else {

                archive.file(content.path)
            }
 
            await archive.finalize()
            return outputFile;
    }
 
 