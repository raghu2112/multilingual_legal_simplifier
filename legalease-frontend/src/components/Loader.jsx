import { useTranslation } from 'react-i18next'

export default function Loader({ message }) {
  const { t } = useTranslation()
  const displayMsg = message || t('loader.default')

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="w-16 h-16 border-2 border-stone-200 border-t-[#c5a059] rounded-full animate-spin" />
      <p className="text-stone-400 font-serif italic text-lg">{displayMsg}</p>
    </div>
  )
}
