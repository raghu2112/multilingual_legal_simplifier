import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function LandingPage() {
  const { isLoggedIn } = useAuth()
  const { t } = useTranslation()

  const features = [
    { icon: '📄', title: t('landing.feat1Title'), desc: t('landing.feat1Desc') },
    { icon: '🌍', title: t('landing.feat2Title'), desc: t('landing.feat2Desc') },
    { icon: '🤖', title: t('landing.feat3Title'), desc: t('landing.feat3Desc') },
    { icon: '🚨', title: t('landing.feat4Title'), desc: t('landing.feat4Desc') },
    { icon: '🔑', title: t('landing.feat5Title'), desc: t('landing.feat5Desc') },
    { icon: '📜', title: t('landing.feat6Title'), desc: t('landing.feat6Desc') },
    { icon: '🔒', title: t('landing.feat7Title'), desc: t('landing.feat7Desc') },
  ]

  const steps = [
    { step: '01', title: t('landing.step1'), desc: t('landing.step1Desc') },
    { step: '02', title: t('landing.step2'), desc: t('landing.step2Desc') },
    { step: '03', title: t('landing.step3'), desc: t('landing.step3Desc') },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#fdfbf7] text-[#002147] border-b border-stone-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#002147]/5 rounded-full blur-3xl -ml-48 -mb-48"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-32 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#002147]/5 border border-[#002147]/10 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-[0.3em] text-[#002147]/60 mb-10">
            {t('landing.heroBadge')}
          </div>
          <h1 className="text-5xl sm:text-8xl font-serif font-black leading-tight mb-8 tracking-tighter">
            {t('landing.heroTitle')}
            <span className="block text-[#c5a059] mt-2 italic serif-quotes">{t('landing.heroTitleEmph')}</span>
          </h1>
          <div className="h-0.5 w-24 bg-[#c5a059] mx-auto mb-10 opacity-50"></div>
          <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-16 leading-relaxed font-medium italic">
            {t('landing.heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to={isLoggedIn ? '/upload' : '/register'}
              className="bg-[#002147] text-white font-bold px-12 py-5 rounded-sm text-sm uppercase tracking-[0.2em] hover:bg-[#c5a059] transition-all shadow-xl hover:-translate-y-1"
            >
              {isLoggedIn ? t('landing.analyzeBtn') : t('landing.startBtn')}
            </Link>
            {!isLoggedIn && (
              <Link
                to="/login"
                className="border-b-2 border-[#002147]/20 text-[#002147] font-bold px-4 py-2 text-xs hover:border-[#c5a059] transition-all uppercase tracking-widest"
              >
                {t('landing.alreadyAccount')}
              </Link>
            )}
          </div>
          <p className="text-stone-300 text-[10px] uppercase font-bold tracking-[0.4em] mt-16">{t('landing.checks')}</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-6xl font-serif font-bold text-[#002147] mb-8 tracking-tighter uppercase">{t('landing.howItWorks')}</h2>
            <div className="h-1 w-20 bg-[#c5a059] mx-auto mb-8"></div>
            <p className="text-stone-400 text-lg italic font-serif leading-relaxed">{t('landing.howItWorksSub')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-20 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-stone-100 -z-0"></div>
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center relative z-10 group">
                <div className="w-24 h-24 bg-[#fdfbf7] border border-stone-200 text-[#002147] text-3xl font-serif font-bold rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm group-hover:border-[#c5a059] transition-all">
                  {step}
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#002147] mb-6 uppercase tracking-tight">{title}</h3>
                <p className="text-stone-500 leading-relaxed text-sm px-6 italic font-serif">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Updated BG to blend with the new theme */}
      <section className="py-32 bg-[#fdfbf7] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-6xl font-serif font-bold text-[#002147] mb-8 tracking-tighter uppercase">{t('landing.featuresTitle')}</h2>
            <div className="h-1 w-20 bg-[#c5a059] mx-auto mb-8"></div>
            <p className="text-stone-400 text-lg italic font-serif leading-relaxed">{t('landing.featuresSub')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white p-10 border border-stone-100 border-t-4 border-t-[#c5a059] hover:shadow-2xl hover:-translate-y-2 transition-all">
                <div className="text-6xl mb-8 filter sepia opacity-40">{icon}</div>
                <h3 className="text-xl font-serif font-bold text-[#002147] mb-6 uppercase tracking-tight">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed font-serif italic">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer - Thinned out border */}
      <section className="py-16 bg-white border-y border-stone-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-stone-300 text-[10px] uppercase font-bold tracking-[0.3em] leading-loose max-w-2xl mx-auto hover:text-stone-500 transition-colors">
            {t('landing.disclaimerBox')}
          </p>
        </div>
      </section>

      {/* CTA - Final Cream Section */}
      <section className="py-40 bg-[#fdfbf7] text-[#002147] text-center border-t border-stone-200 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c5a059]/5 rounded-full blur-3xl"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-4xl sm:text-7xl font-serif font-black mb-10 tracking-tighter uppercase">{t('landing.ctaTitle')}</h2>
          <div className="h-1 w-24 bg-[#c5a059] mx-auto mb-12"></div>
          <p className="text-stone-400 text-xl mb-16 italic font-serif opacity-80 leading-relaxed">{t('landing.ctaSub')}</p>
          <Link
            to={isLoggedIn ? '/upload' : '/register'}
            className="bg-[#002147] text-white font-bold px-16 py-6 rounded-sm text-sm hover:bg-[#c5a059] transition-all shadow-2xl inline-block uppercase tracking-[0.2em]"
          >
            {isLoggedIn ? t('landing.analyzeBtn') : t('landing.startBtn')}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
