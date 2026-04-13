import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../api/authApi'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter your email address.')
      return
    }

    setLoading(true)
    try {
      const data = await requestPasswordReset(email)
      toast.success(data.message || 'If the email is registered, a reset link has been sent.')
    } catch (err) {
      toast.error('Failed to request password reset.')
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
          <p className="text-stone-400 mt-4 italic font-serif">Forgot Password</p>
        </div>

        <div className="bg-white rounded-sm shadow-xl border border-stone-200 p-10 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#002147]"></div>
          <h1 className="text-2xl font-serif font-bold text-[#002147] mb-4 uppercase tracking-tighter">Reset Password</h1>
          <p className="text-sm text-stone-500 mb-8 leading-relaxed">Enter the email address associated with your account and we'll send you a link to reset your password.</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input-field w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-[#002147] font-medium"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full text-center bg-[#002147] hover:bg-[#c5a059] text-white font-bold py-3 uppercase tracking-widest text-xs transition-colors disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8 pb-4">
            Remembered your password?{' '}
            <Link to="/login" className="text-[#c5a059] font-bold hover:text-[#002147] uppercase tracking-widest text-[10px] transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
