import { useEffect, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  BookOpen,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { PatientHeader } from '@/components/patient/PatientHeader'
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { MobileBottomNav } from '@/components/patient/MobileBottomNav'
import { ArticleCard } from '@/components/patient/articles/ArticleCard'
import { ArticleHeroFeatured } from '@/components/patient/articles/ArticleHeroFeatured'
import { ArticleCategoryPills } from '@/components/patient/articles/ArticleCategoryPills'
import { useArticleStore } from '@/store/articleStore'
import { IndustrialSpinner } from '@/components/ui/IndustrialSpinner'
import { Button } from '@/components/ui/button'

export const PatientArticlesPage: FC = () => {
  const navigate = useNavigate()
  const {
    articles,
    featuredArticle,
    selectedCategory,
    searchQuery,
    sortBy,
    totalCount,
    hasMore,
    isLoading,
    fetchArticles,
    fetchNextPage,
    fetchCategories,
    setSearchQuery,
    setSortBy,
    clearFilters,
  } = useArticleStore()

  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchQuery)

  useEffect(() => {
    fetchCategories()
    fetchArticles(true)
  }, [fetchArticles, fetchCategories])

  // Debounced search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Patient Header */}
      <PatientHeader
        searchQuery=""
        onSearchChange={() => {}}
        selectedCity="All Cities"
        onSelectCity={() => {}}
        onToggleSidebar={() => setIsSidebarDrawerOpen((prev) => !prev)}
      />

      {/* Main Container with Collapsible Sidebar Drawer & Content */}
      <div className="flex-1 flex w-full">
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
                  if (tab === 'articles') setIsSidebarDrawerOpen(false)
                }}
                isMobileDrawer={true}
                onCloseDrawer={() => setIsSidebarDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
          <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 py-5 sm:py-8 space-y-6 sm:space-y-8">
            {/* Top Title & Search Cluster */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-xs">
                  <Sparkles className="size-3.5 text-blue-600" />
                  <span>Doctor Verified Health Intelligence</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                  Health Articles & Wellness Guides
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
                  Evidence-based healthcare insights, preventative guidance, and medical
                  breakthroughs authored directly by certified specialist physicians.
                </p>
              </div>

              {/* Search Input & Sort Selector */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-72 lg:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search articles, topics, doctors..."
                    className="w-full pl-10 pr-9 py-2 text-xs font-semibold bg-white border border-slate-200/90 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </form>

                {/* Sort By Dropdown */}
                <div className="relative shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full sm:w-auto h-9.5 px-3.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="latest">Latest Published</option>
                    <option value="popular">Most Read</option>
                    <option value="likes">Most Liked</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Horizontal Filter Pills */}
            <ArticleCategoryPills />

            {/* Featured Editorial Hero (Visible when no specific query active) */}
            {!searchQuery && selectedCategory === 'All' && featuredArticle && (
              <section className="space-y-3">
                <ArticleHeroFeatured article={featuredArticle} />
              </section>
            )}

            {/* Active Filter Pill Summary */}
            {(searchQuery || selectedCategory !== 'All') && (
              <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/60 rounded-2xl p-3 px-4 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-600">Active Filters:</span>
                  {selectedCategory !== 'All' && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-extrabold">
                      Category: {selectedCategory}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-white border border-blue-200 text-blue-700 font-extrabold">
                      Query: "{searchQuery}"
                    </span>
                  )}
                  <span className="text-slate-500 font-medium">
                    ({totalCount} {totalCount === 1 ? 'article' : 'articles'} found)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Articles Collection Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {selectedCategory === 'All'
                      ? 'Explore All Articles'
                      : `${selectedCategory} Guides`}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200/80">
                    {totalCount}
                  </span>
                </div>
              </div>

              {/* Loading Spinner */}
              {isLoading && articles.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <IndustrialSpinner
                    size="xl"
                    color="brand"
                    animationMode="chaser"
                    label="Loading certified health guides..."
                  />
                  <p className="text-xs font-semibold text-slate-400">
                    Retrieving medical articles authored by verified specialists
                  </p>
                </div>
              ) : articles.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-3xl border border-slate-200/80 p-12 sm:p-16 text-center space-y-4 max-w-md mx-auto shadow-xs">
                  <div className="size-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                    <BookOpen className="size-8 stroke-[1.8]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      No Health Articles Found
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      We couldn't find any articles matching your search or category filter.
                    </p>
                  </div>
                  <Button
                    onClick={clearFilters}
                    className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9.5 px-4 cursor-pointer"
                  >
                    Reset All Filters
                  </Button>
                </div>
              ) : (
                /* Articles Responsive Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>
              )}

              {/* Load More Pagination Button */}
              {hasMore && (
                <div className="pt-6 flex justify-center">
                  <Button
                    onClick={fetchNextPage}
                    disabled={isLoading}
                    variant="outline"
                    className="h-11 px-6 rounded-2xl border-slate-300 font-extrabold text-xs text-slate-800 hover:bg-slate-100 shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    {isLoading && <RefreshCw className="size-3.5 animate-spin text-blue-600" />}
                    <span>Load More Articles</span>
                  </Button>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  )
}

export default PatientArticlesPage
