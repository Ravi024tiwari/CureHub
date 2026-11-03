import { useState, useEffect, type FC } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Heart,
  Edit3,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Send,
  Save,
} from 'lucide-react'
import { DoctorSidebar, DoctorHeader } from '@/components/doctor/dashboard'
import { useAuthStore } from '@/store/authStore'
import { useDoctorStore } from '@/store/doctorStore'
import { articleService } from '@/services/articleService'
import {
  ARTICLE_CATEGORIES,
  ArticleStatus,
  type HealthArticleItem,
  type ArticleCategory,
  type ReferenceLink,
} from '@/types/article'
import { toast } from '@/store/toastStore'
import { Button } from '@/components/ui/button'
import { IndustrialSpinner } from '@/components/ui/IndustrialSpinner'

// Quick preset medical cover images for convenience
const PRESET_COVER_IMAGES = [
  {
    label: 'Heart & Cardiology',
    url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Nutrition & Diet',
    url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Mental Health & Brain',
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Fitness & Lifestyle',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Clinical Medicine & Lab',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Pediatrics & Care',
    url: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1200&q=80',
  },
]

export const DoctorArticlesPage: FC = () => {
  const { user } = useAuthStore()
  const { dashboardData, fetchDoctorDashboard } = useDoctorStore()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [articles, setArticles] = useState<HealthArticleItem[]>([])
  const [analytics, setAnalytics] = useState({
    totalArticles: 0,
    publishedCount: 0,
    draftCount: 0,
    totalViews: 0,
    totalLikes: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('All')

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<HealthArticleItem | null>(null)

  // Form State
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState<ArticleCategory>(ARTICLE_CATEGORIES[0])
  const [formSummary, setFormSummary] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCoverImage, setFormCoverImage] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formReadTime, setFormReadTime] = useState<number>(4)
  const [formStatus, setFormStatus] = useState<ArticleStatus>(ArticleStatus.PUBLISHED)
  const [formRefLinks, setFormRefLinks] = useState<ReferenceLink[]>([
    { title: 'WHO Health Guidelines', url: 'https://www.who.int' },
  ])

  useEffect(() => {
    fetchDoctorDashboard()
    loadDoctorArticles()
  }, [])

  const loadDoctorArticles = async () => {
    try {
      setIsLoading(true)
      const data = await articleService.getMyDoctorArticles({
        status: activeTab === 'ALL' ? undefined : activeTab,
        search: searchQuery || undefined,
      })
      setArticles(data.articles || [])
      if (data.analytics) {
        setAnalytics(data.analytics)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load doctor articles')
    } finally {
      setIsLoading(false)
    }
  }

  // Reload when tab or search changes
  useEffect(() => {
    loadDoctorArticles()
  }, [activeTab])

  const doctorInfo = dashboardData?.doctorInfo
  const doctorName =
    doctorInfo?.name ||
    (user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Doctor')
  const department = doctorInfo?.department || 'General OPD'
  const avatar = doctorInfo?.avatar || user?.avatar || null

  const resetForm = () => {
    setFormTitle('')
    setFormCategory(ARTICLE_CATEGORIES[0])
    setFormSummary('')
    setFormContent('')
    setFormCoverImage(PRESET_COVER_IMAGES[0].url)
    setFormTags('')
    setFormReadTime(4)
    setFormStatus(ArticleStatus.PUBLISHED)
    setFormRefLinks([{ title: 'WHO Health Guidelines', url: 'https://www.who.int' }])
    setEditingArticleId(null)
  }

  const openNewArticleModal = () => {
    resetForm()
    setIsEditorOpen(true)
  }

  const openEditArticleModal = (article: HealthArticleItem) => {
    setEditingArticleId(article._id)
    setFormTitle(article.title)
    setFormCategory(article.category as ArticleCategory)
    setFormSummary(article.summary)
    setFormContent(article.content)
    setFormCoverImage(article.coverImage || '')
    setFormTags(article.tags?.join(', ') || '')
    setFormReadTime(article.readTimeMinutes || 4)
    setFormStatus(article.status as ArticleStatus)
    setFormRefLinks(
      article.referenceLinks && article.referenceLinks.length > 0
        ? article.referenceLinks
        : [{ title: '', url: '' }]
    )
    setIsEditorOpen(true)
  }

  const handleAddRefLink = () => {
    setFormRefLinks((prev) => [...prev, { title: '', url: '' }])
  }

  const handleUpdateRefLink = (index: number, field: 'title' | 'url', val: string) => {
    setFormRefLinks((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: val }
      return copy
    })
  }

  const handleRemoveRefLink = (index: number) => {
    setFormRefLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveArticle = async (publishImmediate = false) => {
    if (!formTitle.trim()) {
      toast.warning('Please enter an article title')
      return
    }
    if (!formSummary.trim()) {
      toast.warning('Please provide a concise summary or key takeaways')
      return
    }
    if (!formContent.trim()) {
      toast.warning('Please enter the clinical article content')
      return
    }

    try {
      setIsSubmitting(true)
      const tagsArray = formTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)

      const validRefLinks = formRefLinks.filter((r) => r.title.trim() && r.url.trim())

      const payload = {
        title: formTitle.trim(),
        category: formCategory,
        summary: formSummary.trim(),
        content: formContent.trim(),
        coverImage: formCoverImage.trim() || undefined,
        tags: tagsArray,
        readTimeMinutes: Number(formReadTime) || 4,
        status: publishImmediate ? ArticleStatus.PUBLISHED : formStatus,
        referenceLinks: validRefLinks,
      }

      if (editingArticleId) {
        await articleService.updateArticle(editingArticleId, payload)
        toast.success('Article updated successfully!', 'Changes Saved')
      } else {
        await articleService.createArticle(payload)
        toast.success(
          publishImmediate
            ? 'Article published live to patients!'
            : 'Article saved successfully!',
          'Article Created'
        )
      }

      setIsEditorOpen(false)
      resetForm()
      loadDoctorArticles()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save article')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return
    try {
      await articleService.deleteArticle(articleToDelete._id)
      toast.success('Article removed successfully', 'Article Deleted')
      setArticleToDelete(null)
      loadDoctorArticles()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete article')
    }
  }

  const handleQuickStatusToggle = async (article: HealthArticleItem) => {
    try {
      const newStatus =
        article.status === ArticleStatus.PUBLISHED
          ? ArticleStatus.DRAFT
          : ArticleStatus.PUBLISHED
      await articleService.updateArticle(article._id, { status: newStatus })
      toast.success(
        newStatus === ArticleStatus.PUBLISHED
          ? 'Article is now live to all patients!'
          : 'Article moved back to drafts',
        'Status Updated'
      )
      loadDoctorArticles()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update article status')
    }
  }

  const filteredArticles = articles.filter((a) => {
    if (filterCategory !== 'All' && a.category !== filterCategory) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen shrink-0">
        <DoctorSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <DoctorSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Body Scroll Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col min-w-0 transition-all">
        {/* Top Header */}
        <DoctorHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          doctorName={doctorName}
          department={department}
          avatar={avatar}
        />

        {/* Content Container */}
        <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 pb-20">
          {/* Top Banner & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
            <div className="space-y-1 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-blue-100 text-xs font-bold">
                <Sparkles className="size-3.5 text-amber-300" />
                <span>Doctor Author Studio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Medical & Wellness Articles
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 font-medium max-w-xl">
                Publish peer-reviewed clinical knowledge to educate patients, build trust, and
                increase appointment bookings directly from your articles.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                type="button"
                onClick={openNewArticleModal}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-xs sm:text-sm shadow-lg shadow-black/10 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="size-4 stroke-[3]" />
                <span>Write New Article</span>
              </button>
            </div>
          </div>

          {/* Practice Analytics KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Total Authored</span>
                <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="size-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">
                {analytics.totalArticles}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Articles in library</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Live Published</span>
                <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="size-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">
                {analytics.publishedCount}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Visible to patients</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Drafts</span>
                <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="size-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-600">
                {analytics.draftCount}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Work in progress</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Patient Reads</span>
                <div className="size-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Eye className="size-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-sky-600">
                {analytics.totalViews}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Total views</p>
            </div>

            <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Helpful Likes</span>
                <div className="size-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="size-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-rose-600">
                {analytics.totalLikes}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Patient endorsements</p>
            </div>
          </div>

          {/* Filtering & Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({analytics.totalArticles})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('PUBLISHED')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'PUBLISHED'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Published ({analytics.publishedCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('DRAFT')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'DRAFT'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Drafts ({analytics.draftCount})
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title or tag..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-8.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {ARTICLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Articles Listing Grid */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <IndustrialSpinner
                size="lg"
                color="brand"
                animationMode="chaser"
                label="Loading your authored articles..."
              />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
              <div className="size-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <BookOpen className="size-8 stroke-[1.8]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900">No Articles Yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Start writing verified health guides and medical advice for CarePlus patients.
                </p>
              </div>
              <Button
                onClick={openNewArticleModal}
                className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9.5 px-4 cursor-pointer"
              >
                Write Your First Article
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredArticles.map((article) => {
                const isPublished = article.status === ArticleStatus.PUBLISHED

                return (
                  <div
                    key={article._id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Cover Image */}
                      {article.coverImage && (
                        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span
                            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                              isPublished
                                ? 'bg-emerald-500 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {article.status}
                          </span>
                        </div>
                      )}

                      {/* Content Card Body */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
                            {article.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                            <Clock className="size-3" />
                            <span>{article.readTimeMinutes || 4} min</span>
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {article.title}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {article.summary}
                        </p>

                        {/* Article Metrics */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <Eye className="size-3.5 text-slate-400" />
                              <span>{article.viewsCount || 0}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <Heart className="size-3.5 text-rose-500" />
                              <span>{article.likesCount || 0}</span>
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400">
                            {article.publishedAt
                              ? new Date(article.publishedAt).toLocaleDateString()
                              : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-3 px-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {isPublished && (
                          <Link
                            to={`/articles/${article.slug || article._id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white transition-colors"
                            title="View Public Article"
                          >
                            <ExternalLink className="size-4" />
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditArticleModal(article)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit3 className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setArticleToDelete(article)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      {/* Quick Status Switcher */}
                      <button
                        type="button"
                        onClick={() => handleQuickStatusToggle(article)}
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          isPublished
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isPublished ? 'Unpublish' : 'Publish Live'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Write / Edit Article Modal Drawer */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Edit3 className="size-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {editingArticleId ? 'Edit Medical Article' : 'Author New Health Guide'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Evidence-based articles reviewed and attributed directly to your profile
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="size-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-extrabold text-slate-800">
                    Article Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Recognizing Early Symptoms of Cardiovascular Distress"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold text-slate-800 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ArticleCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white focus:outline-none cursor-pointer text-xs"
                  >
                    {ARTICLE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Read Time & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">Est. Read Time (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-extrabold text-slate-800">
                    Topic Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="e.g. heart health, blood pressure, wellness, diet"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Cover Image Selector */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="size-4 text-blue-600" />
                  <span>Article Cover Visual</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    placeholder="Paste high-res image URL (Unsplash, Cloudinary, etc.)"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-slate-700 text-xs"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">
                    Quick Presets:
                  </span>
                  {PRESET_COVER_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormCoverImage(preset.url)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Image Preview */}
                {formCoverImage && (
                  <div className="h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                    <img
                      src={formCoverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={() => toast.warning('Image URL failed to load')}
                    />
                  </div>
                )}
              </div>

              {/* Summary / Lead Paragraph */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800">
                  Lead Summary / Key Medical Takeaways <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="2-3 sentence overview explaining what the patient will learn from this guide..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Full Content Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800">
                    Full Clinical Article Content <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Supports ## Headings, - Bullets, &gt; Callouts
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder={`Write your medical insights in clear, accessible language...

## 1. Understanding the Root Causes
Cardiovascular conditions often develop gradually due to chronic vascular stress...

> Clinical Note: If you experience persistent chest tightness or radiating shoulder discomfort, seek emergency medical care immediately.

## 2. Evidence-Based Preventative Steps
- Maintain a balanced sodium intake
- Engage in 30 minutes of aerobic physical activity
- Monitor baseline blood pressure regularly`}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 font-normal font-mono text-slate-800 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Evidence-Based Reference Links */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <LinkIcon className="size-4 text-blue-600" />
                    <span>Peer-Reviewed References & Citations</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRefLink}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Citation</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formRefLinks.map((ref, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ref.title}
                        onChange={(e) => handleUpdateRefLink(idx, 'title', e.target.value)}
                        placeholder="Citation Title (e.g. ICMR Guidelines, Lancet Journal)"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                      />
                      <input
                        type="url"
                        value={ref.url}
                        onChange={(e) => handleUpdateRefLink(idx, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                      {formRefLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRefLink(idx)}
                          className="size-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    formStatus === ArticleStatus.PUBLISHED
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {formStatus}
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setIsEditorOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none text-xs font-bold rounded-xl h-10 px-4 cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setFormStatus(ArticleStatus.DRAFT)
                    handleSaveArticle(false)
                  }}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none text-xs font-bold rounded-xl h-10 px-4 border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Save className="size-3.5" />
                  <span>Save Draft</span>
                </Button>

                <Button
                  onClick={() => {
                    setFormStatus(ArticleStatus.PUBLISHED)
                    handleSaveArticle(true)
                  }}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none text-xs font-black rounded-xl h-10 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 cursor-pointer inline-flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <IndustrialSpinner size="xs" color="brand" animationMode="chaser" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  <span>Publish Now</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="size-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Delete Medical Article?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-bold text-slate-800">"{articleToDelete.title}"</span>?
                This action is permanent and will remove it from all patient feeds.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setArticleToDelete(null)}
                className="text-xs font-bold rounded-xl h-9.5 px-4 cursor-pointer"
              >
                Keep Article
              </Button>
              <Button
                onClick={handleDeleteArticle}
                className="text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-9.5 px-4 cursor-pointer"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorArticlesPage
