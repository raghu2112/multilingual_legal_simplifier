import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, detectSystemLanguage } from '../constants'

export default function LanguageModal({ onConfirm }) {
  const { t, i18n } = useTranslation()

  const handleSystemLanguage = () => {
    const sysLang = detectSystemLanguage()
    confirmSelection(sysLang)
  }

  const confirmSelection = (langCode) => {
    i18n.changeLanguage(langCode)
    localStorage.setItem('le_lang_confirmed', 'true')
    onConfirm()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#002147]/80 backdrop-blur-xl p-6">
      <div className="bg-[#f0ece5] w-full max-w-2xl flex flex-col rounded-[3.5rem] shadow-2xl border-4 border-white relative overflow-hidden">
        
        <div className="p-10 md:p-14">
          <div className="text-center mb-10">
            <span className="text-4xl mb-3 block filter saturate-0 opacity-40">🌐</span>
            <h2 className="text-2xl font-serif font-black text-[#002147] mb-2 uppercase tracking-tighter leading-none">
              {t('modal.title')}
            </h2>
            <div className="h-1 w-10 bg-[#c5a059] mx-auto opacity-40"></div>
          </div>

          {/* Manual Selection Grid: 5x2 */}
          <div className="grid grid-cols-5 gap-4 mb-10">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => confirmSelection(code)}
                className="flex flex-col items-center justify-center aspect-square p-2 bg-white border-2 border-transparent hover:border-[#c5a059] hover:shadow-xl transition-all rounded-3xl group"
              >
                <span className="text-[11px] font-bold font-serif text-[#002147] tracking-tight text-center leading-tight">
                  {label}
                </span>
                <div className="mt-2 w-4 h-0.5 bg-stone-100 group-hover:bg-[#c5a059] transition-colors"></div>
              </button>
            ))}
          </div>

          <div className="relative flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-stone-300/30"></div>
            <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-stone-400">{t('modal.choice')}</span>
            <div className="flex-1 h-px bg-stone-300/30"></div>
          </div>

          {/* Moved & Smaller: System Language */}
          <div className="flex justify-center">
            <button
              onClick={handleSystemLanguage}
              className="group flex items-center gap-3 px-8 py-3 bg-white hover:bg-[#002147] border border-stone-200 shadow-sm transition-all rounded-full"
            >
              <p className="text-[#002147] group-hover:text-white font-bold uppercase tracking-widest text-[9px]">
                {t('modal.deviceSettings')}
              </p>
              <span className="text-md group-hover:translate-x-1 transition-transform text-[#c5a059]">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white/50 p-4 border-t border-white/40 text-center">
          <p className="text-[8px] text-stone-400 uppercase tracking-[0.5em] font-bold">
            {t('footer.portalBadge')}
          </p>
        </div>
      </div>
    </div>
  )
}
