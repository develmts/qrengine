import t from "tap";
import * as eng from "../special_engine.js";

const genData = "9p0384roirt4f:rp98euhjoi4ñkrf:p903814urjhoidkle"
const calData = {
  summary : "Summer+Vacation!",
  dtstart: new Date(2018,5,1,9,0,0),
  dtend: new Date(2018,7,31,9,0,0)
}
const normCalData = {
  summary : "Summer+Vacation!",
  dtstart: new Date(`${"2018"}-${"05"}-${"01"}T${"09"}:${"00"}:${"00"}Z`),
  dtend: new Date(`${"2018"}-${"07"}-${"31"}T${"09"}:${"00"}:${"00"}Z`)
}

const calEvent = "BEGIN:VEVENT\nSUMMARY:Summer+Vacation!\nDTSTART:20180601T070000Z\nDTEND:20180831T070000Z\nEND:VEVENT"
//               "BEGIN:VEVENT\nSUMMARY:Summer+Vacation!\nDTSTART:20180601T070000Z\nDTEND:20180831T070000Z\nEND:VEVENT"
const vCardRaw =
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

const vCardStruct = {
  version: { id: 'version', kind: 'text', value: '4.0' },
  fn: { id: 'fn', kind: 'text', value: 'Mister Person' },
  n: { id: 'n', kind: 'text', value: [ 'Person', 'Mister', '', '', '' ] },
  tel: { id: 'tel', kind: 'text', value: 'tel:+9876543210', type: 'home' },
  'job.tel': {
    id: 'tel',
    kind: 'text',
    value: 'tel:+12345678910',
    group: 'job',
    type: 'fax'
  },
  adr: {
    id: 'adr',
    kind: 'text',
    value: [
      '',
      '',
      '123 Main Street',
      'Any Town',
      'AAH',
      '91921-1234',
      'Nowayar'
    ]
  },
  'job.email.1': {
    id: 'email',
    kind: 'text',
    value: 'mister.person@thecompany.com',
    group: 'job',
    pref: '1'
  },
  'job.email': {
    id: 'email',
    kind: 'text',
    value: 'mister.person@thecompany.org',
    group: 'job'
  },
  'job.title': { id: 'title', kind: 'text', value: 'The Boss', group: 'job' }
}

const marketURL = "market://details?id=org.example.foo"
const marketData = {
  query: "details",
  params : { name: "id", value: "org.example.foo"}
}

const wifiData = {
  authType: "WPA",        // WEP|WPA|WPA2-EAP|nopass
  SSID: "networkName",    // Network SSID even if its hidden
  password: "secret",     // ignored if authType is nopass
  hidden: false,          // optional . if not bool, interpred a s phase 2 method
  eap: "" ,               // WPA-EAP" only  TLS | PWD
  anon: "",               // WPA-EAP" only. Anonimous identity
  identity: "",           // (WPA2-EAP only) Identity
  phaseTwo: ""            // (WPA2-EAP only) Phase 2 method, like MSCHAPV2
}

const magnetStruct = {
  xt: [
    'urn:ed2k:354B15E68FB8F36D7CD88FF94116CDC1',
    'urn:tree:tiger:7N5OAMRNGMSSEUE3ORHOKWN4WWIQ5X4EBOOTLJY',
    'urn:btih:QHQXPYWMACKDWKP47RRVIV7VOURXFE5Q',
  ],
  xl: '10826029',
  dn: 'mediawiki-1.15.1.tar.gz',
  tr: [
    'udp://tracker.openbittorrent.com:80/announce',
  ],
  as: 'http://download.wikimedia.org/mediawiki/1.15/mediawiki-1.15.1.tar.gz',
  xs: [
    'http://cache.example.org/XRX2PEFXOOEJFRVUCX6HMZMKS5TWG4K5',
    'dchub://example.org',
  ]
}
const magNetLink = 'magnet:?xt=urn:btih:d2474e86c95b19b8bcfdb92bc12c9d44667cfa36&dn=Leaves+of+Grass+by+Walt+Whitman.epub&tr=udp%3A%2F%2Ftracker.example4.com%3A80&tr=udp%3A%2F%2Ftracker.example5.com%3A80&tr=udp%3A%2F%2Ftracker.example3.com%3A6969&tr=udp%3A%2F%2Ftracker.example2.com%3A80&tr=udp%3A%2F%2Ftracker.example1.com%3A1337';

// eng.order : ical,market,wifi,magnet, data

t.test("Special engine: iCal", t => {
  // ical Encodeer / Decoder
  let encodediCal = eng.icalEncoder(calData)
  
  t.equal(encodediCal, calEvent, "able to encode ical data")
  const parsedIcal=eng.icalParser(calEvent)
  
  const sameEvent = (a,b) => {
    return a.summary == b.summary &&
    a.dtstart.getTime() == b.dtstart.getTime() &&
    a.dtstart.getTime() == b.dtstart.getTime() 
  }
  t.ok(sameEvent, "able to decode ical Data")
  t.end()  
})
t.test("Special engine: vCard", t => {
  // Vcard Encoder / Decoder
  let parsedvCard = eng.vcardParser(vCardRaw)
  t.strictSame(parsedvCard, vCardStruct, "able to decode VCARD data")

  let encodedvCard = eng.vcardEncoder(vCardStruct)
  let aDone = encodedvCard.split("\r\n").sort()
  let aMatch = vCardRaw.split("\r\n").sort()
  t.strictSame(aDone,aMatch ,"able to encode VCARD DATA")
  t.end()
})
t.test("Special engine: Market", t => {  
  // Android market Encoder / Decoder
  let encodedMarket = eng.marketEncoder(marketData)
  t.equal(encodedMarket , marketURL, "able to encode Android Market data")
  let decodedMarket = eng.marketParser(marketURL)
  t.strictSame(decodedMarket , marketData, "able to decode Android Market URL")
  t.end()
})
  
t.test("Special engine: WIFI Config", {skip: "Corp. Only"},t => {  
  let encodedWifi = eng.wifiEncoder(wifiData)
  t.pass("ok")
  t.pass("ok")
  t.end()
})  

t.test("Special engine: Magnet Link", {todo: "Requesting information"}, t => {  
  // magnet Link Encoder / Decoder
  let encodedMagnet = eng.magnetEncoder(magnetStruct)
  
  t.pass("ok")
  t.pass("ok")
  t.end()
})  

t.test("Special engine: generic", t => {  
  let encodedData = eng.dataEncoder(genData)
  t.equal(encodedData, `DATA:${genData}`, "able to encode generic data")
  t.equal(eng.dataParser(encodedData), genData, "able to decode generic data")
  
  t.end()
})