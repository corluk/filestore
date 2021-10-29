import FileStore, { TYPE } from "../src/store"
import{join} from "path" 
import {expect} from "chai"

let fileStore = null;

beforeAll(async ()=>{

    fileStore = await FileStore( {"/assets1":join(__dirname,"assets1") , 
        "/assets2":join(__dirname,"assets2")
    })


})


test("should return content of directory",async ()=>{

   const content =  fileStore.get("/assets1/")
    expect(content).not.null
    expect(content.type).to.be.equal(TYPE.FOLDER)
})

test("should  return throw path not found ",async ()=>{

    
     expect(fileStore.get.bind("/assets/")).to.throw(`path not found`)
     
 })

 test("should  return throw file not found",async ()=>{

    
    expect( () =>{
        fileStore.get("/assets1/test1.txt")
    }).to.throw(`file not found`)
    
})

test("should  find file testfile1 ",async ()=>{

    
    let  content = fileStore.get("/assets1/testfile1.txt")
   
    expect(content).not.null
    
})

test("should return content of directory in assets2/folder2",async ()=>{

    const content =  fileStore.get("/assets2/folder2/")
     expect(content).not.null
     expect(content.type).to.be.equal(TYPE.FOLDER)
 })
 test("should return content of directory in assets2/folder2/testfile2.txt",async ()=>{

    const content =  fileStore.get("/assets2/folder2/testfile2.txt")
     expect(content).not.null
     expect(content.type).to.be.equal(TYPE.FILE)
 })