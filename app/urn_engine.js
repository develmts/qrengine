const maps = {
  mecard: { N: "name", ADR: "address", TEL: "tlf", EMAIL: "email" },
  bizcard: {
    N: "name",
    X: "surname",
    T: "title",
    C: "company",
    A: "address",
    B: "tlf",
    E: "email",
  },
};

export function urnParser(str) {
  const elemSep = /\;/;
  const kvSep = /\:/;
  const arr = str.split(elemSep);
  let parts = arr.shift().split(kvSep);
  let id = parts.shift().toLowerCase();
  const ret = { type: id };
  
  switch (id) {
    case "mecard":
    case "bizcard":
      ret[maps[id][parts[0]]] = parts[1];
      for (let x = 0; x < arr.length; x++) {
        if (arr[x] == "") continue;
        const [k, v] = arr[x].split(kvSep);
        ret[maps[id][k]] = v;
      }
      break;
    case "geo":
      const coordSep = /\,/;
      const vArr = parts[0].split(coordSep);
      ({ 0: ret.lat, 1: ret.lon, 2: ret.height } = vArr);
      break;
    case "mailto":
    case "smsto":
    case "mmsto":
    case "sms":
    case "mms":
    case "tel":
    case "facetime":
    case "facetime-audio":
    case "tel":
      ret["data"] = parts.join(":");
      break;
    /* c8 ignore start */
    default:
      throw new Error('invalid urn type: ' + type)
      break;
    /* c8 ignore end */  
  }
  return ret;
}

export function urnEncoder(urnObj) {
  /* expected format 
  urnObj = {
    type: "" // one of "mecard, bizcard, geo, mailto, smsto, mmsto: tel, facetime, facetime-audio"
    data : "" //depends on type: single string for most of them excep geo, mecard, bizcard which use the above format
  }
  */
  let ret = ""
  if (urnObj.type == "mecard") {
    //"MECARD:N:Owen,Sean;ADR:76 9th Avenue, 4th Floor, New York, NY 10011;TEL:12125551212;EMAIL:srowen@example.com;;";
    ret = "mecard".toUpperCase() +":"
    ret += urnObj.name ? "N:" + urnObj.name : "";
    ret += urnObj.address ? ";ADR:" + urnObj.address : "";
    ret += urnObj.tlf ? ";TEL:" + urnObj.tlf : "";
    ret += urnObj.email ? ";EMAIL:" + urnObj.email : "";
    ret += ";;";
  } else if (urnObj.type == "bizcard") {
    // "BIZCARD:N:Sean;X:Owen;T:Software Engineer;C:Google;A:76 9th Avenue, New York, NY 10011;B:+12125551212;E:srowen@google.com;;";
    ret = "bizcard".toUpperCase() + ":"
    ret += urnObj.name ? "N:" + urnObj.name : ""
    ret += urnObj.surname ? ";X:" + urnObj.surname : ""
    ret += urnObj.title ? ";T:" + urnObj.title : ""
    ret += urnObj.company ? ";C:" + urnObj.company : ""
    ret += urnObj.address ? ";A:" + urnObj.address : ""
    ret += urnObj.tlf ? ";B:" + urnObj.tlf: ""
    ret += urnObj.email ? ";E:" + urnObj.email : ""
    ret += ";;";
  } else if (urnObj.type == "geo") {
    //"GEO:40.71872,-73.98905,100";
    ret =
      urnObj.type.toUpperCase() + ":" + urnObj.lat + "," + urnObj.lon + "," + urnObj.height;
  } else { 
    // mailto, smsto, mmsto: tel, facetime, facetime-audio
    ret = urnObj.type.toUpperCase() + ":" + urnObj.data;
  }
  return ret;
}

