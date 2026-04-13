import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import UploadBox from '../components/UploadBox'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function UploadPage() {
  const { isLoggedIn } = useAuth()
  const { t } = useTranslation()

  if (!isLoggedIn) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-black text-[#002147] mb-4 uppercase tracking-tighter">
              {t('upload.title')}
            </h1>
            <div className="h-1 w-12 bg-[#c5a059] mx-auto mb-4"></div>
            <p className="text-stone-400 text-lg italic font-serif">
              {t('upload.subtitle')}
            </p>
          </div>

          <div className="bg-white rounded-sm border border-stone-200 shadow-xl p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#002147]"></div>
            <UploadBox />
          </div>

          {/* Tips */}
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[
              { icon: '✅', tip: t('upload.tip1') },
              { icon: '⚡', tip: t('upload.tip2') },
              { icon: '🔒', tip: t('upload.tip3') },
            ].map(({ icon, tip }) => (
              <div key={tip} className="flex flex-col items-center text-center gap-4 bg-white border border-stone-100 rounded-sm p-6 shadow-sm hover:border-[#c5a059] transition-all">
                <span className="text-3xl filter saturate-0 opacity-50">{icon}</span>
                <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
