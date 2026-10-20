import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoginHeaderProps {
  onSignUpClick?: () => void
}

export const LoginHeader: FC<LoginHeaderProps> = ({ onSignUpClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignUp = () => {
    if (onSignUpClick) {
      onSignUpClick()
    } else {
      navigate('/register/patient')
    }
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Find Doctors', href: '#doctors' },
    { label: 'Hospitals', href: '#hospitals' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="size-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105">
            <Activity className="size-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-0.5">
              Care<span className="text-blue-600">Plus</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide -mt-1 hidden sm:block">
              Healthcare Platform
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links (Visible on lg+ screens to avoid tablet crowding) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Section: Sign Up CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm text-slate-500 font-medium hidden xl:inline">
            Don't have an account?
          </span>
          <Button
            type="button"
            onClick={handleSignUp}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl shadow-md shadow-blue-600/20 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
          >
            Sign Up
          </Button>

          {/* Mobile & Tablet Hamburger Button (Visible on screens < lg) */}
          <div className="flex lg:hidden items-center ml-1">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">Don't have an account?</span>
            <Button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                handleSignUp()
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-sm"
            >
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
export default LoginHeader
