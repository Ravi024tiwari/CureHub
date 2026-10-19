import { useState, type FC } from 'react'
import { Activity, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RegisterHeaderProps {
  onSignInClick?: () => void
}

export const RegisterHeader: FC<RegisterHeaderProps> = ({ onSignInClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Find Doctors', href: '#' },
    { label: 'Hospitals', href: '#' },
    { label: 'Services', href: '#' },
    { label: 'About', href: '#' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="size-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
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

        {/* Right Section: Sign In Link / CTA */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm text-slate-500">Already have an account?</span>
          <button
            type="button"
            onClick={onSignInClick}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-700 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">Already have an account?</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMobileMenuOpen(false)
                onSignInClick?.()
              }}
              className="text-blue-600 font-semibold"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
