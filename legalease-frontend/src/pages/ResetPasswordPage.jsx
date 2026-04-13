import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/authApi'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim() || password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (!token) {
      toast.error('Reset token is missing from URL.')
      return
    }

    setLoading(true)
    try {
      const data = await resetPassword(token, password)
      toast.success(data.message || 'Password reset successfully.')
      navigate('/login')
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to reset password. The link may have expired.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center gap-4 group">
            <span className="text-5xl filter saturate-0 brightness-50 group-hover:brightness-0 transition-all">⚖️</span>
            <span className="text-3xl font-serif font-black text-[#002147] tracking-tight uppercase border-b-2 border-[#c5a059] pb-1">{t('nav.brand', 'LegalEase')}</span>
          </Link>
          <p className="text-stone-400 mt-4 italic font-serif">Setup New Password</p>
        </div>

        <div className="bg-white rounded-sm shadow-xl border border-stone-200 p-10 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#002147]"></div>
          <h1 className="text-2xl font-serif font-bold text-[#002147] mb-8 uppercase tracking-tighter">Enter New Password</h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input-field w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-[#002147] font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type your password again"
                className="input-field w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-[#002147] font-medium"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full text-center bg-[#002147] hover:bg-[#c5a059] text-white font-bold py-3 uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4">
              {loading ? 'Updating...' : 'Set Password →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
