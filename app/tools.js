import {
  allowedUrlTypes,
  allowedUrnTypes,
  allowedSpecialTypes,
  allowedTypes,
} from "./consts.js"

export function identifyRaw(rawStr){
  let pre = rawStr.split(/\:/) || [];
  let kind = pre[0].replace(/"/, "") || "";
  let type=""
  // const urls = ["URLTO", "HTTP", "HTTPS", "FTP", "FTPS"];
  // const urns = [
  //   "MAILTO",
  //   "TEL",
  //   "SMS",
  //   "MMS",
  //   "SMSTO",
  //   "MMSTO",
  //   "MECARD",
  //   "BIZCARD",
  //   "GEO",
  //   "FACETIME",
  //   "FACETIME-AUDIO",
  // ];
  // const special = ["WIFI", "MARKET", "MAGNET", "DATA"];
  kind = kind.toLowerCase()
  if (allowedUrlTypes.includes(kind.toUpperCase())) {
    type = "url"; //kind.toLowerCase();
  } else if (allowedUrnTypes.includes(kind.toUpperCase())) {
    type = "urn"; //kind.toLowerCase();
  } else if (kind.toUpperCase() == "BEGIN") {
    if (pre[1].toUpperCase() == "VCARD") {
      type = "vcard";
    } else if (pre[1].toUpperCase() == "VEVENT") {
      type = "ical";
    }
  } else if (allowedSpecialTypes.includes(kind)) {
    type = kind.toLowerCase();
  }
  return type
}
