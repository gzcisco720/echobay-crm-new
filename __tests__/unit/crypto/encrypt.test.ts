// Set test key before module import (32 bytes = 64 hex chars)
process.env.ENCRYPTION_KEY = 'a'.repeat(64)

import { encrypt, decrypt } from '@/lib/crypto/encrypt'

describe('encrypt / decrypt', () => {
  it('produces ciphertext different from plaintext', () => {
    const result = encrypt('123456789')
    expect(result).not.toBe('123456789')
    expect(result).toContain(':')
  })

  it('round-trips a bank account number', () => {
    const original = '987654321'
    expect(decrypt(encrypt(original))).toBe(original)
  })

  it('produces different ciphertext each call (random IV)', () => {
    const a = encrypt('same')
    const b = encrypt('same')
    expect(a).not.toBe(b)
  })

  it('throws when ciphertext is tampered', () => {
    const ct = encrypt('secret')
    const tampered = ct.slice(0, -4) + 'XXXX'
    expect(() => decrypt(tampered)).toThrow()
  })

  it('throws when ciphertext format is invalid', () => {
    expect(() => decrypt('no-colons-here')).toThrow('Invalid ciphertext format')
  })
})
