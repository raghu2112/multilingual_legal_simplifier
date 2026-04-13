import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password.trim()) {
      toast.error(t('auth.errorFields'))
      return
    }

    setLoading(true)
    try {
      const data = await loginUser(form.email, form.password)
      login(data.user, data.token)
      toast.success(t('auth.successWelcome', { name: data.user.name }))
      navigate('/upload')
    } catch (err) {
      const msg = err?.response?.data?.detail || t('auth.errorLogin')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center gap-4 group">
            <span className="text-5xl filter saturate-0 brightness-50 group-hover:brightness-0 transition-all">⚖️</span>
            <span className="text-3xl font-serif font-black text-[#002147] tracking-tight uppercase border-b-2 border-[#c5a059] pb-1">{t('nav.brand')}</span>
          </Link>
          <p className="text-stone-400 mt-4 italic font-serif">{t('auth.welcomeBack')}</p>
        </div>

        <div className="bg-white rounded-sm shadow-xl border border-stone-200 p-10 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#002147]"></div>
          <h1 className="text-2xl font-serif font-bold text-[#002147] mb-8 uppercase tracking-tighter">{t('auth.loginTitle')}</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.emailLabel')}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('auth.emailPlaceholder')}
                className="input-field"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">{t('auth.passwordLabel')}</label>
                <Link to="/forgot-password" className="text-[10px] text-stone-500 hover:text-[#c5a059] uppercase tracking-widest font-bold transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t('auth.passwordPlaceholder')}
                className="input-field"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-center">
              {loading ? t('auth.loggingIn') : t('auth.loginBtn')}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-[#c5a059] font-bold hover:text-[#002147] uppercase tracking-widest text-[10px] transition-colors">
              {t('auth.signupLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
