// format spec
/*
  URLTO|HTTP|HTTPS|FTP|FTPS:<info>
*/

export function urlParser(str) {
  const ret = { type: "", data: "" };
  const elemSep = /\:/;
  const arr = str.split(elemSep);
  if (arr[0] == "URLTO") {
    // Non standard but seen
    ret.type = arr[0]
    arr.shift();
    ret.data = arr.join(":");
  } else {
    ret.type = arr[0]
    arr.shift();
    ret.data = arr.join(":");
  }
  return ret;
}
export function urlEncoder(urlObj) {
  let ret = "";
  ret += urlObj.type;
  for (let p of Object.keys(urlObj)) {
    if (p == "type") continue;
    ret += ":" + urlObj[p];
  }
  return ret;
}

