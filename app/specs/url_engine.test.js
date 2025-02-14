import t from "tap";
import * as eng from "../url_engine.js";
import {aRnd, rndStr} from "./test_tools.js";

const allowedProtocols = "URLTO|HTTP|HTTPS|FTP|FTPS".split("|")
const secProt = "HTTP|HTTPS|FTP|FTPS".split("|")

// const aRnd = (arr) => { return  arr[Math.floor(Math.random() * arr.length)] }
// const rndStr = () => {return `${Math.random().toString(36).slice(2, 15)}${Math.random().toString(36).slice(2, 15)}` }


t.test("URL engine:", t => {
  // for each allowed protocol, both tests
  for ( let protocol of allowedProtocols){
    let data = rndStr()
    let url = protocol+":"
    if (protocol == "URLTO"){
      data = aRnd(secProt).toLowerCase()+"://"+data
    }
    url += data
    
    let urlData = {type: protocol, data:data}
    let urlRaw = url
    //console.log(urlRaw,urlData)    
    t.strictSame(eng.urlParser(urlRaw), urlData,  `able to decode ${protocol} URL's`)
    t.equal(eng.urlEncoder(urlData), urlRaw,  `able to encode ${protocol} URL's`)
  }
  t.end()
})