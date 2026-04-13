import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-[#fdfbf7] border-t border-[#002147]/10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl filter saturate-0 brightness-0 opacity-60">⚖️</span>
          <span className="font-bold text-[#002147] font-serif text-xl tracking-tight uppercase leading-none">{t('nav.brand')}</span>
        </div>
        <div className="h-0.5 w-16 bg-[#c5a059]/40"></div>
        <p className="text-xs text-stone-400 text-center max-w-2xl leading-relaxed italic font-serif">
          {t('footer.disclaimer')}
        </p>
        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-300 font-bold">{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}
