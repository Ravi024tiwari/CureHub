import { useState, type FC, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  User,
  Stethoscope,
  Building2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/auth'
import type { AuthUser, RoleType } from '@/types/auth'

interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void
}

export const LoginForm: FC<LoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate()
  const { login, isLoading, error: storeError, clearError } = useAuthStore()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null)
  const [activeRoleTab, setActiveRoleTab] = useState<RoleType | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
  }>({})

  // Forgot Password modal state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitted, setForgotSubmitted] = useState(false)

  // Real-time email validation flag
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  // Quick Role Presets for convenient interactive testing
  const handleSelectRole = (role: RoleType) => {
    setActiveRoleTab(role)
    setLocalErrorMessage(null)
    clearError()
    setValidationErrors({})

    if (role === UserRole.PATIENT) {
      setEmail('patient@careplus.com')
      setPassword('Patient@123')
    } else if (role === UserRole.DOCTOR) {
      setEmail('doctor@careplus.com')
      setPassword('Doctor@123')
    } else if (role === UserRole.HOSPITAL_ADMIN) {
      setEmail('admin@hospital.com')
      setPassword('Hospital@123')
    }
  }

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {}

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      errors.email = 'Please enter your email address'
    } else if (!isEmailValid) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Please enter your password'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Form Submission using central Zustand store
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalErrorMessage(null)
    clearError()

    if (!validateForm()) return

    try {
      // Calls server API and sets details in Zustand central store
      const user = await login({
        email: email.trim().toLowerCase(),
        password,
      })

      if (onSuccess && user) {
        onSuccess(user)
      } else {
        if (user?.role === UserRole.HOSPITAL_ADMIN) {
          navigate('/hospital-admin/dashboard')
        } else if (user?.role === UserRole.PATIENT) {
          navigate('/patient/home')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err: any) {
      const msg =
        err?.message ||
        'Unable to log in. Please check your credentials and try again.'
      setLocalErrorMessage(msg)
    }
  }

  const errorMessage = localErrorMessage || storeError

  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setForgotSubmitted(true)
    setTimeout(() => {
      setForgotSubmitted(false)
      setForgotPasswordOpen(false)
      setForgotEmail('')
    }, 2800)
  }

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Welcome Back <span className="animate-pulse">👋</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Sign in to your CarePlus account to continue your healthcare journey.
        </p>
      </div>

      {/* Interactive Role Quick-Select Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Sign In As
          </span>
          {activeRoleTab && (
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab(null)
                setEmail('')
                setPassword('')
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => handleSelectRole(UserRole.PATIENT)}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeRoleTab === UserRole.PATIENT
                ? 'bg-white text-blue-600 shadow-sm border border-blue-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <User className="size-3.5" />
            <span>Patient</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole(UserRole.DOCTOR)}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeRoleTab === UserRole.DOCTOR
                ? 'bg-white text-blue-600 shadow-sm border border-blue-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Stethoscope className="size-3.5" />
            <span>Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole(UserRole.HOSPITAL_ADMIN)}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeRoleTab === UserRole.HOSPITAL_ADMIN
                ? 'bg-white text-blue-600 shadow-sm border border-blue-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Building2 className="size-3.5" />
            <span className="truncate">Hospital</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200 shadow-xs">
          <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-800">Authentication Failed</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLocalErrorMessage(null)
              clearError()
            }}
            className="text-rose-400 hover:text-rose-600 p-0.5 cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Email Address
            </Label>
            {isEmailValid && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 animate-in fade-in">
                <CheckCircle2 className="size-3" />
                <span>Valid</span>
              </span>
            )}
          </div>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={isLoading}
            onChange={(e) => {
              setEmail(e.target.value)
              if (validationErrors.email) {
                setValidationErrors((prev) => ({ ...prev, email: undefined }))
              }
            }}
            placeholder="Enter your email address"
            startIcon={<Mail className="size-4.5" />}
            className={
              validationErrors.email
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                : isEmailValid
                ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100'
                : ''
            }
          />
          {validationErrors.email && (
            <p className="text-xs text-rose-600 font-medium mt-1">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Password
            </Label>
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            disabled={isLoading}
            onChange={(e) => {
              setPassword(e.target.value)
              if (validationErrors.password) {
                setValidationErrors((prev) => ({
                  ...prev,
                  password: undefined,
                }))
              }
            }}
            placeholder="Enter your password"
            startIcon={<Lock className="size-4.5" />}
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="size-4.5" />
                ) : (
                  <Eye className="size-4.5" />
                )}
              </button>
            }
            className={
              validationErrors.password
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                : ''
            }
          />
          {validationErrors.password && (
            <p className="text-xs text-rose-600 font-medium mt-1">
              {validationErrors.password}
            </p>
          )}

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer accent-blue-600"
              />
              <span className="text-xs text-slate-600 font-medium">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotEmail(email)
                setForgotPasswordOpen(true)
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="group w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/35 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="size-4.5 transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      {/* Secure & Encrypted Box */}
      <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 transition-colors">
        <div className="size-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="size-4.5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-900">Secure & Encrypted</p>
          <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
            Your data is protected with industry-standard encryption and security
            measures.
          </p>
        </div>
      </div>

      {/* Don't have an account link */}
      <div className="text-center pt-1">
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register/patient')}
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="size-5" />
              </div>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Reset your password
              </h3>
              <p className="text-xs text-slate-500">
                Enter your registered email address and we'll send you
                instructions to reset your password.
              </p>
            </div>

            {forgotSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <p>
                  Reset link sent to <strong>{forgotEmail}</strong>. Please
                  check your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="forgot-email" className="text-xs font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    startIcon={<Mail className="size-4" />}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export default LoginForm
