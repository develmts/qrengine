import yargs from "yargs";
import QRDecoder from "./decoder.js";
// import QREncoder from "./encoder.js";

export default class App {
  constructor(cmdLine = "") {
    this.cmdline = cmdLine;
    this.argv = "";
  }
  static factory(cmd = "") {
    const a = new App(cmd);
    a.init();
    return a;
  }
  init() {
    this.argv = yargs(process.argv.slice(2))
      .detectLocale(false)
      .usage("Usage: $0 [options] <input string>")
      .option("s", {
        alias: "scan",
        description: "scan qrcode from file",
        type: "file",
      })
      .option("m", {
        alias: "mock",
        description: "mock scanned data",
        conflicts: "any",
        type: "string",
      })

      .help("h")
      .alias("h", "help")
      .version()
      .example("$0 <name> <ssid> <type> <key>", "Encode WIFI data to QR")
      .example("$0 -s <qr image file>", "Decode WIFI image")
      .parse();
  }
  async run() {
    if (this.argv.scan) {
      console.log("scanning", this.argv.scan);
      const data = await QRDecoder.process(this.argv.scan);
      console.log(data);
    } else if (this.argv.mock) {
      console.log("mocking", this.argv.mock);
      const data = await QRDecoder.mock(this.argv.mock);
      console.log(data);
    } else {
      //console.log(argv._);
      let outQR = {
        type: "",
        data: "",
      }(
        ({
          0: wData.name,
          1: wData.ssid,
          2: wData.type,
          3: wData.pass,
        } = this.argv._)
      );

      const wStr = `"WIFI:T:${wData.type};S:${wData.ssid};P:${wData.pass};;"`;
      console.log(`Encoding ${wStr} to ${wData.name}.png`);
      await QREncoder.process();
      /*
      QRCode.toFile("./" + wData.name + ".png", wStr, {}, (err, data) => {
        if (err) {
          console.error("Error:", err.message);
          process.exit(1);
        }
      });
      */
    }
  }
}
