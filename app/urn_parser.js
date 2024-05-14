const maps = {
  mecard: { N: "Name", ADR: "Address", TEL: "Tlf", EMAIL: "Email" },
  bizcard: {
    N: "Name",
    X: "Surname",
    T: "Title",
    C: "Company",
    A: "Address",
    B: "Tlf",
    E: "Email",
  },
};
// for testing purposes
const sample_mecard =
  "MECARD:N:Owen,Sean;ADR:76 9th Avenue, 4th Floor, New York, NY 10011;TEL:12125551212;EMAIL:srowen@example.com;;";
const sample_bizcard =
  "BIZCARD:N:Sean;X:Owen;T:Software Engineer;C:Google;A:76 9th Avenue, New York, NY 10011;B:+12125551212;E:srowen@google.com;;";
const sample_geo = "GEO:40.71872,-73.98905,100";

export function urnParse(str) {
  const elemSep = /\;/;
  const kvSep = /\:/;
  const arr = str.split(elemSep);
  let parts = arr.shift().split(kvSep);
  let id = parts.shift().toLowerCase();
  const ret = { type: id };
  switch (id) {
    case "mecard":
    case "bizcard":
      ret[maps[id][parts[0]]] = parts[1];
      for (let x = 0; x < arr.length; x++) {
        if (arr[x] == "") continue;
        const [k, v] = arr[x].split(kvSep);
        ret[maps[id][k]] = v;
      }
      break;
    case "geo":
      const coordSep = /\,/;
      const vArr = parts[0].split(coordSep);
      ({ 0: ret.lat, 1: ret.lon, 2: ret.height } = vArr);
      break;
    case "mailto":
    case "smsto":
    case "mmsto":
    case "sms":
    case "mms":
    case "tel":
    case "facetime":
    case "facetime-audio":
    case "tel":
      ret["data"] = parts.join(":");
      break;
    default:
      break;
  }
  return ret;
}
