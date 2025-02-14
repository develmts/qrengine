import t from "tap";
import * as eng from "../urn_engine.js";
import {aRnd, rndStr, rndTLD} from "./test_tools.js";

const maxAllowedHeight = 60000
const allowedTypes = "mecard,bizcard,geo,mailto,smsto,mmsto,tel,facetime,facetime-audio".toUpperCase().split(",")
const aTLD= "com|org|net|edu".split("|")

// const aRnd = (arr) => { return  arr[Math.floor(Math.random() * arr.length)] }
// const rndStr = () => {return `${Math.random().toString(36).slice(2, 15)}${Math.random().toString(36).slice(2, 15)}` }
// const rndTLD = () => { return aRnd(aTLD)}

const fixed = {
  mecard : {
    raw: "MECARD:N:Owen,Sean;ADR:76 9th Avenue, 4th Floor, New York, NY 10011;TEL:12125551212;EMAIL:srowen@example.com;;",
    data : {
      type: 'mecard',
      name: 'Owen,Sean',
      address: '76 9th Avenue, 4th Floor, New York, NY 10011',
      tlf: '12125551212',
      email: 'srowen@example.com'
    },
  },
  bizcard : {
    raw: "BIZCARD:N:Sean;X:Owen;T:Software Engineer;C:Google;A:76 9th Avenue, New York, NY 10011;B:+12125551212;E:srowen@google.com;;",
    data : {
      type: 'bizcard',
      name: 'Sean',
      surname: 'Owen',
      title: 'Software Engineer',
      company: 'Google',
      address: '76 9th Avenue, New York, NY 10011',
      tlf: '+12125551212',
      email: 'srowen@google.com'
    }
  }
}

function randGeo(){
  let lat = Math.round(Math.random()* 90 *100000) / 100000
  let lng = Math.round(Math.random()* 180 * 1000000) / 100000
  let hei = Math.round(Math.random() * maxAllowedHeight * 1000) / 1000
  return `GEO:${lat}${Math.random() < 0.5? "N": "S"},${lng}${Math.random < 0.5? "E": "W"},${hei}`
}

function randomGen(pType){
  const type= pType.toLowerCase()
  let token=null
  switch(type){
    case "mecard":
      return "MECARD:N:Owen,Sean;ADR:76 9th Avenue, 4th Floor, New York, NY 10011;TEL:12125551212;EMAIL:srowen@example.com;;"
    case "bizcard":
      return "BIZCARD:N:Sean;X:Owen;T:Software Engineer;C:Google;A:76 9th Avenue, New York, NY 10011;B:+12125551212;E:srowen@google.com;;";
    case "geo":
      return randGeo()
    case "mailto":
      return "MAILTO:"+rndStr()+"@"+rndStr().slice(0,7)+"."+rndTLD()
    case "smsto":
      token = "SMSTO"
    case "mmsto":  
      token = token || "MMSTO"
    case "tel":
      token = token || "TEL"
      return token+":" + Math.floor(Math.random()* 100000000000)
    case "facetime":
      token="FACETIME"
    case "facetime-audio":
      token= token || "FACETIME-AUDIO"
      if (Math.random() < 0.5)
        return token+":"+randomGen("tel").split(":")[1]
      else
        return token+":"+randomGen("mailto").split(":")[1]
    default:
        return ""
  }
}

t.test("URL engine:", t => {
  let urn= {}
  // for each allowed type, both tests
  for ( let type of allowedTypes){
    // uinfortunately, not all can be easily randomized
    if (["mecard,bizcard"].includes(type)){
      urn = fixed[type]
    }else{
      urn= {
        raw: randomGen(type),
        data: {}
      }
      urn.data = eng.urnParser(urn.raw)
    }
    //console.log("D", urn.data, "W" , eng.urnEncoder(urn.data), "R", urn.raw)    
    
    t.strictSame(eng.urnParser(urn.raw), urn.data,  `able to decode ${type} URN's`)
    t.equal(eng.urnEncoder(urn.data), urn.raw,  `able to encode ${type} URn's`)
  }
  t.end()
})