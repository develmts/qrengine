import Jimp from "jimp";
import jsQR from "jsqr";

import { urlParser } from "./url_engine.js";
import { urnParser} from "./urn_engine.js";
import {
  wifiParser,
  icalParser,
  vcardParser,
  marketParser,
  magnetParser,
  dataParser
} from "./special_engine.js";
import * as T  from "./tools.js"

const _extractQR = async (imageFile) => {
  try {
    // Load the image with Jimp
    const image = await Jimp.read(imageFile);

    // Get the image data
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height,
    };

    // Use jsQR to decode the QR code
    const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);

    if (!decodedQR) {
      throw new Error("QR code not found in the image.");
    }

    return decodedQR.data;
  } catch (error) {
    console.error("Error decoding QR code:", error);
  }
};

const parseFuncs = {
  url: urlParser,
  urn: urnParser,
  vcard: vcardParser,
  ical: icalParser,
  market: marketParser,
  wifi: wifiParser,
  magnet: magnetParser,
  data: dataParser
};

export default class QRDecoder {
  constructor() {
    this.content = "";
    this.data = {};
    this.info = "";
  }

  static async process(image) {
    const q = new QRDecoder();
    if (await q.init(image)) {
      return q.data.value
    } else {
      return q.info;
    }
  }
  static async mock(data) {
    const q = new QRDecoder();
    q.content = data;
    if (await q.decode(data)) {
      return q.data.value
    } else {
      return q.info;
    }
  }

  async init(imageFile) {
    if (!imageFile) {
      this.info = "No image to process";
      return false;
    }
    try {
      // Extract data from image
      this.content = await _extractQR(imageFile);
    } catch (err) {
      this.info = err;
      return false;
    }
    return this.decode();
  }

  decode() {
    this.type = T.identify(this.content)
    if (this.type) {
      return this.parse();
    }
    this.info = "Unable to identify data format";
    return false;
  }

  show() {
    return this.data.value;
  }

  // identify() {
  //   let done = false;
  //   let pre = this.content.split(/\:/) || [];
  //   let kind = pre[0].replace(/"/, "") || "";
  //   const urls = ["URLTO", "HTTP", "HTTPS", "FTP", "FTPS"];
  //   const urns = [
  //     "MAILTO",
  //     "TEL",
  //     "SMS",
  //     "MMS",
  //     "SMSTO",
  //     "MMSTO",
  //     "MECARD",
  //     "BIZCARD",
  //     "GEO",
  //     "FACETIME",
  //     "FACETIME-AUDIO",
  //   ];
  //   const special = ["WIFI", "MARKET", "MAGNET", "DATA"];

  //   if (urls.includes(kind.toUpperCase())) {
  //     this.type = "url"; //kind.toLowerCase();
  //     done = true;
  //   } else if (urns.includes(kind.toUpperCase())) {
  //     this.type = "urn"; //kind.toLowerCase();
  //     done = true;
  //   } else if (kind.toUpperCase() == "BEGIN") {
  //     if (pre[1].toUpperCase() == "VCARD") {
  //       this.type = "vcard";
  //       done = true;
  //     } else if (pre[1].toUpperCase() == "VEVENT") {
  //       this.type = "ical";
  //       done = true;
  //     }
  //   } else if (special.includes(kind.toUpperCase())) {
  //     this.type = kind.toLowerCase();
  //     done = true;
  //   }
  //   return done;
  // }

  parse() {
    this.data = {
      type: this.type,
      value : parseFuncs[this.type](this.content)
    }
    return true;
  }
}
