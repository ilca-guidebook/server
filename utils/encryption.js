import CryptoJS from 'crypto-js';

export const encryptIdNumber = (idNumber) => {
  return CryptoJS.MD5(idNumber).toString();
};
