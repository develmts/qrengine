# QREngine

Command line QR Code Extractor and encoder.

## Example

```sh
$ ./qrengine.sh 
Usage: qrengine.js [options] <input string>

Options:
  -s, --scan     scan qrcode from file
  -m, --mock     mock scanned data                                      [string]
  -n, --name     Encode to name File                                    [string]
  -h, --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]

Examples:
  qrengine.js -n <new QR file> <data [...data [... data]]>   Encode data to QR
  qrengine.js -s <qr image file>                             Decode QR image
```
