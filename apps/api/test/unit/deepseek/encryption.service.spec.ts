import { EncryptionService } from '../../../src/modules/deepseek/services/encryption.service';

describe('EncryptionService', () => {
  const service = new EncryptionService();

  it('encrypts and decrypts API key with AES-256-GCM', () => {
    const key = 'sk-test-12345678901234567890';
    const userId = 'user-1';
    const secret = 'test-master-secret';

    const encrypted = service.encrypt(key, userId, secret);
    const decrypted = service.decrypt(encrypted, userId, secret);

    expect(decrypted).toBe(key);
    expect(encrypted.encrypted).not.toBe(key);
    expect(encrypted.iv).toBeTruthy();
    expect(encrypted.tag).toBeTruthy();
    expect(encrypted.salt).toBeTruthy();
  });
});
