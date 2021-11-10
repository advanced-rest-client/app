import { ArcEncryptEvent, ArcDecryptEvent } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/**
 * A base class for data encryption bindings.
 */
export class EncryptionBindings extends PlatformBindings {
  initialize(): Promise<void>;
  encryptHandler(e: ArcEncryptEvent): void;
  decryptHandler(e: ArcDecryptEvent): void;

  /**
   * @param data The data to encrypt.
   * @param passphrase The passphrase to use in 2-way data encryption
   * @param method Encryption method to use
   * @returns The encrypted data
   */
  encrypt(data: string, passphrase: string, method: string): Promise<string>;

  /**
   * @param data The data to decrypt.
   * @param passphrase The passphrase to use to decrypt the data
   * @param method Method used to encrypt the data
   * @returns The decrypted data
   */
  decrypt(data: string, passphrase: string, method: string): Promise<string>;

  /**
   * @param data The data to encrypt.
   * @param passphrase The passphrase to use in 2-way data encryption
   * @returns The encrypted data
   */
  encodeAes(data: string, passphrase: string): Promise<string>;

  /**
   * Decodes previously encoded data with AES method.
   * @param data The data to decrypt
   * @param passphrase When not provided it asks the user for the password.
   * @returns The decoded data
   */
  decodeAes(data: string, passphrase: string): Promise<string>;

  /**
   * Opens a password dialog, which is hard-coded into the `app.html` file to ask for the file password.
   * @returns User input or throws when cancelled.
   */
  requestPassword(): Promise<string>;
}
