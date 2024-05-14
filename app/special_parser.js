import vCard from "vcf";

//import { vCard } from "vcard4";
function chunk2Date(str) {
  let y = str.substring(0, 4);
  let m = str.substring(4, 6);
  let d = str.substring(6, 8);
  let h = str.substring(9, 11);
  let n = str.substring(11, 13);
  let s = str.substring(13, 15);
  let x = new Date(`${y}-${m}-${d}T${h}:${n}:${s}`);
  //console.log(str, `${y}-${m}-${d} ${h}:${n}:${s}`, x);
  return x;
}

const isEmpty = (el) => {
  //function isEmpty(el) {
  return (
    el == null || typeof el == "undefined" || el == {} || el == [] || el == ""
  );
};

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

const sample_vCard =
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
  "END:VCARD\r\n";

export function vcardParse(data) {
  const card = new vCard().parse(data);
  return { data: card };
}

/* market format :https://stackoverflow.com/questions/4055245/android-market-application-url/ */
/* market://details?id=com.example.your.package */
/* market://search?q=pname:net.mandaria.tippytipper */

export function marketParse(data) {
  // split protocol
  let uri = data.slice(9);
  let item = uri.split(/\?|\=/);

  let ret = {
    data: data,
    uri: uri,
  };
  ret[item[1]] = item[2];
  return ret;
}

/* iCal vEvent format */
/*
BEGIN:VEVENT
SUMMARY:Summer+Vacation!
DTSTART:20180601T070000Z
DTEND:20180831T070000Z
END:VEVENT

"BEGIN:VEVENT\nSUMMARY:Summer+Vacation!\nDTSTART:20180601T070000Z\nDTEND:20180831T070000Z\nEND:VEVENT"

*/

export function icalParse(data) {
  //return { data: data.split(/\:/)[1] };
  const ret = { data: null };
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
  ret.data = {
    summary: obj.summary,
    start: chunk2Date(obj.dtstart).toString(),
    end: chunk2Date(obj.dtend).toString(),
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

const sample_WIFI = `"WIFI:T:WPA;S:networkSSID;P:wifipass;;"`;
export function wifiParse(str) {
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
  //ret.type = type;
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

// -----------

// icalParse("BEGIN:VEVENT\nSUMMARY:Summer+Vacation!\nDTSTART:20180601T070000Z\nDTEND:20180831T070000Z\nEND:VEVENT");
// vcardParse(sample_vCard);
// marketParse("market://details?id=org.example.foo");
// wifiParse(sample_WIFI);
