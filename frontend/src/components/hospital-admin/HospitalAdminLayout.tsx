import { useEffect, type FC, type ReactNode } from 'react'
import { HospitalAdminSidebar } from './HospitalAdminSidebar'
import { HospitalAdminHeader } from './HospitalAdminHeader'
import { HospitalAdminMobileNav } from './HospitalAdminMobileNav'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

export interface HospitalAdminLayoutProps {
  children: ReactNode
  hideMobileNav?: boolean
}

export const HospitalAdminLayout: FC<HospitalAdminLayoutProps> = ({
  children,
  hideMobileNav = false,
}) => {
  const {
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleSidebar,
  } = useHospitalAdminStore()

  // Register Ctrl+B / Cmd+B keyboard shortcut to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement | null
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      if (!isInput && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Sidebar (Fixed Viewport, Never Scrolls with Page) */}
      <HospitalAdminSidebar />

      {/* 2. Mobile Drawer Navigation (< 1024px) */}
      {isMobileSidebarOpen && (
        <HospitalAdminSidebar
          isMobileDrawer={true}
          onCloseDrawer={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 3. Main Body Scroll Container (Smooth Independent Scrolling) */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col min-w-0 transition-all duration-300">
        {/* Sticky Top Header */}
        <HospitalAdminHeader onToggleSidebar={toggleSidebar} />

        {/* Dynamic Page Content */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-10">
          {children}
        </div>
      </div>

      {/* 4. Bottom Navigation for Mobile Devices */}
      {!hideMobileNav && <HospitalAdminMobileNav onToggleSidebar={toggleSidebar} />}
    </div>
  )
}

export default HospitalAdminLayout

