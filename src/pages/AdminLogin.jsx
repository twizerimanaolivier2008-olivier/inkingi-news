import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { loginVerified } = useAdminAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState('email')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const [sentOtp, setSentOtp] = useState('')
  const [otp, setOtp] = useState('')

  const canSend = useMemo(() => {
    return !!email.trim() && !!password.trim()
  }, [email, password])

  const handleSend = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')

    if (!canSend) return

    try {
      const res = await fetch('http://localhost:4000/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP')

      setSentOtp(data.otp)
      setOtp('')
      setStep('otp')
      setStatus('Verification code generated. Check your email or demo display below.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp.trim()) {
      setError('Enter the verification code.')
      return
    }

    try {
      const res = await fetch('http://localhost:4000/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP')

      loginVerified({ email: data.email || email.trim(), role: data.role || 'admin', token: data.token })
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#D72638] tracking-tight">INKINGI</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Dashboard</p>
        </div>

        <form onSubmit={step === 'email' ? handleSend : handleVerify} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded">{error}</div>
          )}

          {status && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded">{status}</div>
          )}

          {step === 'email' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
                  placeholder="twizerimanaolivier2008@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
                  placeholder="Your password"
                />
              </div>
              <button
                type="submit"
                disabled={!canSend}
                className="w-full py-2.5 bg-[#D72638] text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send verification code
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-sm text-gray-600">
                Code sent to <span className="font-semibold text-gray-900">{email}</span>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm">
                <div className="text-gray-600">OTP (copy/paste):</div>
                <div className="font-mono text-xl font-extrabold text-[#D72638] tracking-widest">{sentOtp}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter verification code</label>
                <input
                  inputMode="numeric" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
                  placeholder="6-digit code"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#D72638] text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Verify & Continue
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setSentOtp('')
                  setOtp('')
                  setError('')
                  setStatus('')
                }}
                className="w-full py-2.5 bg-white text-gray-700 border border-gray-200 font-semibold rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                Back
              </button>
            </>
          )}
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Authenticated admin access. OTP is shown for email verification convenience.
        </p>
      </div>
    </div>
  )
}
