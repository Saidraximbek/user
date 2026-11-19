import { describe, it, expect } from 'vitest';
import { DEFAULT_FIREBASE_CONFIG, getStoredFirebaseConfig } from '../services/firebase';

describe('Firebase Loyihasi Konfiguratsiyasi (finance-9b58b)', () => {
  it('Foydalanuvchi taqdim etgan Firebase konfiguratsiyasi to‘g‘ri sozlangan', () => {
    const config = getStoredFirebaseConfig();
    expect(config.projectId).toBe('finance-9b58b');
    expect(config.apiKey).toBe('AIzaSyDdcFMeG3fjZmt_r1ahNa6e0Y0o4oYxuh0');
    expect(config.authDomain).toBe('finance-9b58b.firebaseapp.com');
    expect(config.storageBucket).toBe('finance-9b58b.firebasestorage.app');
    expect(config.messagingSenderId).toBe('725197214128');
    expect(config.appId).toBe('1:725197214128:web:cba03df6ee7110257ac675');
  });

  it('DEFAULT_FIREBASE_CONFIG qiymatlari aynan foydalanuvchi loyihasiga mos', () => {
    expect(DEFAULT_FIREBASE_CONFIG.projectId).toBe('finance-9b58b');
    expect(DEFAULT_FIREBASE_CONFIG.authDomain).toBe('finance-9b58b.firebaseapp.com');
  });
});
