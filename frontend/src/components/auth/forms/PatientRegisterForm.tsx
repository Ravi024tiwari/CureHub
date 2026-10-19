import React, { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { FormValidationErrors } from '@/types/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { registerPatientApi } from '@/services/authService'

interface PatientRegisterFormProps {
  onSuccess: (name: string) => void
  onSignInClick?: () => void
}

export const PatientRegisterForm: React.FC<PatientRegisterFormProps> = ({
  onSuccess,
  onSignInClick,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  })

  const [errors, setErrors] = useState<FormValidationErrors>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (generalError) setGeneralError(null)
  }

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' }
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const validate = (): boolean => {
    const newErrors: FormValidationErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = 'Enter a valid 10-digit mobile number'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)
    if (!validate()) return

    setIsLoading(true)
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`

    try {
      await registerPatientApi({
        name: fullName,
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
      })
      onSuccess(fullName)
    } catch (err: any) {
      setGeneralError(err.message || 'Registration failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
          <span>{generalError}</span>
        </div>
      )}

      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Personal Information
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" required>First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={handleChange}
            startIcon={<User className="size-4" />}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && <p className="text-[11px] text-red-500 font-medium">{errors.firstName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName" required>Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={handleChange}
            startIcon={<User className="size-4" />}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && <p className="text-[11px] text-red-500 font-medium">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" required>Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          startIcon={<Mail className="size-4" />}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && <p className="text-[11px] text-red-500 font-medium">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phoneNumber" required>Phone Number</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          placeholder="Enter 10 digit mobile number"
          value={formData.phoneNumber}
          onChange={handleChange}
          startIcon={<Phone className="size-4" />}
          className={errors.phoneNumber ? 'border-red-500' : ''}
        />
        {errors.phoneNumber && <p className="text-[11px] text-red-500 font-medium">{errors.phoneNumber}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" required>Password</Label>
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          startIcon={<Lock className="size-4" />}
          endIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="size-4 text-slate-500" /> : <Eye className="size-4 text-slate-500" />}
            </button>
          }
          className={errors.password ? 'border-red-500' : ''}
        />

        {formData.password && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Strength:</span>
              <span className="font-semibold text-slate-700">{passwordStrength.label}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} />
              <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
              <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
            </div>
          </div>
        )}
        <p className="text-[11px] text-slate-400">At least 8 characters with letters, numbers and symbols</p>
        {errors.password && <p className="text-[11px] text-red-500 font-medium">{errors.password}</p>}
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed text-center sm:text-left">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-blue-600 hover:underline font-medium">Terms of Service</a> and{' '}
        <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>.
      </p>

      <Button
        type="submit"
        variant="brand"
        size="lg"
        disabled={isLoading}
        className="w-full text-base font-semibold shadow-lg shadow-blue-600/25 h-12"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            <span>Creating Patient Account...</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <ArrowRight className="size-4 ml-1" />
          </>
        )}
      </Button>

      <div className="relative flex items-center justify-center py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative bg-white px-3 text-xs uppercase text-slate-400 font-medium tracking-wider">
          OR
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full border-slate-200 hover:bg-slate-50 text-slate-700 h-11 font-medium"
        onClick={() => alert('Google Authentication integration')}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
        </svg>
        <span>Continue with Google</span>
      </Button>

      <div className="pt-2 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSignInClick}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </form>
  )
}
