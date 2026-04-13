import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { deleteAccount } from '../api/authApi'

import { LANGUAGES } from '../constants'

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    if (window.confirm(t('nav.confirmDeleteAccount', 'Are you sure you want to permanently delete your account and all associated documents? This action cannot be undone.'))) {
      try {
        await deleteAccount()
        logout()
        toast.success(t('nav.deletedSuccess', 'Account deleted successfully.'))
        navigate('/')
      } catch (err) {
        toast.error('Failed to delete account')
      }
    }
  }

  return (
    <nav className="bg-[#fdfbf7] border-b border-[#002147]/10 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <span className="text-3xl filter saturate-0 brightness-0 opacity-80">⚖️</span>
          <span className="text-2xl font-bold text-[#002147] font-serif tracking-tight">{t('nav.brand')}</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          
          {/* Language Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-2 text-[#002147]/80 hover:text-[#c5a059] font-medium transition-colors">
              <span className="text-lg">🌐</span>
              {LANGUAGES.find(l => l.code === i18n.language)?.label || 'EN'}
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-200 shadow-xl rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`block w-full text-left px-5 py-3 text-sm hover:bg-stone-50 transition-colors ${i18n.language === lang.code ? 'font-bold text-[#002147] bg-stone-50' : 'text-stone-700'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {isLoggedIn ? (
            <>
              <Link
                to="/upload"
                className="hidden md:block text-[#002147]/80 hover:text-[#c5a059] font-medium transition-colors"
              >
                {t('nav.analyze')}
              </Link>
              <Link
                to="/history"
                className="hidden md:block text-[#002147]/80 hover:text-[#c5a059] font-medium transition-colors"
              >
                {t('nav.history')}
              </Link>
              <div className="flex items-center gap-4 ml-2 pl-4 border-l border-[#002147]/10">
                <span className="hidden lg:block text-sm text-stone-400 italic">{t('nav.hi', { name: user?.name?.split(' ')[0] })}</span>
                <button
                  onClick={handleLogout}
                  className="bg-transparent border border-[#002147]/20 hover:border-[#002147] hover:bg-[#002147]/5 text-[#002147]/80 font-bold px-4 py-2 rounded-sm text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                  {t('nav.logout')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-transparent border border-red-200 hover:border-red-800 hover:bg-red-50 text-red-800 font-bold px-4 py-2 rounded-sm text-[10px] uppercase tracking-[0.2em] transition-all"
                  title="Permanently remove account"
                >
                  {t('nav.deleteAccount', 'Delete Account')}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[#002147]/80 hover:text-[#c5a059] font-medium transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="bg-[#002147] hover:bg-[#003366] text-white font-bold px-6 py-2.5 rounded-sm text-xs uppercase tracking-widest shadow-md transition-all"
              >
                {t('nav.getStarted')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
