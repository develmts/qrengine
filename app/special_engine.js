import vCard from "vcf";
import { magnetEncode as magnetBuilder, magnetDecode } from "@ctrl/magnet-link";

function chunk2Date(str) {
  let y = str.substring(0, 4);
  let m = str.substring(4, 6);
  let d = str.substring(6, 8);
  let h = str.substring(9, 11);
  let n = str.substring(11, 13);
  let s = str.substring(13, 15);
  let x = new Date(`${y}-${m}-${d}T${h}:${n}:${s}Z`);
  //console.log(str, `${y}-${m}-${d} ${h}:${n}:${s}`, x);
  return x;
}
function date2Chunk_deprecated(dDate) {
  let str =
    (dDate.getYear() + 1900).toString() +
    (dDate.getMonth() + 1).toString().padStart(2, "0") +
    (dDate.getDay() + 1).toString().padStart(2, "0") +
    "T"+
  dDate.getHours().toString().padStart(2, "0") +
    dDate.getMinutes().toString().padStart(2, "0") +
    dDate.getSeconds().toString().padStart(2, "0") +
    "Z"
  return str;
}

function date2Chunk(dDate) {
  let str = dDate.toISOString().replace(/[\.|\:|\-]/g,"");
  str = str.replace(/000Z$/, "Z")
  return str;
}

const isEmpty = (el) => {
  return (
    el == null || typeof el == "undefined" || el == {} || el == [] || el == ""
  );
};


/* iCal vEvent format */
/*
BEGIN:VEVENT
SUMMARY:Summer+Vacation!
DTSTART:20180601T070000Z
DTEND:20180831T070000Z
END:VEVENT

"BEGIN:VEVENT\nSUMMARY:Summer+Vacation!\nDTSTART:20180601T070000Z\nDTEND:20180831T070000Z\nEND:VEVENT"

*/

export function icalParser(data) {
  //return { data: data.split(/\:/)[1] };
 
  const elemSep = /\n/;
  const kvSep = /\:/;
  const arr = data.split(elemSep);
  //console.log(arr);
  let type = arr.shift() == "BEGIN:VEVENT" ? "ical" : "unknown";
  let obj = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == "END:VEVENT") {
      continue; // last field
    } else {
      let tmp = arr[i].replace(/\+/g, " ").split(kvSep);
      const [k, v] = tmp;

      if (k && v) obj[k.toLowerCase()] = v;
    }
  }
  const ret = {
    summary: obj.summary,
    start: chunk2Date(obj.dtstart).toString(),
    end: chunk2Date(obj.dtend).toString(),
  };
  return ret;
}

export function magnetParser(data){
  return magnetDecode(data)
}

/* vCard format : https://kelseykm.github.io/vcard4/ */
/*
BEGIN:VCARD
VERSION:3.0
N:Owen;Sean;;;
FN:Sean Owen
TITLE:Software Engineer
EMAIL;TYPE=INTERNET;TYPE=WORK;TYPE=PREF:srowen@google.com
URL;TYPE=Homepage:https://example.com
END:VCARD

BEGIN:VCARD
VERSION:3.0
FN:Agnes Soro
N:Soro;Agnes;;;
EMAIL;TYPE=INTERNET;TYPE=HOME:jovenines@gmail.com
BDAY:--1102
PHOTO:https://lh3.googleusercontent.com/contacts/AG6tpzFwm8cxa9mwweOgXmYc7vTnLc-P9dXPXRsZGZ_xXsqVJ5_veQRl
CATEGORIES:family,myContacts,starred
END:VCARD
*/

const vcardRaw =
  "BEGIN:VCARD\r\n" +
  "VERSION:4.0\r\n" +
  "FN:Mister Person\r\n" +
  "N:Person;Mister;;;\r\n" +
  "TEL;TYPE=home:tel:+9876543210\r\n" +
  "ADR:;;123 Main Street;Any Town;AAH;91921-1234;Nowayar\r\n" +
  "job.TEL;TYPE=fax:tel:+12345678910\r\n" +
  "job.EMAIL;PREF=1:mister.person@thecompany.com\r\n" +
  "job.EMAIL:mister.person@thecompany.org\r\n" +
  "job.TITLE:The Boss\r\n" +
  "END:VCARD";

export function vcardParser(data) {
  const card = new vCard().parse(data);
  const groups=[]
  let normObj= {}
  for (const entry of card.toJSON()[1]){
    let o={}

    o = {
      id: entry[0],
      kind: entry[2],
      value: entry[3]
    }
    let tmpKey = entry[0]
    let tmpPref=""
    let tmpGroup=""
    if (entry[1] != {}){
      if (entry[1].group){
        o["group"] = entry[1].group
        tmpGroup = entry[1].group
      }
      if (entry[1].type)
        o["type"] = entry[1].type
      if (entry[1].pref){
        o["pref"] = entry[1].pref
        tmpPref=entry[1].pref
      }
      
      tmpKey = tmpGroup != "" ? tmpGroup+"."+tmpKey : tmpKey
      tmpKey = tmpPref != "" ? tmpKey+"."+tmpPref : tmpKey
    }

    normObj[tmpKey] = o
    o= {}
  }
  // console.dir (normObj, {depth: null})
  return normObj;
}




/* market format :https://stackoverflow.com/questions/4055245/android-market-application-url/ */
/* market://details?id=com.example.your.package */
/* market://search?q=pname:net.mandaria.tippytipper */

export function marketParser(data) {
  // split protocol
  let uri = data.slice(9);
  let item = uri.split(/\?|\=/);

  let ret = {
    //urn: uri,
    query: item[0],
    params : {
      name: item[1],
      value: item[2]
    }
  };
  return ret;
}




// WIFI format spec
/*
 string to encode : "WIFI:T:WPA;S:mynetwork;P:mypass;;""
Parameter	  Example      Description
T	          WPA	         Authentication type;  can be WEP or WPA or WPA2-EAP, or nopass for no password. Or, omit 
                         for no password.
S	          mynetwork	   Network SSID.Required. Enclose in double quotes if it is an ASCII name, but could 
                         be interpreted as hex (i.e. "ABCD")
P	          mypass	     Password ignored if T is nopass (in which case it may be omitted). Enclose in 
                          double quotes if it is an ASCII name, but could be interpreted as hex (i.e. "ABCD")
H	          true	       Optional. True if the network SSID is hidden. Note this was mistakenly also used 
                         to specify phase 2 method in releases up to 4.7.8 / Barcode Scanner 3.4.0. 
                         If not a boolean, it will be interpreted as phase 2 method (see below) for backwards-compatibility
E	          TTLS	       (WPA2-EAP only) EAP method, like TTLS or PWD
A	          anon	       (WPA2-EAP only) Anonymous identity
I	          myidentity   (WPA2-EAP only) Identity
PH2	        MSCHAPV2	   (WPA2-EAP only) Phase 2 method, like MSCHAPV2

Order of fields does not matter. Special characters \, ;, ,, " and : should be escaped with a backslash (\) 
as in MECARD encoding. For example, if an SSID was literally "foo;bar\baz" (with double quotes part of the SSID name itself) 
then it would be encoded like: WIFI:S:\"foo\;bar\\baz\";;
*/


export function wifiParser(str) {
  const ret = {};
  const elemSep = /\;/;
  const kvSep = /\:/;
  const arr = str.split(elemSep);
  let type = "";
  let obj = {};
  for (let i = 0; i < arr.length; i++) {
    if (isEmpty(arr[i])) {
      continue; // last field
    } else {
      let tmp = arr[i].replace(/\"/g, "").replace(/\'/g, "").split(kvSep);
      if (tmp.length > 2) {
        type = tmp.shift();
        if (type != "WIFI") {
          return {};
        }
      }
      const [k, v] = tmp;
      if (k && v) obj[k] = v;
    }
  }

  ret.name = "";
  ret.ssid = obj.S;
  ret.pass = obj.P;
  ret.type = obj.T || "nopass";
  ret.hidden = obj.H ? true : false;
  ret.method = obj.T == "WPA2_EAP" ? obj.E : "";
  ret.anon = obj.T == "WPA2_EAP" ? obj.A : false;
  ret.identity = obj.T == "WPA2_EAP" ? obj.I : "";
  ret.ph2 = obj.T == "WPA2_EAP" ? obj.PH2 : "";
  return ret;
}

export function dataParser(str){
  //check correct header
  if (str.substring(0,5) != "DATA:")
    throw new Error("Incorrect data format") 

  let ret = str.split(":")
  ret.shift()
  return ret.join(":")
}


// ----------------------------------
// Encoders
// ----------------------------------

export function vcardEncoder(oCard) {
  let ret=[ "BEGIN:VCARD"]
  for (const el in oCard){
    let newEl = ""
    let tmp= {}
    let parts = el.split(/\./)
    if (parts.length == 3){
      tmp["pref"]=parts[2]
      tmp["group"]=parts[0]
      tmp["id"]=parts[1]
    }else if (parts.length == 2){
      tmp["id"]=parts[1]
      tmp["group"]=parts[0]
    } else {
      tmp["id"] = el
    }

    if (tmp["group"])
      newEl += tmp["group"]+"."
    newEl += tmp.id.toUpperCase()
    if (oCard[el].type){
      newEl += ";TYPE="+oCard[el].type
    }else if (tmp["pref"]){
      newEl += ";PREF="+tmp["pref"]
    } 
    newEl +=":"
    if (typeof oCard[el].value == "object"){
      newEl += oCard[el].value.join(";")
    }else{
      newEl += oCard[el].value
    }
    ret.push(newEl)
  }
  ret.push("END:VCARD")
 
  return ret.join("\r\n")
}

export function marketEncoder(data) {
 /* 
  data = {
    query: 'search',
    params: { name: 'q', value: 'pname:net.mandaria.tippytipper' }
  }
 */

  return "market://"+data.query+"?"+data.params.name+"="+data.params.value
}

export function icalEncoder(data) {
  let ret = "BEGIN:VEVENT";
  ret += "\nSUMMARY:" + data.summary;
  ret += "\nDTSTART:" + date2Chunk(data.dtstart);
  ret += "\nDTEND:" + date2Chunk(data.dtend);
  ret += "\nEND:VEVENT";
  return ret;
}

export function magnetEncoder(data) {
  return magnetBuilder(data)
}

export function wifiEncoder(data) {
  /*
  ret.name = "";
  ret.ssid = obj.S;
  ret.pass = obj.P;
  ret.type = obj.T || "nopass";
  ret.hidden = obj.H ? true : false;
  ret.method = obj.T == "WPA2_EAP" ? obj.E : "";
  ret.anon = obj.T == "WPA2_EAP" ? obj.A : false;
  ret.identity = obj.T == "WPA2_EAP" ? obj.I : "";
  ret.ph2 = obj.T == "WPA2_EAP" ? obj.PH2 : "";
  */
  // const sample_WIFI = `"WIFI:T:WPA;S:networkSSID;P:wifipass;;"`;
  let ret = "wifi:";
  ret += "T:" + data.type;
  ret += ";S:" + data.ssid;
  ret += ";P:" + data.pass;
  ret += ";H:" + data.hidden;
  ret += ";E:" + data.type == "WPA2_EAP" ? data.method : "";
  ret += ";A:" + data.type == "WPA2_EAP" ? data.anon : "";
  ret += ";I:" + data.type == "WPA2_EAP" ? data.identity : "";
  ret += ";PH2:" + data.type == "WPA2_EAP" ? data.ph2 : "";

  return ret;
}



export function dataEncoder(data) {
  return "DATA:" + data;
}

// let myvcard = new vCard().parser(sample_vCard);
// console.log(myvcard);
// console.log(myvcard.toString());

// const testMagnetUri = 'magnet:?xt=urn:btih:d2474e86c95b19b8bcfdb92bc12c9d44667cfa36&dn=Leaves+of+Grass+by+Walt+Whitman.epub&tr=udp%3A%2F%2Ftracker.example4.com%3A80&tr=udp%3A%2F%2Ftracker.example5.com%3A80&tr=udp%3A%2F%2Ftracker.example3.com%3A6969&tr=udp%3A%2F%2Ftracker.example2.com%3A80&tr=udp%3A%2F%2Ftracker.example1.com%3A1337';

// let mTmp = magnetParser(testMagnetUri)
// console.log(mTmp)

// const testMagnetStruct = {
//   xt: [
//     'urn:ed2k:354B15E68FB8F36D7CD88FF94116CDC1',
//     'urn:tree:tiger:7N5OAMRNGMSSEUE3ORHOKWN4WWIQ5X4EBOOTLJY',
//     'urn:btih:QHQXPYWMACKDWKP47RRVIV7VOURXFE5Q',
//   ],
//   xl: '10826029',
//   dn: 'mediawiki-1.15.1.tar.gz',
//   tr: [
//     'udp://tracker.openbittorrent.com:80/announce',
//   ],
//   as: 'http://download.wikimedia.org/mediawiki/1.15/mediawiki-1.15.1.tar.gz',
//   xs: [
//     'http://cache.example.org/XRX2PEFXOOEJFRVUCX6HMZMKS5TWG4K5',
//     'dchub://example.org',
//   ]
// }
// let tmpUri= magnetEncoder(testMagnetStruct)
// console.log(tmpUri)



//vcardParser(vcardRaw)
// const vCardStruct = {
//   version: { id: 'version', kind: 'text', value: '4.0' },
//   fn: { id: 'fn', kind: 'text', value: 'Mister Person' },
//   n: { id: 'n', kind: 'text', value: [ 'Person', 'Mister', '', '', '' ] },
//   tel: { id: 'tel', kind: 'text', value: 'tel:+9876543210', type: 'home' },
//   'job.tel': {
//     id: 'tel',
//     kind: 'text',
//     value: 'tel:+12345678910',
//     group: 'job',
//     type: 'fax'
//   },
//   adr: {
//     id: 'adr',
//     kind: 'text',
//     value: [
//       '',
//       '',
//       '123 Main Street',
//       'Any Town',
//       'AAH',
//       '91921-1234',
//       'Nowayar'
//     ]
//   },
//   'job.email.1': {
//     id: 'email',
//     kind: 'text',
//     value: 'mister.person@thecompany.com',
//     group: 'job',
//     pref: '1'
//   },
//   'job.email': {
//     id: 'email',
//     kind: 'text',
//     value: 'mister.person@thecompany.org',
//     group: 'job'
//   },
//   'job.title': { id: 'title', kind: 'text', value: 'The Boss', group: 'job' }
// }

//vcardEncoder(vCardStruct)

// const marketOpts= [
//   "market://details?id=com.example.your.package",
//   "market://search?q=pname:net.mandaria.tippytipper"
// ]
// console.log(marketParser(marketOpts[1]))
// console.log(
//   marketEncoder({
//     query: 'search',
//     params: { name: 'q', value: 'pname:net.mandaria.tippytipper' }
//   })
// )