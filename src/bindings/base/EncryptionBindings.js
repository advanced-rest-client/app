/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/anypoint-masked-input.js';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').ArcEncryptEvent} ArcEncryptEvent */
/** @typedef {import('@advanced-rest-client/events').ArcDecryptEvent} ArcDecryptEvent */

/**
 * A base class for data encryption bindings.
 */
export class EncryptionBindings extends PlatformBindings {
  async initialize() {
    window.addEventListener(EventTypes.Encryption.encrypt, this.encryptHandler.bind(this));
    window.addEventListener(EventTypes.Encryption.decrypt, this.decryptHandler.bind(this));
  }

  /**
   * @param {ArcEncryptEvent} e
   */
  encryptHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const { data, passphrase, method } = e;
    e.detail.result = this.encrypt(data, passphrase, method);
  }

  /**
   * @param {ArcDecryptEvent} e
   */
  decryptHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const { data, passphrase, method } = e;
    e.detail.result = this.decrypt(data, passphrase, method);
  }

  /**
   * @param {string} data The data to encrypt.
   * @param {string} passphrase The passphrase to use in 2-way data encryption
   * @param {string} method Encryption method to use
   * @returns {Promise<string>} The encrypted data
   */
  async encrypt(data, passphrase, method) {
    switch (method) {
      case 'aes': return this.encodeAes(data, passphrase);
      default: throw new Error(`Unknown encryption method`);
    }
  }

  /**
   * @param {string} data The data to decrypt.
   * @param {string} passphrase The passphrase to use to decrypt the data
   * @param {string} method Method used to encrypt the data
   * @returns {Promise<string>} The decrypted data
   */
  async decrypt(data, passphrase, method) {
    switch (method) {
      case 'aes': return this.decodeAes(data, passphrase);
      default: throw new Error(`Unknown decryption method`);
    }
  }

  /**
   * @param {string} data The data to encrypt.
   * @param {string} passphrase The passphrase to use in 2-way data encryption
   * @returns {Promise<string>} The encrypted data
   */
  async encodeAes(data, passphrase) {
    // see https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
    const pwUtf8 = new TextEncoder().encode(passphrase);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const alg = { name: 'AES-GCM', iv };
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);
    const ptUint8 = new TextEncoder().encode(data);
    const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);
    const ctArray = Array.from(new Uint8Array(ctBuffer));
    const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
    const ctBase64 = btoa(ctStr);
    const ivHex = Array.from(iv).map(b => (`00${b.toString(16)}`).slice(-2)).join('');
    return ivHex+ctBase64;
  }

  /**
   * Decodes previously encoded data with AES method.
   * @param {string} data The data to decrypt
   * @param {string=} passphrase When not provided it asks the user for the password.
   * @returns {Promise<string>} The decoded data
   */
  async decodeAes(data, passphrase) {
    if (passphrase === undefined) {
      // eslint-disable-next-line no-param-reassign
      passphrase = await this.requestPassword();
    }
    try {
      const pwUtf8 = new TextEncoder().encode(passphrase);
      const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
      const iv = data.slice(0,24).match(/.{2}/g).map(byte => parseInt(byte, 16));
      const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) };
      const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
      const ctStr = atob(data.slice(24));
      const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));
      const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);
      const plaintext = new TextDecoder().decode(plainBuffer);
      return plaintext;
    } catch (_) {
      throw new Error('Invalid password.');
    }
  }

  /**
   * Opens a password dialog, which is hard-coded into the `app.html` file to ask for the file password.
   * @returns {Promise<string>} User input or throws when cancelled.
   */
  async requestPassword() {
    return new Promise((resolve, reject) => {
      const dialog = document.getElementById('passwordPrompt');
      // @ts-ignore
      dialog.opened = true;
      dialog.addEventListener('closed', function f(e) {
        dialog.removeEventListener('closed', f);
        // @ts-ignore
        const { detail } = e;
        if (detail.cancelled || !detail.confirmed) {
          reject(new Error('The password is required.'));
        } else {
          const input = dialog.querySelector('anypoint-masked-input');
          // no validation here, password can be an empty string
          resolve(input.value);
        }
      });
    });
  }
}
