import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error(t('auth.errorFields'))
      return
    }
    if (form.password.length < 6) {
      toast.error(t('auth.errorPasswordShort'))
      return
    }

    setLoading(true)
    try {
      const data = await registerUser(form.name, form.email, form.password)
      login(data.user, data.token)
      toast.success(t('auth.successRegister', { name: data.user.name }))
      navigate('/upload')
    } catch (err) {
      const msg = err?.response?.data?.detail || t('auth.errorRegister')
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
          <p className="text-stone-400 mt-4 italic font-serif">{t('auth.createAccountText')}</p>
        </div>

        <div className="bg-white rounded-sm shadow-xl border border-stone-200 p-10 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#002147]"></div>
          <h1 className="text-2xl font-serif font-bold text-[#002147] mb-8 uppercase tracking-tighter">{t('auth.registerTitle')}</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.nameLabel')}</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t('auth.namePlaceholder')}
                className="input-field"
                required
              />
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.passwordLabel')}</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t('auth.passwordRegPlaceholder')}
                className="input-field"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-center">
              {loading ? t('auth.registering') : t('auth.registerBtn')}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-[#c5a059] font-bold hover:text-[#002147] uppercase tracking-widest text-[10px] transition-colors">
              {t('auth.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
