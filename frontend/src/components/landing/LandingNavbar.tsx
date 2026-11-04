import { useState, useEffect, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HeartPulse,
  PhoneCall,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Stethoscope,
  Users,
  Zap,
  Building2,
  BookOpen,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/auth'
import { Button } from '@/components/ui/button'

interface LandingNavbarProps {
  onOpenEmergencyModal: () => void
}

export const LandingNavbar: FC<LandingNavbarProps> = ({ onOpenEmergencyModal }) => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')

  // Nav links arranged in the EXACT chronological render order of LandingPage components:
  // 1. Specialties -> 2. Find Doctors -> 3. How It Works -> 4. Hospitals -> 5. Health Articles
  const navLinks = [
    { id: 'specialties', label: 'Specialties', href: '#specialties', icon: Stethoscope },
    { id: 'doctors', label: 'Find Doctors', href: '#doctors', icon: Users },
    { id: 'how-it-works', label: 'How It Works', href: '#how-it-works', icon: Zap },
    { id: 'hospitals', label: 'Hospitals', href: '#hospitals', icon: Building2 },
    { id: 'articles', label: 'Health Articles', href: '#articles', icon: BookOpen },
  ]

  // Production-Grade ScrollSpy: Synchronizes active navbar tab with the in-view section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 20)

      // If at top hero fold, clear active indicator
      if (scrollY < 260) {
        setActiveSection('')
        return
      }

      // Check current section threshold relative to viewport (offset for sticky header)
      const scrollPosition = scrollY + 160
      const sectionIds = ['specialties', 'doctors', 'how-it-works', 'hospitals', 'articles']
      let currentActive = ''

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentActive = id
            break
          }
        }
      }

      // If scrolled to near the bottom of the page, activate the last section
      if (
        window.innerHeight + scrollY >=
        document.documentElement.scrollHeight - 140
      ) {
        currentActive = 'articles'
      }

      setActiveSection(currentActive)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getDashboardPath = () => {
    if (!user) return '/login'
    switch (user.role) {
      case UserRole.DOCTOR:
        return '/dashboard'
      case UserRole.HOSPITAL_ADMIN:
        return '/hospital-admin/dashboard'
      case UserRole.SUPER_ADMIN:
        return '/super-admin/dashboard'
      default:
        return '/patient/home'
    }
  }

  const handleNavClick = (link: (typeof navLinks)[0]) => {
    setIsMobileMenuOpen(false)
    setActiveSection(link.id)
    const el = document.querySelector(link.href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    if (window.location.pathname === '/' || window.location.pathname === '/landing') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setActiveSection('')
    }
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/90 py-2.5 sm:py-3'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10 xl:px-14 flex items-center justify-between gap-6">
        {/* Brand Logo with Smooth Scroll-to-Top */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group shrink-0">
          <div className="size-10.5 rounded-2xl bg-gradient-to-tr from-[#5170f4] via-[#637ff5] to-[#8ea5fe] flex items-center justify-center text-white shadow-lg shadow-[#637ff5]/25 group-hover:scale-105 transition-transform duration-300">
            <HeartPulse className="size-6 stroke-[2.4]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
              Care<span className="text-[#637ff5]">Plus</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase -mt-1 hidden sm:inline">
              Smart Healthcare
            </span>
          </div>
        </Link>

        {/* ─────────────────────────────────────────────────────────────
            Desktop Chronologically Ordered Nav Links with Dynamic Indicator
            Order: Specialties -> Find Doctors -> How It Works -> Hospitals -> Health Articles
            ───────────────────────────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-2xs backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id

            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className={`relative px-4.5 py-2 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#637ff5] text-white font-black shadow-md shadow-[#637ff5]/30 scale-[1.03]'
                    : 'text-slate-600 hover:text-[#637ff5] hover:bg-white/90'
                }`}
              >
                {isActive && (
                  <span className="size-1.5 rounded-full bg-white animate-pulse shrink-0" />
                )}
                <span>{link.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right CTA Cluster */}
        <div className="hidden sm:flex items-center gap-3.5 shrink-0">
          {/* Emergency SOS Hotline Pill */}
          <button
            type="button"
            onClick={onOpenEmergencyModal}
            className="hidden xl:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer group shadow-2xs"
            title="Emergency Medical Hotline"
          >
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2.5 bg-rose-600" />
            </span>
            <PhoneCall className="size-4 group-hover:rotate-12 transition-transform" />
            <span>24/7 SOS: 1800-200-CARE</span>
          </button>

          {/* Conditional Auth Button */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate(getDashboardPath())}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-extrabold shadow-md shadow-slate-900/15 transition-all cursor-pointer active:scale-95"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5170f4] via-[#637ff5] to-[#7a94fd] hover:from-[#4361ee] hover:to-[#637ff5] text-white text-sm font-extrabold shadow-lg shadow-[#637ff5]/25 transition-all cursor-pointer active:scale-95"
            >
              <span>Sign In</span>
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Mobile Drawer Menu (Chronologically Ordered with Active Feedback)
          ───────────────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-white border-b border-slate-200 shadow-2xl p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id
              const Icon = link.icon

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-[#637ff5] text-white font-black shadow-md shadow-[#637ff5]/25'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`size-4.5 ${isActive ? 'text-white' : 'text-[#637ff5]'}`} />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight
                    className={`size-4 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                </button>
              )
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false)
                onOpenEmergencyModal()
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-black text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <PhoneCall className="size-4 text-rose-600" />
              <span>24/7 Emergency Hotline (1800-200-CARE)</span>
            </button>

            {isAuthenticated ? (
              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  navigate(getDashboardPath())
                }}
                className="w-full h-11 rounded-xl bg-slate-900 text-white font-black text-sm"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  navigate('/login')
                }}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#5170f4] via-[#637ff5] to-[#7a94fd] hover:from-[#4361ee] hover:to-[#637ff5] text-white font-black text-sm shadow-md shadow-[#637ff5]/25"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="size-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
