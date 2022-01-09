import CryptoJS from 'crypto-js';

const SECRET = 'fgjhdkGDFHGJADFHG832r23#@$&';

export const encryptIdNumber = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET).toString();
};

export const decryptIdNumber = (text) => {
  const bytes = CryptoJS.AES.decrypt(text, SECRET);

  return bytes.toString(CryptoJS.enc.Utf8);
};