import { useEffect, useState, type FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  Share2,
  Calendar,
  BadgeCheck,
  ExternalLink,
  BookOpen,
  Check,
  Building2,
  Stethoscope,
  GraduationCap,
  CalendarPlus,
  MessageCircle,
} from 'lucide-react'
import { PatientHeader } from '@/components/patient/PatientHeader'
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { MobileBottomNav } from '@/components/patient/MobileBottomNav'
import { ArticleCard } from '@/components/patient/articles/ArticleCard'
import { BookAppointmentModal } from '@/components/patient/BookAppointmentModal'
import { useArticleStore } from '@/store/articleStore'
import { toast } from '@/store/toastStore'
import { IndustrialSpinner } from '@/components/ui/IndustrialSpinner'

export const ArticleDetailPage: FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const {
    activeArticle,
    relatedArticles,
    isLoadingDetail,
    fetchArticleBySlug,
    toggleLike,
    likedArticleIds,
  } = useArticleStore()

  const [scrollProgress, setScrollProgress] = useState(0)
  const [isCopied, setIsCopied] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false)

  // Fetch article on slug change
  useEffect(() => {
    if (slug) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      fetchArticleBySlug(slug)
    }
  }, [slug, fetchArticleBySlug])

  // Track scroll depth for reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isLoadingDetail && !activeArticle) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <PatientHeader
          searchQuery=""
          onSearchChange={() => {}}
          selectedCity="All Cities"
          onSelectCity={() => {}}
          onToggleSidebar={() => setIsSidebarDrawerOpen((prev) => !prev)}
        />
        {isSidebarDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSidebarDrawerOpen(false)}
            />
            <div className="relative z-10 animate-in slide-in-from-left duration-200">
              <PatientSidebar
                activeTab="articles"
                onSelectTab={(tab) => {
                  if (tab === 'home') navigate('/patient/home')
                  if (tab === 'appointments') navigate('/patient/appointments')
                  if (tab === 'doctors') navigate('/patient/doctors')
                  if (tab === 'hospitals') navigate('/patient/hospitals')
                  if (tab === 'records') navigate('/patient/records')
                  if (tab === 'articles') navigate('/patient/articles')
                  setIsSidebarDrawerOpen(false)
                }}
                isMobileDrawer={true}
                onCloseDrawer={() => setIsSidebarDrawerOpen(false)}
              />
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-28">
          <IndustrialSpinner
            size="xl"
            color="brand"
            animationMode="chaser"
            label="Loading medical article..."
          />
          <p className="text-xs font-semibold text-slate-400">
            Fetching peer-reviewed guidance from certified clinical specialists
          </p>
        </div>
      </div>
    )
  }

  if (!activeArticle) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <PatientHeader
          searchQuery=""
          onSearchChange={() => {}}
          selectedCity="All Cities"
          onSelectCity={() => {}}
          onToggleSidebar={() => setIsSidebarDrawerOpen((prev) => !prev)}
        />
        {isSidebarDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSidebarDrawerOpen(false)}
            />
            <div className="relative z-10 animate-in slide-in-from-left duration-200">
              <PatientSidebar
                activeTab="articles"
                onSelectTab={(tab) => {
                  if (tab === 'home') navigate('/patient/home')
                  if (tab === 'appointments') navigate('/patient/appointments')
                  if (tab === 'doctors') navigate('/patient/doctors')
                  if (tab === 'hospitals') navigate('/patient/hospitals')
                  if (tab === 'records') navigate('/patient/records')
                  if (tab === 'articles') navigate('/patient/articles')
                  setIsSidebarDrawerOpen(false)
                }}
                isMobileDrawer={true}
                onCloseDrawer={() => setIsSidebarDrawerOpen(false)}
              />
            </div>
          </div>
        )}
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center space-y-4 py-24">
          <div className="size-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-inner">
            <BookOpen className="size-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Article Not Found</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              The health guide you are looking for may have been archived or moved.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/patient/articles')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-colors"
          >
            Browse Health Library
          </button>
        </div>
      </div>
    )
  }

  const isLiked = likedArticleIds.includes(activeArticle._id)

  const doctorName =
    activeArticle.doctorUserId?.name ||
    activeArticle.doctorId?.userId?.name ||
    activeArticle.doctorId?.name ||
    'Dr. Specialist'
  const doctorAvatar =
    activeArticle.doctorUserId?.avatar ||
    activeArticle.doctorId?.userId?.avatar ||
    activeArticle.doctorId?.avatar
  const doctorSpecialty =
    activeArticle.doctorId?.department ||
    activeArticle.doctorId?.specialization?.[0] ||
    'Healthcare Specialist'
  const doctorQualifications =
    activeArticle.doctorId?.qualifications?.join(', ') || 'MBBS, MD'
  const doctorExperience =
    activeArticle.doctorId?.experienceYears || 8
  const hospital = activeArticle.doctorId?.hospitalId
  const hospitalName = hospital?.name || 'Verified Partner Hospital'

  const formattedDate = activeArticle.publishedAt
    ? new Date(activeArticle.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently Published'

  // Preselected Doctor Data mapped for BookAppointmentModal
  const preselectedDoctorData: any = {
    _id: activeArticle.doctorId?._id || '',
    id: activeArticle.doctorId?._id || '',
    name: doctorName,
    avatar: doctorAvatar,
    specialty: doctorSpecialty,
    department: activeArticle.doctorId?.department || doctorSpecialty,
    qualifications: doctorQualifications,
    experience: `${doctorExperience} years experience`,
    consultationFee: activeArticle.doctorId?.consultationFee || 700,
    hospitalName,
    hospitalCity: hospital?.address?.city || 'Bilaspur',
    hospitalId: hospital?._id || '',
  }

  const handleShareClick = async () => {
    const currentUrl = window.location.href
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(currentUrl)
      setIsCopied(true)
      toast.success('Article link copied to clipboard!', 'Link Copied')
      setTimeout(() => setIsCopied(false), 3000)
    }
  }

  const handleWhatsAppShare = () => {
    const text = `Check out this verified health guide on CarePlus: "${activeArticle.title}" - ${window.location.href}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-blue-600 selection:text-white relative">
      {/* 1. Slim Dynamic Reading Progress Bar at the Top */}
      <div className="fixed top-0 inset-x-0 h-1 bg-slate-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Patient Header */}
      <PatientHeader
        searchQuery=""
        onSearchChange={() => {}}
        selectedCity="All Cities"
        onSelectCity={() => {}}
        onToggleSidebar={() => setIsSidebarDrawerOpen((prev) => !prev)}
      />

      {/* Slide-out Sidebar Drawer for All Screen Sizes */}
      {isSidebarDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSidebarDrawerOpen(false)}
          />
          {/* Slide-out Drawer */}
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            <PatientSidebar
              activeTab="articles"
              onSelectTab={(tab) => {
                if (tab === 'home') navigate('/patient/home')
                if (tab === 'appointments') navigate('/patient/appointments')
                if (tab === 'doctors') navigate('/patient/doctors')
                if (tab === 'hospitals') navigate('/patient/hospitals')
                if (tab === 'records') navigate('/patient/records')
                if (tab === 'articles') navigate('/patient/articles')
                setIsSidebarDrawerOpen(false)
              }}
              isMobileDrawer={true}
              onCloseDrawer={() => setIsSidebarDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Reading Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-7 sm:space-y-9 pb-36 md:pb-16">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-semibold truncate">
            <button
              onClick={() => navigate('/patient/articles')}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>All Articles</span>
            </button>
            <span>/</span>
            <span className="text-slate-400 font-medium truncate">
              {activeArticle.category}
            </span>
          </div>

          {/* Social Share & Like Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* WhatsApp Share */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
              title="Share on WhatsApp"
            >
              <MessageCircle className="size-4" />
            </button>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleShareClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Copy Article URL"
            >
              {isCopied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="size-3.5 text-slate-500" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Article Meta Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              {activeArticle.category}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              <Clock className="size-3" />
              <span>{activeArticle.readTimeMinutes || 4} min read</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              <Calendar className="size-3" />
              <span>{formattedDate}</span>
            </span>
          </div>

          {/* Article Main Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]">
            {activeArticle.title}
          </h1>

          {/* Lead Summary Callout Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/40 border border-blue-200/60 text-slate-700 text-sm sm:text-base leading-relaxed font-medium shadow-2xs">
            <p>{activeArticle.summary}</p>
          </div>
        </div>

        {/* Article Cover Image Banner */}
        {activeArticle.coverImage && (
          <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[16/9] w-full bg-slate-100 border border-slate-200/80">
            <img
              src={activeArticle.coverImage}
              alt={activeArticle.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 2. High-Impact Verified Author Doctor Card */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-800">
          <div className="flex items-center gap-4">
            {doctorAvatar ? (
              <img
                src={doctorAvatar}
                alt={doctorName}
                className="size-16 sm:size-18 rounded-2xl object-cover ring-2 ring-blue-500 shadow-lg shrink-0"
              />
            ) : (
              <div className="size-16 sm:size-18 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center ring-2 ring-blue-500 shadow-lg shrink-0">
                {doctorName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
                <BadgeCheck className="size-3" />
                <span>Verified Specialist Author</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-1.5">
                <span>{doctorName}</span>
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                  ({doctorQualifications})
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 flex-wrap">
                <Stethoscope className="size-3.5 text-blue-400 shrink-0" />
                <span>{doctorSpecialty}</span>
                <span>•</span>
                <Building2 className="size-3.5 text-blue-400 shrink-0" />
                <span>{hospitalName}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {doctorExperience}+ Years of Dedicated Clinical Practice
              </p>
            </div>
          </div>

          {/* Primary CTA: Book Consultation Directly */}
          <div className="shrink-0 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <CalendarPlus className="size-4" />
              <span>Book Appointment (₹{activeArticle.doctorId?.consultationFee || 700})</span>
            </button>
          </div>
        </section>

        {/* 3. Formatted Article Content Body */}
        <div className="prose prose-slate max-w-none space-y-5 text-slate-800 leading-relaxed text-sm sm:text-base font-normal">
          {activeArticle.content.split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim()
            if (!trimmed) return null

            // Check if paragraph is a heading (markdown style # or ## or ###)
            if (trimmed.startsWith('### ')) {
              return (
                <h4
                  key={idx}
                  className="text-lg sm:text-xl font-black text-slate-900 tracking-tight pt-4"
                >
                  {trimmed.replace('### ', '')}
                </h4>
              )
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3
                  key={idx}
                  className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-5 border-b border-slate-100 pb-2"
                >
                  {trimmed.replace('## ', '')}
                </h3>
              )
            }
            if (trimmed.startsWith('# ')) {
              return (
                <h2
                  key={idx}
                  className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-6"
                >
                  {trimmed.replace('# ', '')}
                </h2>
              )
            }

            // Bullet points
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const items = trimmed.split('\n')
              return (
                <ul key={idx} className="list-disc pl-5 space-y-1.5 my-3 text-slate-700">
                  {items.map((it, iIdx) => (
                    <li key={iIdx}>{it.replace(/^[-*]\s+/, '')}</li>
                  ))}
                </ul>
              )
            }

            // Blockquote / Medical Takeaway callout
            if (trimmed.startsWith('> ')) {
              return (
                <blockquote
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50 border-l-4 border-amber-500 text-amber-950 font-medium text-sm sm:text-base my-4"
                >
                  {trimmed.replace(/^>\s*/, '')}
                </blockquote>
              )
            }

            // Standard Paragraph
            return (
              <p key={idx} className="text-slate-700 leading-relaxed">
                {trimmed}
              </p>
            )
          })}
        </div>

        {/* Inline Gallery Images (if any) */}
        {activeArticle.additionalImages && activeArticle.additionalImages.length > 0 && (
          <div className="space-y-3 pt-4">
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Clinical Illustrations & Visuals
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeArticle.additionalImages.map((imgUrl, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs aspect-[4/3] bg-slate-50"
                >
                  <img
                    src={imgUrl}
                    alt={`Illustration ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags Row */}
        {activeArticle.tags && activeArticle.tags.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400">Tags:</span>
            {activeArticle.tags.map((tag) => (
              <span
                key={tag}
                onClick={() => {
                  useArticleStore.getState().setSelectedTag(tag)
                  navigate('/patient/articles')
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-semibold cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 4. Medical Evidence & Reference Citations Box */}
        {activeArticle.referenceLinks && activeArticle.referenceLinks.length > 0 && (
          <section className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <GraduationCap className="size-5 text-blue-600 shrink-0" />
              <span>Evidence-Based Medical Citations & References</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The health claims and clinical recommendations in this article are derived
              from peer-reviewed research, official guidelines, and recognized public health
              authorities:
            </p>
            <ul className="space-y-2 pt-1">
              {activeArticle.referenceLinks.map((ref, idx) => (
                <li key={idx}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    <span>{ref.title || ref.url}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Engagement Action Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Like Button */}
            <button
              type="button"
              onClick={() => toggleLike(activeArticle._id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                isLiked
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Heart
                className={`size-4 ${isLiked ? 'fill-white text-white' : 'text-slate-400'}`}
              />
              <span>{isLiked ? 'Helpful' : 'Mark as Helpful'}</span>
              <span className="opacity-80">({activeArticle.likesCount || 0})</span>
            </button>

            {/* Total Views */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold px-2">
              <Eye className="size-4" />
              <span>{activeArticle.viewsCount || 0} reads</span>
            </div>
          </div>

          {/* Share Action */}
          <button
            type="button"
            onClick={handleShareClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <Share2 className="size-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* 5. Related Articles Section */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Related Guides in {activeArticle.category}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Expand your medical knowledge with related clinical articles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.map((relArticle: any) => (
                <ArticleCard key={relArticle._id} article={relArticle} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Book Appointment Modal Triggered from Doctor Card */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedDoctor={preselectedDoctorData}
        doctorsList={[preselectedDoctorData]}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  )
}

export default ArticleDetailPage
