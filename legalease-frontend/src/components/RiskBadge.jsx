import { severityColor, severityIcon } from '../utils/helpers'
import { useTranslation } from 'react-i18next'

export default function RiskBadge({ severity }) {
  const { t } = useTranslation()

  // For simplicity, we can use the result translations for severity since they contain the full string (e.g. "High Risk Clauses") or we can just translate the severity word. I'll translate "RISK" as a fallback, but the JSON only has full labels. Let's add a small mapping:
  let label = severity.toUpperCase() + ' RISK';
  if (severity === 'high') label = t('result.highRisk');
  if (severity === 'medium') label = t('result.medRisk');
  if (severity === 'low') label = t('result.lowRisk');

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${severityColor(severity)}`}>
      <span className="text-[8px] opacity-70">{severityIcon(severity)}</span> {label}
    </span>
  )
}
