import  { extname,join ,basename  } from "path"
import fs from "fs"

export const TYPE  = {
    FILE  : "file",
    FOLDER  : "folder"
} 

export const MIMETYPE ={
    "js" : "application/javascript",
    "json" : "application/json",
    "txt" : "text/plain", 
    "html" : "text/html",
    "octet" : "application/octet-stream", 

} 
 
const getContentType = path=>{

    const ext = extname(path).replace(/^\./,"")
    const keys = Object.keys(MIMETYPE) 
    if(keys.includes(ext)){
        return MIMETYPE[ext]
    }
    return MIMETYPE.octet

        
  }
const Store =   (mask,rootDir) => {
        const store = []
        const root = rootDir.replace(/\\/g,"/")
        const load =async () => {  
            
            async function* walk(dir,dirObj) {
            
                for await  (const d of await fs.promises.opendir(dir)) {
                    const entry = join(dir, d.name);
                    let filePath = entry.replace(/\\/g,"/")
                    if (d.isDirectory()) {
                    const dirObj = {
                        type : TYPE.FOLDER  , 
                        files : [],
                        path  : filePath + "/",
                    // absolutePath : path.resolve(path.join(root,filePath))
                    }
                        store.push(dirObj)
                        yield* walk(entry,dirObj);
                    }

                    else if (d.isFile()) yield {entry:entry,dirObj:dirObj};
                }
            
            }
            let initialDir = {
                type : TYPE.FOLDER,
                files : [],
                path : root + "/" 
            }
            store.push(initialDir)
            for await   (let  fileObject  of walk(root,initialDir)){
                
            let  filePath = fileObject.entry.replace(/\\/g,"/")
            const obj =  {
                
                basename : basename(filePath),
                ext : extname(filePath),
                path  : filePath,
                contentType : getContentType(filePath),
                type: TYPE.FILE,
                
            }
            fileObject.dirObj.files.push(obj)
            store.push(obj)
                
            }
            return store; 
        }
    const normalizePath = (path)=>{

        if(store.length<1){
            throw new Error("store not have any item or not loaded yet")
        }
        let regexMask = new RegExp("^"+mask)
        if(regexMask.test(path)){
            path = path.replace(mask,root)
       }
       path = path.replace(/\\/g,"/")
      

       return path;
    }
     

    return {
        load : async ()=> await load(),
        getRoot : ()=> rootDir  , 
        get : (path)=>{
           
            path = normalizePath(path)
            let fileObject = store.find(item=>  item.path === path)
            
            if(!fileObject){

                    throw new Error(`file not found`)                
            }
            return fileObject
          
        }

    }
}
export default  async (config)=>{

    
    const Stores = {}
    const findMatch = (path,stores)=>{
        
        let prefixes = Object.keys(stores)
        prefixes = prefixes.sort((a,b)=>  a.length < b.length)
        for(let prefix of prefixes){
            let regex = new RegExp("^"+prefix)
            if(regex.test(path)){
                    return [prefix,stores[prefix]]
            }
        }
        throw new Error(`path not found`)
    }
    const masks  = Object.keys(config);
    const folders  = Object.values(config);
    const promises = []
    for(let i = 0; i!= folders.length;i++){
        Stores[masks[i]] = Store(masks[i],folders[i])
        promises.push(Stores[masks[i]].load())

    }   
    await Promise.all(promises)
    
    return {
        get : (path,type=TYPE.FILE)=>{

            const [prefix , store  ]   = findMatch(path,Stores)
            path =  path.replace(prefix,store.getRoot())
            return store.get(path,type)
        }
    }
     
}