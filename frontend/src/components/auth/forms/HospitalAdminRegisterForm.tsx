import React, { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  FileText,
  Briefcase,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react'
import type { FormValidationErrors } from '@/types/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { registerHospitalAdminApi } from '@/services/authService'

interface HospitalAdminRegisterFormProps {
  onSuccess: (name: string) => void
  onSignInClick?: () => void
}

export const HospitalAdminRegisterForm: React.FC<HospitalAdminRegisterFormProps> = ({
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
    hospitalName: '',
    designation: '',
    hospitalRegistrationNumber: '',
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

    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = 'Hospital name is required'
    }
    if (!formData.designation.trim()) {
      newErrors.designation = 'Your designation is required'
    }
    if (!formData.hospitalRegistrationNumber.trim()) {
      newErrors.hospitalRegistrationNumber =
        'Hospital registration number is required'
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
      await registerHospitalAdminApi({
        name: fullName,
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
        hospitalName: formData.hospitalName.trim(),
        designation: formData.designation.trim(),
        hospitalRegistrationNumber:
          formData.hospitalRegistrationNumber.trim(),
      })
      onSuccess(fullName)
    } catch (err: any) {
      setGeneralError(
        err.message ||
          'Hospital Admin registration failed. Please ensure the registration number is unique.'
      )
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
        Admin Representative Information
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="email" required>Official Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@hospital.org"
            value={formData.email}
            onChange={handleChange}
            startIcon={<Mail className="size-4" />}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-[11px] text-red-500 font-medium">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber" required>Contact Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="10 digit mobile"
            value={formData.phoneNumber}
            onChange={handleChange}
            startIcon={<Phone className="size-4" />}
            className={errors.phoneNumber ? 'border-red-500' : ''}
          />
          {errors.phoneNumber && <p className="text-[11px] text-red-500 font-medium">{errors.phoneNumber}</p>}
        </div>
      </div>

      {/* Hospital Information Section */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Hospital Details
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hospitalName" required>Registered Hospital Name</Label>
          <Input
            id="hospitalName"
            name="hospitalName"
            placeholder="e.g. City Life Multispeciality Hospital"
            value={formData.hospitalName}
            onChange={handleChange}
            startIcon={<Building2 className="size-4" />}
            className={errors.hospitalName ? 'border-red-500' : ''}
          />
          {errors.hospitalName && <p className="text-[11px] text-red-500 font-medium">{errors.hospitalName}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="designation" required>Your Designation</Label>
            <Input
              id="designation"
              name="designation"
              placeholder="e.g. Medical Superintendent"
              value={formData.designation}
              onChange={handleChange}
              startIcon={<Briefcase className="size-4" />}
              className={errors.designation ? 'border-red-500' : ''}
            />
            {errors.designation && <p className="text-[11px] text-red-500 font-medium">{errors.designation}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hospitalRegistrationNumber" required>Govt Reg. Number</Label>
            <Input
              id="hospitalRegistrationNumber"
              name="hospitalRegistrationNumber"
              placeholder="e.g. HOSP-REG-2026-789"
              value={formData.hospitalRegistrationNumber}
              onChange={handleChange}
              startIcon={<FileText className="size-4" />}
              className={errors.hospitalRegistrationNumber ? 'border-red-500' : ''}
            />
            {errors.hospitalRegistrationNumber && (
              <p className="text-[11px] text-red-500 font-medium">{errors.hospitalRegistrationNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Password */}
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

      <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
        <ShieldAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          Hospital Admin registrations are reviewed and verified by CarePlus Super Admin prior to opening hospital services.
        </p>
      </div>

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
            <span>Registering Hospital Admin...</span>
          </>
        ) : (
          <>
            <span>Register Hospital Admin</span>
            <ArrowRight className="size-4 ml-1" />
          </>
        )}
      </Button>

      <div className="pt-2 text-center text-sm text-slate-500">
        Already have an administrator account?{' '}
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
