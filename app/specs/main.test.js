import t from "tap";
import App from "../main.js";

t.test("Check command line", t => {
    let app ={}

    app = App.factory(["--scan", "scanItem"]);
    t.equal(app.argv["scan"], "scanItem", "Found scanable item")
    t.equal(app.argv["s"], "scanItem", "Found scanable item")
    app = App.factory(["--mock", "mockData"]);
    t.equal(app.argv["mock"], "mockData", "Found data to mockup")
    t.equal(app.argv["m"], "mockData", "Found data to mockup")
    app = App.factory(["--name", "filename.png", "12345"]);
    t.equal(app.argv["name"], "filename.png", "Found outputFile")
    t.equal(app.argv["n"], "filename.png", "Found ouputFile")

    t.end()
});

t.test("Execution", t => {
    let app ={}
    const testWifiParams= ["wifiName", "dummySSID", "wpa", "dummyKey"]

    app = App.factory(testWifiParams);
    t.equal(app.argv._.length ,4, "correct number of parameters detected")
    t.strictSame(app.argv._, testWifiParams, "Pristine param values")
    
    t.end()
})
