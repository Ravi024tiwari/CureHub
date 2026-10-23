import type { FC, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { RegisterHeader } from './RegisterHeader'
import { RegisterHero } from './RegisterHero'
import { RoleSelector } from './RoleSelector'
import { UserRole } from '@/types/auth'
import type { RoleType } from '@/types/auth'
import { Card, CardContent } from '@/components/ui/card'

interface AuthLayoutProps {
  currentRole: RoleType
  title: string
  subtitle: string
  children: (onSuccess: (name: string) => void) => ReactNode
}

export const AuthLayout: FC<AuthLayoutProps> = ({
  currentRole,
  title,
  subtitle,
  children,
}) => {
  const navigate = useNavigate()

  const handleRoleChange = (newRole: RoleType) => {
    if (newRole === UserRole.PATIENT) navigate('/register/patient')
    else if (newRole === UserRole.DOCTOR) navigate('/register/doctor')
    else if (newRole === UserRole.HOSPITAL_ADMIN) navigate('/register/hospital-admin')
  }

  const handleSignInClick = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fbff] text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Top Navbar */}
      <RegisterHeader onSignInClick={handleSignInClick} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full">
          {/* Left Column: Hero Section */}
          <div className="lg:col-span-7 w-full pt-1">
            <RegisterHero />
          </div>

          {/* Right Column: Registration Card Container */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <Card className="w-full max-w-xl mx-auto rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-blue-900/5 overflow-hidden transition-all">
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Header Title */}
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {title}
                  </h2>
                  <p className="text-sm text-slate-500">{subtitle}</p>
                </div>

                {/* 3-Role Toggle Tabs (Navigates to dedicated routes) */}
                <div className="space-y-1.5">
                  <RoleSelector
                    selectedRole={currentRole}
                    onSelectRole={handleRoleChange}
                  />
                </div>

                {/* Role Specific Sub-form */}
                {children((name: string) => {
                  alert(`Registration successful for ${name}! Please sign in.`)
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white/50 backdrop-blur-xs">
        <p>© 2026 CarePlus Healthcare. All rights reserved.</p>
      </footer>
    </div>
  )
}
