import QRCode from "qrcode";
import { urlEncoder } from "./url_engine.js";
import { urnEncoder } from "./urn_engine.js";
import {
  wifiEncoder,
  icalEncoder,
  vcardEncoder,
  marketEncoder,
  dataEncoder,
  magnetEncoder,
} from "./special_engine.js";
import {
  allowedUrlTypes,
  allowedUrnTypes,
  allowedSpecialTypes,
  allowedTypes
} from "./consts.js"

// const allowedUrlTypes = ["urlto", "http", "https", "ftp", "ftps"];
// const allowedUrnTypes = [
//   "mecard",
//   "bizcard",
//   "geo",
//   "mailto",
//   "smsto",
//   "mmsto",
//   "sms",
//   "mms",
//   "tel",
//   "facetime",
//   "facetime-audio",
//   "tel",
// ];
// const allowedSpecialTypes = ["vcard", "market", "ical", "magnet","wifi","data"];
// const allowedTypes = [
//   ...allowedUrlTypes,
//   ...allowedUrnTypes,
//   ...allowedSpecialTypes,
// ];

const encodeFuncs = {
  url: urlEncoder,
  urn: urnEncoder,
  vcard: vcardEncoder,
  ical: icalEncoder,
  market: marketEncoder,
  wifi: wifiEncoder,
  data: dataEncoder,
  magnet: magnetEncoder
};


function getType(data) {
  let key = data.type;
  if (allowedUrlTypes.includes(key)) {
    return "url";
  } else if (allowedUrnTypes.includes(key)) {
    return "urn";
  } else if (allowedSpecialTypes.includes(key)) {
    return key;
  } else {
    throw new Error("Encoding type is undefined");
  }
}

export default class QREncoder {
  constructor() {
    this.content = {};
    this.type = ""
    this.outFile = "output.png";
  }
  static async process(content, name = "") {
    const q = new QREncoder();
    q.init(content, name);
  }

  static async mock(content, name = "") {
    const q = new QREncoder();
    q.init(content, name);
    try {
      return await this.encode(false);
    } catch (err) {
      // console.log(err);
      throw new Error("Encoder.init caught:" + err.message || "", {
        cause: err,
      });
    }
  }

  async init(contentObj, name) {
    if (!contentObj) {
      console.log("unable to Encode Empty content");
      process.exit();
    }
    // let dataKey = parseType(this.conmtent)
    // if (!allowedTypes.includes(datakey)){
    //   console.log("unable to Encode undefined content type");
    //   process.exit();
    // }
    this.type = getType(contentObj);
    this.content = contentObj;
    if (this.content.name) this.outFile = "./" + this.content.name + ".png";
    else this.outFile = "./" + name + ".png";

    try {
      return await this.encode();
    } catch (err) {
      throw new Error("Encoder.init caught:" + err.message || "", {
        cause: err,
      });
    }
  }

  async encode(bFull = true) {
    //check the type of info to encode
    //this.outFile = this.content.outFile || this.outFile;

    //parse content and convert it to a proper "encodeable" string
    // ....
    let encoded = encodeFuncs[this.type](this.content);

    if (!bFull) return encoded;

    // encode it to a image file
    try {
      // console.log("Encoder.encode", this.content, "to", this.outFile);
      return await QRCode.toFile(this.outFile, encoded, {});
    } catch (err) {
      // console.log(err);
      throw new Error("Encoder encode Caught" + err.messsage || "", {
        cause: err,
      });
    }
    // QRCode.toFile(this.outFile, this.content, {}, (err, data) => {
    //   if (err) {
    //     console.error("Error:", err.message);
    //     process.exit(1);
    //   }
    // });
    //return `Data encoded as ${this.outFile}`;
  }
}
