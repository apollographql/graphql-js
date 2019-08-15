const objectEntries =
  Object.entries ||
  ((obj: any) => Object.keys(obj).map(key => [key, obj[key]]));

export default objectEntries;
