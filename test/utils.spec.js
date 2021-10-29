import {Zipper} from ".." 
import FileStore from "../src/store"
import{join} from "path" 
import { expect } from "chai";
 

let fileStore = null;

beforeAll(async ()=>{

    fileStore = await FileStore( {"/assets1":join(__dirname,"assets1") , 
        "/assets2":join(__dirname,"assets2")
    })


})
jest.setTimeout(5000*10)
test(" should zip testfile2.txt",async ()=>{

     
     
    
    const content =  fileStore.get("/assets1/")
    
    const resolveValue = await Zipper(content)
    expect(resolveValue).not.null
    
})