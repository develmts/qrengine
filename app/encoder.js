import QRCode from "qrcode";

export default class QREncoder {
  constructor() {
    this.content = "";
    this.outfile = "output.png";
  }
  static process(content) {
    const q = new QRENcoder();
    return q.init(content);
  }

  init(content) {
    if (isEmpty(content)) {
      console.log("unable to Encode Empty content");
      process.exit();
    }
    this.content = content;
    return this.encode();
    //return this.show();
  }

  encode() {
    this.outFile = this.content.outFile || this.outFile;

    //parse content and convert it to a proper "encodeable" string
    // ....
    // encode it to a image file
    QRCode.toFile(
      "./" + this.outFile + ".png",
      this.content,
      {},
      (err, data) => {
        if (err) {
          console.error("Error:", err.message);
          process.exit(1);
        }
      }
    );
    return `Data encoded as ${outFile}`;
  }
}
