import crypto from 'crypto'

export function generateOtp6() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function hashOtp(otp) {
  // Simple hash; in real systems also add per-code salt.
  return crypto.createHash('sha256').update(String(otp)).digest('hex')
}

