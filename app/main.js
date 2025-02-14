import yargs from "yargs";
import QRDecoder from "./decoder.js";
import QREncoder from "./encoder.js";

export default class App {
  constructor(cmdLine = []) {
    this.cmdline = cmdLine;
    this.argv = {};
  }
  static factory(cmd = []) {
    // console.log( "commandLIne", cmd)
    const a = new App(cmd);
    a.init(cmd);
    return a;
  }
  init(cmd) {
    let fakeArgs = cmd
    if (fakeArgs.length == 0)
      fakeArgs.unshift("-h")
    // console.log(fakeArgs)
    this.argv = yargs(fakeArgs)
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
      .option("n", {
        alias: "name",
        description: "Encode to name File",
        conflicts: "any",
        type: "string",
      })
      .help("h")
      .alias("h", "help")
      .version()
      .example(
        "$0 -n <new QR file> <data [... data [... data]]>",
        "Encode data to QR"
      )
      .example("$0 -s <qr image file>", "Decode QR image")
      .example("$0 <name> <ssid> <type> <key>", "Encode WIFI data to QR")
      .parse();
  }

  async run() {
    //console.log("args", Object.keys(this.argv).length, this.argv._.length);
    if (this.argv.scan) {
      console.log("scanning", this.argv.scan);
      const data = await QRDecoder.process(this.argv.scan);
      // console.log(data);
    } else if (this.argv.mock) {
      // console.log("mocking", this.argv.mock);
      const data = await QRDecoder.mock(this.argv.mock);
      // console.log(data);
    } else if (this.argv.name) {
      let gData = this.argv._.join("");
      //console.log(`Encoding ${gData} to ${this.argv.name}.png`);
      try {
        return await QREncoder.process(gData, this.argv.name);
      } catch (err) {
        throw new Error(err);
      }
    } else {
      // when no named params , we expect teh 4th  data fields reqiured to encode a WIFI Config QR

      //console.log(this.argv._);
      // let outQR = {
      //   type: "",
      //   data: "",
      // }(
      //   ({
      //     0: wData.name,
      //     1: wData.ssid,
      //     2: wData.type,
      //     3: wData.pass,
      //   } = this.argv._)
      // );

      let wData = {
        name: this.argv._[0],
        ssid: this.argv._[1],
        type: this.argv._[2],
        pass: this.argv._[3],
      };

      const wStr = `"WIFI:T:${wData.type};S:${wData.ssid};P:${wData.pass};;"`;
      //console.log(`Encoding ${wStr} to ${wData.name}.png`);
      try {
        return await QREncoder.process(wStr, wData.name);
      } catch (err) {
        throw new Error(err);
      }
    }
  }
}
