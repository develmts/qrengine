const { exec } = require("child_process");
const pkg = require("../package.json")

const fs = require("fs")

function main() {
  console.log(process.env)
  exec("git rev-parse HEAD",(err, stdout, stderr) => {
    if (err)
      throw new Error(err,stderr)
    const versionJSON= `{"version": "${pkg.version}", "bulidhash": "${stdout.split("\n")[0]}"}`
    if (process.argv[2])
      fs.writeFileSync(process.argv[2], versionJSON)
    else
      process.stdout.write( versionJSON ) 
  })
}

main()