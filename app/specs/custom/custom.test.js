import t from "tap";
import * as eng from "../../custom/custom.js";

// Import tools if needed
// import {aRnd, rndStr} from "./test_tools.js";

t.test("Custom engine:", t => {
  // Implement one test for raw data to Object decoding
  // and another for object to data encoding
  // feel free to implement notre of them if required
  // ie 
  let customData = {type: "custom", customField:  "Custom data"}
  let customRaw = "CUSTOM:customField:Custom data"

  t.strictSame(eng.customParser(customRaw), customData,  `able to decode Custom URL's`)
  t.equal(eng.customEncoder(customData), customRaw,  `able to encode Custom URL's`)
  t.end()
})