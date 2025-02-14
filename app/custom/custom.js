/*
Example of a custom encoder decoder
Dont' forget to create  the related "custom.test.js" on specs/
and be sure it passes correctly
*/


const kvSep = ":"
const elemSep = ";"

// should return some kind of object structure
export function customParser(str) {
  const customObj = { type: "" };
  const arr = str.split(kvSep);
  customObj.type = arr.shift().toLowerCase()
  // process the incoming string here 
  // and generate your custome Object
  // ie :
  str=arr.join(kvSep)
  let parts = str.split(elemSep)
  parts.map(el => {
    const [key,value ] = el.split(kvSep)
    customObj[key] = value
  }) 
  // And return your custom Object
  return customObj;
}


// should return some kind of  compact string to encode in a QR
export function customEncoder(customObj) {
  let ret = "";
  ret += customObj.type.toUpperCase() + kvSep;
  // process you custom object here 
  // ie:
  for (const key of Object.keys(customObj)){
    if (key != "type"){
      ret += `${key}${kvSep}${customObj[key]}${elemSep}`
    }
  }
  // kill the last elemSep
  return ret.slice(0, -1);
}
