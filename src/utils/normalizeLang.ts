/* eslint-disable @typescript-eslint/no-explicit-any */
const checkArray = (array: any[]) => {
  const result: any = {};
  if (!array.length) return;
  array.forEach((x: any) => {
    if (x.language && x.value) {
      result[x.language] = x.value;
    }
  });
  if (!Object.keys(result).length) return;
  return result;
};

const normalizeLang = (obj: any) => {
  // If the keyed-array will be in root level
  const result = { ...obj };
  Object.keys(obj).forEach((key) => {
    if (Array.isArray(obj[key])) {
      const res = checkArray(obj[key]);
      if (res) {
        // Replace the key-ed obj with normalized data
        result[key] = res;
      }
    } else if (typeof obj[key] === 'object') {
      // console.log(obj[key]?.toString());
      if (obj[key]?.toString() === '[object Object]') {
        result[key] = normalizeLang(obj[key]);
      }
    }
  });

  return result;
};
export default normalizeLang;
