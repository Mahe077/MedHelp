import { generateDeviceFingerprint } from '../device-fingerprint'

describe('Device Fingerprint', () => {
  it('generates a fingerprint', async () => {
    const fingerprint = await generateDeviceFingerprint()
    
    expect(fingerprint).toBeDefined()
    expect(typeof fingerprint).toBe('string')
    expect(fingerprint.length).toBeGreaterThan(0)
  })

  it('generates consistent fingerprints for same device', async () => {
    const fingerprint1 = await generateDeviceFingerprint()
    const fingerprint2 = await generateDeviceFingerprint()
    
    expect(fingerprint1).toBe(fingerprint2)
  })
})
