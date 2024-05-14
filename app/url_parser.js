// format spec
/*
  URLTO|HTTP|HTTPS|FTP|FTPS:<info>
*/

export function urlParse(str) {
  const ret = { data: "" };
  const elemSep = /\:/;
  const arr = str.split(elemSep);
  if (arr[0] == "URLTO") {
    // Non standard but seen
    arr.shift();
    ret.data = arr.join(":");
  } else {
    ret.data = str;
  }
  return ret;
}
