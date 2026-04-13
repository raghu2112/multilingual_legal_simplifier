import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import ClauseCard from '../components/ClauseCard'
import RiskBadge from '../components/RiskBadge'
import { getDocument, downloadDocument, streamChat } from '../api/documentApi'
import { useAuth } from '../context/AuthContext'
import { formatDate, docTypeLabel, docTypeColor } from '../utils/helpers'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function ResultPage() {
  const { id } = useParams()
  const { isLoggedIn } = useAuth()
  const { t } = useTranslation()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: t('result.chatWelcome') }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatStreaming, setChatStreaming] = useState(false)

  if (!isLoggedIn) return <Navigate to="/login" replace />

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const data = await getDocument(id)
        setDoc(data)
      } catch (err) {
        toast.error('Could not load document. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchDoc()
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Loader message={t('result.loading')} />
      <Footer />
    </div>
  )

  if (!doc) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <span className="text-5xl">😕</span>
        <h2 className="text-xl font-bold text-gray-700">{t('result.notFound')}</h2>
        <Link to="/upload" className="btn-primary">{t('result.analyzeNew')}</Link>
      </div>
      <Footer />
    </div>
  )

  const highRisk = doc.riskClauses?.filter(c => c.severity === 'high') || []
  const mediumRisk = doc.riskClauses?.filter(c => c.severity === 'medium') || []
  const lowRisk = doc.riskClauses?.filter(c => c.severity === 'low') || []

  const tabs = [
    { id: 'summary', label: t('result.tabSummary') },
    { id: 'risks', label: t('result.tabRisks', { count: doc.riskClauses?.length || 0 }) },
    { id: 'terms', label: t('result.tabTerms', { count: doc.keyTerms?.length || 0 }) },
    { id: 'chat', label: t('result.tabChat') },
  ]

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatStreaming) return
    const newMsg = { role: 'user', content: chatInput }
    const updatedMessages = [...chatMessages, newMsg]
    
    setChatMessages(updatedMessages)
    setChatInput('')
    setChatStreaming(true)
    
    setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      await streamChat(doc.id, updatedMessages, (chunk) => {
        setChatMessages((prev) => {
          const arr = [...prev]
          const lastMsg = arr[arr.length - 1]
          lastMsg.content += chunk
          return arr
        })
      })
    } catch (err) {
      toast.error('Failed to get answer from AI.')
    } finally {
      setChatStreaming(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="bg-white border-b-4 border-[#002147] shadow-sm p-10 mb-8 relative">
            <div className="absolute top-0 right-0 p-4">
               <span className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.4em]">{t('result.officialAppraisal')}</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <span className={`px-4 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${docTypeColor(doc.documentType)}`}>
                    {docTypeLabel(doc.documentType)}
                  </span>
                  {doc.detectedLanguage && (
                    <span className="px-4 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest bg-stone-100 text-stone-600 border border-stone-200">
                      📄 {t('result.source')}: {doc.detectedLanguage}
                    </span>
                  )}
                  <span className="text-xs font-serif italic text-stone-400">{formatDate(doc.createdAt)}</span>
                </div>
                <h1 className="text-4xl font-serif font-black text-[#002147] break-all leading-tight mb-2 uppercase tracking-tighter">
                  {doc.fileName}
                </h1>
                <div className="h-0.5 w-16 bg-[#c5a059]"></div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <button 
                  onClick={() => downloadDocument(doc.id)} 
                  className="bg-stone-50 hover:bg-stone-100 text-[#002147] border border-[#002147]/20 font-bold px-6 py-3 rounded-sm text-[10px] uppercase tracking-widest transition-all print-hidden"
                >
                  {t('result.downloadOriginal')}
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="bg-stone-50 hover:bg-stone-100 text-[#c5a059] border border-[#c5a059]/50 font-bold px-6 py-3 rounded-sm text-[10px] uppercase tracking-widest transition-all print-hidden shadow-sm"
                >
                  {t('result.exportPDF', 'Export PDF')}
                </button>
                <Link to="/upload" className="bg-[#c5a059] hover:bg-[#b08d4a] text-[#002147] font-bold px-6 py-3 rounded-sm text-[10px] uppercase tracking-widest transition-all shadow-md print-hidden">
                  + {t('result.analyzeNew')}
                </Link>
              </div>
            </div>

            {/* Risk summary refined */}
            <div className="flex gap-4 mt-10 border-t border-stone-100 pt-8 flex-wrap">
              {highRisk.length > 0 && (
                <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-800 px-6 py-3 shadow-sm">
                  <span className="text-red-800 font-serif font-black text-2xl">{highRisk.length}</span>
                  <span className="text-red-900 text-[10px] font-bold uppercase tracking-widest">{t('result.highRisk')}</span>
                </div>
              )}
              {mediumRisk.length > 0 && (
                <div className="flex items-center gap-3 bg-amber-50 border-l-4 border-amber-700 px-6 py-3 shadow-sm">
                  <span className="text-amber-700 font-serif font-black text-2xl">{mediumRisk.length}</span>
                  <span className="text-amber-800 text-[10px] font-bold uppercase tracking-widest">{t('result.medRisk')}</span>
                </div>
              )}
              {lowRisk.length > 0 && (
                <div className="flex items-center gap-3 bg-green-50 border-l-4 border-green-800 px-6 py-3 shadow-sm">
                  <span className="text-green-800 font-serif font-black text-2xl">{lowRisk.length}</span>
                  <span className="text-green-900 text-[10px] font-bold uppercase tracking-widest">{t('result.lowRisk')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs - Modernized Light Bar */}
          <div className="flex mb-10 bg-white shadow-sm border border-stone-200 rounded-sm overflow-hidden print-hidden">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 py-5 px-6 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${
                  activeTab === id
                    ? 'text-[#002147] bg-[#fdfbf7]'
                    : 'text-stone-400 hover:text-[#002147] hover:bg-stone-50'
                }`}
              >
                {activeTab === id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#c5a059]"></div>
                )}
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px] print-hidden">
            {activeTab === 'summary' && (
              <div className="bg-white border border-stone-200 shadow-sm p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fdfbf7] -mr-16 -mt-16 rotate-45 border-b border-stone-200"></div>
                <h2 className="text-3xl font-serif font-bold text-[#002147] mb-8 uppercase tracking-tighter">{t('result.summaryTitle')}</h2>
                <div className="border-l-4 border-[#c5a059] pl-10 py-2">
                  <p className="text-stone-700 leading-loose text-lg font-medium italic serif-quotes">
                    {doc.summary}
                  </p>
                </div>
                <div className="mt-12 p-6 bg-[#fdfbf7] border italic text-stone-400 text-xs text-center border-stone-200">
                  {t('result.summaryReminder')}
                </div>
              </div>
            )}

            {activeTab === 'risks' && (
              <div className="space-y-6">
                {doc.riskClauses?.length === 0 ? (
                  <div className="bg-white border border-stone-200 p-20 text-center">
                    <span className="text-7xl filter sepia opacity-30">⚖️</span>
                    <h3 className="text-3xl font-serif font-bold text-[#002147] mt-8 uppercase tracking-tighter">{t('result.riskNoMajor')}</h3>
                    <p className="text-stone-400 mt-4 italic">{t('result.riskNoMajorDesc')}</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#fdfbf7] border border-stone-200 text-[#002147] py-4 px-8 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c5a059]">
                        {t('result.criticalAnnotations', { count: doc.riskClauses.length })}
                      </p>
                    </div>
                    {doc.riskClauses.map((clause, i) => (
                      <ClauseCard key={i} {...clause} index={i} />
                    ))}
                  </>
                )}
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="bg-white border border-stone-200 p-12">
                <h2 className="text-3xl font-serif font-bold text-[#002147] mb-10 uppercase tracking-tighter">{t('result.termsTitle')}</h2>
                {doc.keyTerms?.length === 0 ? (
                  <div className="text-center py-20 bg-[#fdfbf7] border border-double border-stone-200">
                    <span className="text-5xl opacity-40">📭</span>
                    <p className="text-stone-400 mt-6 font-bold uppercase tracking-widest text-xs">No explicit terms extracted</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {doc.keyTerms.map(({ term, value }, i) => (
                      <div key={i} className="flex flex-col p-6 bg-white border border-stone-100 relative group hover:border-[#c5a059] transition-all">
                        <p className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.2em] mb-2">{term}</p>
                        <p className="text-xl font-serif font-black text-[#002147]">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="bg-white border-2 border-stone-200 p-8 flex flex-col h-[650px] shadow-xl rounded-sm">
                <div className="flex items-center justify-between mb-6 border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-serif font-bold text-[#002147] uppercase tracking-tighter">{t('result.chatConsult')}</h2>
                  <span className="text-[10px] font-bold px-3 py-1 bg-[#002147] text-white uppercase tracking-widest">{t('result.chatSession')}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-6 space-y-6 p-6 bg-[#fdfbf7] border border-stone-200 shadow-inner rounded-sm">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-6 max-w-[85%] rounded-sm text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#002147] text-white font-bold' : 'bg-white border-l-4 border-[#c5a059] text-stone-800 font-serif italic'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-auto">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder={t('result.chatInput')}
                    className="flex-1 bg-white border border-stone-200 rounded-sm px-6 py-4 text-sm focus:outline-none focus:border-[#002147] shadow-sm font-medium"
                    disabled={chatStreaming}
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={chatStreaming || !chatInput.trim()}
                    className="bg-[#002147] hover:bg-[#c5a059] text-white font-bold px-10 rounded-sm text-xs uppercase tracking-widest disabled:opacity-50 transition-all shadow-md"
                  >
                   {chatStreaming ? t('result.chatEngaging') : t('result.chatSubmit')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Print Only View */}
          <div className="print-only text-black">
            <h2 className="text-2xl font-bold mb-4">{t('result.summaryTitle')}</h2>
            <p className="mb-8">{doc.summary}</p>
            
            {doc.riskClauses && doc.riskClauses.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">{t('result.tabRisks', { count: doc.riskClauses.length })}</h2>
                <div className="mb-8 space-y-4">
                  {doc.riskClauses.map((c, i) => (
                    <div key={i} className="text-sm">
                      <strong>{t('result.clausePrefix')} {i + 1}:</strong> {c.clause}<br/>
                      <em className="text-gray-700">{c.explanation}</em> (Severity: <strong>{c.severity}</strong>)
                      {c.solution && (
                        <div className="mt-1 pl-4 border-l-2 border-green-700 text-green-900">
                          <strong>{t('result.clauseSolution', 'Recommended Action')}:</strong> {c.solution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {doc.keyTerms && doc.keyTerms.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">{t('result.termsTitle')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {doc.keyTerms.map((t, i) => (
                    <div key={i} className="text-sm mb-2">
                      <strong className="uppercase">{t.term}:</strong> {t.value}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
