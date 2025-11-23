import { getDeviceFingerprint } from '../device-fingerprint'

jest.mock('@fingerprintjs/fingerprintjs', () => ({
  load: jest.fn().mockResolvedValue({
    get: jest.fn().mockResolvedValue({
      visitorId: 'mock-visitor-id',
    }),
  }),
}))

describe('Device Fingerprint', () => {
  it('generates a fingerprint', async () => {
    const fingerprint = await getDeviceFingerprint()
    
    expect(fingerprint).toBeDefined()
    expect(typeof fingerprint).toBe('string')
    expect(fingerprint.length).toBeGreaterThan(0)
  })

  it('generates consistent fingerprints for same device', async () => {
    const fingerprint1 = await getDeviceFingerprint()
    const fingerprint2 = await getDeviceFingerprint()
    
    expect(fingerprint1).toBe(fingerprint2)
  })
})

