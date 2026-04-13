import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { getHistory, deleteDocument, downloadDocument } from '../api/documentApi'
import { useAuth } from '../context/AuthContext'
import { formatDate, docTypeLabel, docTypeColor } from '../utils/helpers'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const { isLoggedIn } = useAuth()
  const { t } = useTranslation()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  if (!isLoggedIn) return <Navigate to="/login" replace />

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory()
        setDocs(data.documents || [])
      } catch (err) {
        toast.error(t('history.errorLoad'))
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleDelete = async (id, fileName) => {
    if (!window.confirm(t('history.confirmDelete', { fileName }))) return
    setDeletingId(id)
    try {
      await deleteDocument(id)
      setDocs((prev) => prev.filter((d) => d.id !== id))
      toast.success(t('history.successDelete'))
    } catch {
      toast.error(t('history.errorDelete'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-2 border-[#002147] pb-6">
            <div>
              <h1 className="text-4xl font-serif font-black text-[#002147] uppercase tracking-tighter">{t('history.title')}</h1>
              <div className="h-1 w-12 bg-[#c5a059] mt-2 mb-3"></div>
              <p className="text-stone-500 italic font-medium">{t('history.subtitle')}</p>
            </div>
            <Link to="/upload" className="bg-[#002147] text-white font-bold px-8 py-3 rounded-sm text-xs uppercase tracking-widest hover:bg-[#c5a059] transition-all shadow-md">
              {t('history.analyzeNew')}
            </Link>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
               <div className="w-12 h-12 border-2 border-[#c5a059] border-t-[#002147] rounded-full animate-spin"></div>
            </div>
          ) : docs.length === 0 ? (
            <div className="bg-white border-2 border-double border-stone-200 p-20 text-center shadow-inner">
              <span className="text-7xl filter sepia opacity-40">📭</span>
              <h2 className="text-2xl font-serif font-bold text-[#002147] mt-8 mb-4 uppercase tracking-tighter">{t('history.noDocs')}</h2>
              <p className="text-stone-400 mb-10 italic max-w-sm mx-auto">{t('history.noDocsDesc')}</p>
              <Link to="/upload" className="bg-[#c5a059] text-[#002147] font-bold px-10 py-4 rounded-sm text-xs uppercase tracking-widest hover:bg-[#b08d4a] transition-all shadow-lg">
                {t('history.analyzeFirst')}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-stone-200 p-8 hover:border-[#c5a059] transition-all group shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#002147] group-hover:bg-[#c5a059] transition-colors"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                      <span className={`px-4 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${docTypeColor(doc.documentType)}`}>
                        {docTypeLabel(doc.documentType)}
                      </span>
                      {doc.outputLanguage && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">
                          🌐 {doc.outputLanguage}
                        </span>
                      )}
                      <span className="text-xs font-serif italic text-stone-400">{formatDate(doc.createdAt)}</span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#002147] truncate mb-3 group-hover:text-[#c5a059] transition-colors">{doc.fileName}</h3>
                    <p className="text-stone-500 text-sm italic line-clamp-2 leading-relaxed font-serif">{doc.summary}</p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={() => downloadDocument(doc.id)}
                      className="flex-1 md:w-12 h-12 flex items-center justify-center border border-stone-200 text-stone-400 hover:border-[#002147] hover:text-[#002147] transition-all"
                      title="Download Archive"
                    >
                      ⬇️
                    </button>
                    <Link
                      to={`/result/${doc.id}`}
                      className="flex-[3] md:px-8 h-12 flex items-center justify-center bg-stone-50 border border-stone-200 text-[#002147] font-bold text-[10px] uppercase tracking-widest hover:bg-[#002147] hover:text-white transition-all shadow-sm"
                    >
                      {t('history.viewBtn')}
                    </Link>
                    <button
                      onClick={() => handleDelete(doc.id, doc.fileName)}
                      disabled={deletingId === doc.id}
                      className="flex-1 md:w-12 h-12 flex items-center justify-center border border-stone-100 text-stone-300 hover:border-red-800 hover:text-red-800 transition-all disabled:opacity-50"
                    >
                      {deletingId === doc.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
