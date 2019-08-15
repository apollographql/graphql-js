const objectValues =
  Object.values || ((obj: any) => Object.keys(obj).map(key => obj[key]));
export default objectValues;
