import Jimp from "jimp";
import jsQR from "jsQR";
//import { wifiParse } from "./wifi_decoder.js";
import { urlParse } from "./url_parser.js";
import { urnParse } from "./urn_parser.js";
import {
  wifiParse,
  icalParse,
  vcardParse,
  marketParse,
} from "./special_parser.js";

// import { magnetParse } from "@ctrl/magnet-link";

// const isEmpty = (el) => {
//   //function isEmpty(el) {
//   return (
//     el == null || typeof el == "undefined" || el == {} || el == [] || el == ""
//   );
// };

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
  url: urlParse,
  urn: urnParse,
  vcard: vcardParse,
  ical: icalParse,
  market: marketParse,
  wifi: wifiParse,
  // magnet:?xt=urn:btih:30709DDE42F39FAF1BCD99E05C7113EC22F62E90&amp;dn=The%20Upside%20(2017)&amp;tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&amp;tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&amp;tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&amp;tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337
  //magnet: magnetParse
};

export default class QRParser {
  constructor() {
    this.content = "";
    this.data = {};
    this.info = "";
  }

  static async process(image) {
    const q = new QRParser();
    if (await q.init(image)) {
      return q.data;
    } else {
      return q.info;
    }
  }
  static async mock(data) {
    const q = new QRParser();
    q.content = data;
    if (await q.decode(data)) {
      return q.data;
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
      // Extract data string from image
      this.content = await _extractQR(imageFile);
    } catch (err) {
      this.info = err;
      return false;
    }
    return this.decode();
  }

  decode() {
    if (this.identify()) {
      return this.parse();
    }
    this.info = "Unable to identify data format";
    return false;
  }

  show() {
    return this.data;
  }

  identify() {
    let done = false;
    let pre = this.content.split(/\:/) || [];
    let kind = pre[0].replace(/"/, "") || "";
    const urls = ["URLTO", "HTTP", "HTTPS", "FTP", "FTPS"];
    const urns = [
      "MAILTO",
      "TEL",
      "SMS",
      "MMS",
      "SMSTO",
      "MMSTO",
      "MECARD",
      "BIZCARD",
      "GEO",
      "FACETIME",
      "FACETIME-AUDIO",
    ];
    const special = ["WIFI", "MARKET", "MAGNET"];
    if (urls.includes(kind.toUpperCase())) {
      this.type = "url"; //kind.toLowerCase();
      done = true;
    } else if (urns.includes(kind.toUpperCase())) {
      this.type = "urn"; //kind.toLowerCase();
      done = true;
    } else if (kind.toUpperCase() == "BEGIN") {
      if (pre[1].toUpperCase() == "VCARD") {
        this.type = "vcard";
        done = true;
      } else if (pre[1].toUpperCase() == "VEVENT") {
        this.type = "ical";
        done = true;
      }
    } else if (special.includes(kind.toUpperCase())) {
      this.type = kind.toLowerCase();
      done = true;
    }
    return done;
  }

  parse() {
    this.data = parseFuncs[this.type](this.content);
    this.data.id = this.type;
    return true;
  }
}
