import RiskBadge from './RiskBadge'
import { useTranslation } from 'react-i18next'

export default function ClauseCard({ clause, explanation, solution, relatedSections, severity, index }) {
  const { t } = useTranslation()

  return (
    <div className={`rounded-sm border-l-8 p-6 shadow-sm border-stone-200 bg-white ${
      severity === 'high' ? 'border-l-[#991b1b]' :
      severity === 'medium' ? 'border-l-[#92400e]' :
      'border-l-[#166534]'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">{t('result.clausePrefix')}{index + 1}</span>
        <RiskBadge severity={severity} />
      </div>
      <p className="text-[#002147] font-serif font-bold mb-4 text-base leading-relaxed italic">
        "{clause}"
      </p>
      
      {relatedSections && relatedSections !== 'N/A' && (
        <div className="mb-4 inline-block bg-stone-100 border border-stone-200 px-3 py-1 text-xs font-bold text-stone-500 uppercase tracking-widest rounded-sm">
          📑 {relatedSections}
        </div>
      )}

      <div className="mt-2 pt-4 border-t border-stone-100">
        <p className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.2em] mb-2 font-sans">{t('result.clauseMeans')}</p>
        <p className="text-stone-600 text-sm leading-relaxed font-medium mb-4">{explanation}</p>
        
        {solution && (
          <div className="bg-[#f0fbf4] border border-[#166534]/20 p-4 rounded-sm mt-4">
            <p className="text-[10px] font-bold text-[#166534] uppercase tracking-[0.2em] mb-2 font-sans flex items-center gap-2">
              <span>💡</span> {t('result.clauseSolution', 'Recommended Action')}
            </p>
            <p className="text-[#166534]/90 text-sm leading-relaxed font-medium">{solution}</p>
          </div>
        )}
      </div>
    </div>
  )
}
