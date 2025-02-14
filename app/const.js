export const allowedUrlTypes = ["urlto", "http", "https", "ftp", "ftps"];
export const allowedUrnTypes = [
  "mecard",
  "bizcard",
  "geo",
  "mailto",
  "smsto",
  "mmsto",
  "sms",
  "mms",
  "tel",
  "facetime",
  "facetime-audio",
  "tel",
];
export const allowedSpecialTypes = ["vcard", "market", "ical", "magnet","wifi","data"];
export const allowedTypes = [
  ...allowedUrlTypes,
  ...allowedUrnTypes,
  ...allowedSpecialTypes,
];