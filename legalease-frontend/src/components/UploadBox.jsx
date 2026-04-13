import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { uploadDocument } from '../api/documentApi'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'English', label: 'English', flag: '🇬🇧' },
  { code: 'Hindi', label: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'Telugu', label: 'Telugu (తెలుగు)', flag: '🇮🇳' },
  { code: 'Tamil', label: 'Tamil (தமிழ்)', flag: '🇮🇳' },
  { code: 'Malayalam', label: 'Malayalam (മലയാളം)', flag: '🇮🇳' },
  { code: 'Kannada', label: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' },
  { code: 'Bengali', label: 'Bengali (বাংলা)', flag: '🇮🇳' },
  { code: 'Marathi', label: 'Marathi (मराठी)', flag: '🇮🇳' },
  { code: 'Gujarati', label: 'Gujarati (ગુજરાતી)', flag: '🇮🇳' },
  { code: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳' }
]

export default function UploadBox() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const navigate = useNavigate()
  const { t } = useTranslation()

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0]
      if (err.code === 'file-too-large') {
        toast.error(t('upload.errorLarge'))
      } else {
        toast.error(t('upload.errorType'))
      }
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setProgress(t('upload.dropzoneUpload'))

    try {
      setTimeout(() => setProgress(t('upload.dropzoneExtract')), 1500)
      setTimeout(() => setProgress(t('upload.dropzoneAI')), 3000)

      const result = await uploadDocument(file, selectedLanguage)
      toast.success(t('upload.success'))
      navigate(`/result/${result.id}`)
    } catch (err) {
      const msg = err?.response?.data?.detail || t('upload.errorFailed')
      toast.error(msg)
      setUploading(false)
      setProgress('')
    }
  }, [navigate, selectedLanguage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false,
    disabled: uploading,
  })

  return (
    <div className="w-full">
      {/* Language Selector */}
      <div className="mb-10 p-8 bg-stone-50 border-l-4 border-[#c5a059]">
        <label htmlFor="language-select" className="block text-xl font-serif font-bold text-[#002147] mb-2">
          {t('upload.outputLangLabel')}
        </label>
        <p className="text-sm text-stone-500 mb-5 italic leading-relaxed">
          {t('upload.outputLangDesc')}
        </p>
        <div className="relative max-w-sm">
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={uploading}
            className="w-full appearance-none bg-white border border-[#002147]/20 rounded-sm px-5 py-3.5 pr-12 text-[#002147] font-semibold text-sm focus:outline-none focus:border-[#c5a059] focus:ring-0 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-stone-50 shadow-sm"
          >
            {LANGUAGES.map(({ code, label, flag }) => (
              <option key={code} value={code}>
                {flag} &nbsp; {label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#c5a059]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`
          relative border-[3px] border-double rounded-sm p-16 text-center cursor-pointer transition-all duration-500
          ${isDragActive ? 'border-[#c5a059] bg-[#fdfbf7] scale-[1.01]' : 'border-stone-300 hover:border-[#002147] hover:bg-[#002147]/5 shadow-inner'}
          ${uploading ? 'cursor-not-allowed opacity-80' : ''}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-[#c5a059] rounded-full animate-ping opacity-25" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-t-2 border-b-2 border-[#002147] rounded-full animate-spin" />
              </div>
            </div>
            <div>
              <p className="text-[#002147] font-serif font-bold text-2xl mb-2">{progress}</p>
              <div className="h-px w-20 bg-[#c5a059] mx-auto mb-3"></div>
              <p className="text-stone-400 text-xs italic">{t('upload.dontClose')}</p>
              <p className="text-[#c5a059] text-[10px] mt-4 uppercase tracking-[0.2em] font-bold">
                {t('upload.outputLangShow')} {selectedLanguage}
              </p>
            </div>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-6xl filter sepia opacity-80">📜</span>
            <p className="text-[#002147] font-serif font-bold text-2xl uppercase tracking-wider">{t('upload.dropRelease')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center border-4 border-double border-stone-200">
              <span className="text-5xl filter sepia-[0.5]">📂</span>
            </div>
            <div>
              <p className="text-[#002147] font-serif font-bold text-3xl mb-3">
                {t('upload.dropTitle')}
              </p>
              <div className="h-0.5 w-16 bg-[#c5a059] mx-auto mb-4"></div>
              <p className="text-stone-500 text-sm italic">{t('upload.orBrowse')}</p>
            </div>
            <div className="mt-4 flex items-center gap-3 text-[10px] uppercase font-bold tracking-[0.15em] text-stone-400">
              <span className="border-b border-[#c5a059] pb-0.5 text-[#002147]/60">PDF, Word, JPG, PNG</span>
              <span className="text-[#c5a059]">✦</span>


              <span className="border-b border-[#c5a059] pb-0.5 text-[#002147]/60">{t('upload.anyLang')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Supported document types */}
      <div className="mt-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#c5a059] mb-6">{t('upload.expertiseTitle')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {['rental', 'employment', 'nda', 'terms', 'loan', 'service'].map((type) => (
            <div key={type} className="bg-white border border-stone-100 py-3 px-1 hover:border-[#c5a059] transition-colors shadow-sm">
              <p className="text-[10px] font-bold text-[#002147] leading-tight uppercase tracking-tight">{t(`upload.docTypes.${type}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
