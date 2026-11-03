import { type FC } from 'react'
import {
  HeartPulse,
  Activity,
  Sparkles,
  Apple,
  Brain,
  Baby,
  Bone,
  Zap,
  Flame,
  Venus,
  Dumbbell,
  LayoutGrid,
} from 'lucide-react'
import { ARTICLE_CATEGORIES, type ArticleCategory } from '@/types/article'
import { useArticleStore } from '@/store/articleStore'

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Cardiology':
      return HeartPulse
    case 'Dermatology':
      return Sparkles
    case 'Nutrition & Diet':
      return Apple
    case 'Mental Health':
      return Brain
    case 'Pediatrics':
      return Baby
    case 'Orthopedics':
      return Bone
    case 'Neurology':
      return Zap
    case 'Diabetes & Endocrinology':
      return Flame
    case "Women's Health":
      return Venus
    case 'Fitness & Lifestyle':
      return Dumbbell
    case 'General Health':
      return Activity
    default:
      return LayoutGrid
  }
}

export const ArticleCategoryPills: FC = () => {
  const { selectedCategory, setSelectedCategory, categories } = useArticleStore()

  const countMap = new Map<string, number>()
  categories.forEach((c) => countMap.set(c.name, c.count))

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {ARTICLE_CATEGORIES.map((cat: ArticleCategory) => {
        const isSelected = selectedCategory === cat
        const Icon = getCategoryIcon(cat)
        const count = countMap.get(cat)

        return (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`flex items-center gap-2 px-3.5 sm:px-4.5 py-2 rounded-2xl text-xs sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              isSelected
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 active:scale-95'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 hover:border-blue-200 active:scale-95'
            }`}
          >
            <Icon
              className={`size-3.5 shrink-0 ${
                isSelected ? 'text-white' : 'text-blue-600'
              }`}
            />
            <span>{cat}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ArticleCategoryPills
