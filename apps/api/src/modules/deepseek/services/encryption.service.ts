import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

export interface EncryptedPayload {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';

  encrypt(plainText: string, userId: string, masterSecret: string): EncryptedPayload {
    const iv = randomBytes(12);
    const salt = randomBytes(16);
    const key = this.deriveKey(userId, masterSecret, salt);

    const cipher = createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      salt: salt.toString('base64'),
    };
  }

  decrypt(payload: EncryptedPayload, userId: string, masterSecret: string): string {
    const key = this.deriveKey(userId, masterSecret, Buffer.from(payload.salt, 'base64'));
    const decipher = createDecipheriv(this.algorithm, key, Buffer.from(payload.iv, 'base64'));

    decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.encrypted, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  private deriveKey(userId: string, masterSecret: string, salt: Buffer): Buffer {
    return scryptSync(`${masterSecret}:${userId}`, salt, 32);
  }
}
