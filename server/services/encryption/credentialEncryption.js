const CryptoJS = require('crypto-js');
const { ENCRYPTION_KEY, ENCRYPTION_IV } = require('../../config/env');

const encrypt = (text) => {
  try {
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const iv = CryptoJS.enc.Utf8.parse(ENCRYPTION_IV);
    const encrypted = CryptoJS.AES.encrypt(text, key, { iv, mode: CryptoJS.mode.CBC });
    return encrypted.toString();
  } catch (error) {
    throw new Error('Encryption failed');
  }
};

const decrypt = (encryptedText) => {
  try {
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const iv = CryptoJS.enc.Utf8.parse(ENCRYPTION_IV);
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv, mode: CryptoJS.mode.CBC });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error('Decryption failed');
  }
};

module.exports = { encrypt, decrypt };
