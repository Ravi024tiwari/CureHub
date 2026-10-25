import React, { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { FormValidationErrors, HospitalOption } from '@/types/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { HospitalSelect } from '@/components/auth/HospitalSelect'
import { registerDoctorApi, fetchHospitalsApi } from '@/services/authService'

interface DoctorRegisterFormProps {
  onSuccess: (name: string) => void
  onSignInClick?: () => void
}

export const DoctorRegisterForm: React.FC<DoctorRegisterFormProps> = ({
  onSuccess,
  onSignInClick,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isHospitalsLoading, setIsHospitalsLoading] = useState(true)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [hospitals, setHospitals] = useState<HospitalOption[]>([])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    medicalCouncilRegistrationNumber: '',
    department: 'General Medicine',
    hospitalId: '',
  })

  const [errors, setErrors] = useState<FormValidationErrors>({})

  const defaultDepartments = [
    'General Medicine',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'Oncology',
    'Emergency Medicine',
    'Gynecology & Obstetrics',
    'Psychiatry',
  ]

  // Selected hospital object to check departments
  const selectedHospital = hospitals.find((h) => h._id === formData.hospitalId)
  const availableDepartments =
    selectedHospital?.departments && selectedHospital.departments.length > 0
      ? selectedHospital.departments
      : defaultDepartments

  useEffect(() => {
    setIsHospitalsLoading(true)
    fetchHospitalsApi()
      .then((data) => {
        if (data && data.length > 0) {
          setHospitals(data)
        }
      })
      .finally(() => {
        setIsHospitalsLoading(false)
      })
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (generalError) setGeneralError(null)
  }

  const handleHospitalSelect = (hospitalId: string) => {
    setFormData((prev) => ({ ...prev, hospitalId }))
    if (errors.hospitalId) {
      setErrors((prev) => ({ ...prev, hospitalId: undefined }))
    }
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

    if (!formData.medicalCouncilRegistrationNumber.trim()) {
      newErrors.medicalCouncilRegistrationNumber =
        'Medical council registration number is required'
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required'
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
      await registerDoctorApi({
        name: fullName,
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
        medicalCouncilRegistrationNumber:
          formData.medicalCouncilRegistrationNumber.trim(),
        department: formData.department.trim(),
        hospitalId: formData.hospitalId.trim(),
      })
      onSuccess(fullName)
    } catch (err: any) {
      setGeneralError(
        err.message ||
          'Doctor registration failed. Please ensure Medical Council Reg. No. and email are unique.'
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
        Doctor Profile & Credentials
      </div>

      {/* Name Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" required>First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="e.g. Sarah"
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
            placeholder="e.g. Jenkins"
            value={formData.lastName}
            onChange={handleChange}
            startIcon={<User className="size-4" />}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && <p className="text-[11px] text-red-500 font-medium">{errors.lastName}</p>}
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="email" required>Work Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="doctor@hospital.org"
            value={formData.email}
            onChange={handleChange}
            startIcon={<Mail className="size-4" />}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-[11px] text-red-500 font-medium">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber" required>Mobile Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="Enter 10 digit number"
            value={formData.phoneNumber}
            onChange={handleChange}
            startIcon={<Phone className="size-4" />}
            className={errors.phoneNumber ? 'border-red-500' : ''}
          />
          {errors.phoneNumber && <p className="text-[11px] text-red-500 font-medium">{errors.phoneNumber}</p>}
        </div>
      </div>

      {/* Affiliated Hospital Selection (Optional) */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <Label htmlFor="hospitalId">Affiliated Hospital <span className="text-xs font-normal text-slate-400">(Optional)</span></Label>
          <span className="text-[11px] text-slate-400">Can affiliate later</span>
        </div>
        <HospitalSelect
          hospitals={hospitals}
          selectedHospitalId={formData.hospitalId}
          onSelect={handleHospitalSelect}
          error={errors.hospitalId}
          isLoading={isHospitalsLoading}
        />
      </div>

      {/* Medical Registration & Department */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="medicalCouncilRegistrationNumber" required>
            Medical Council Reg. No.
          </Label>
          <Input
            id="medicalCouncilRegistrationNumber"
            name="medicalCouncilRegistrationNumber"
            placeholder="e.g. MCI-2026-9812"
            value={formData.medicalCouncilRegistrationNumber}
            onChange={handleChange}
            startIcon={<ShieldCheck className="size-4" />}
            className={errors.medicalCouncilRegistrationNumber ? 'border-red-500' : ''}
          />
          {errors.medicalCouncilRegistrationNumber && (
            <p className="text-[11px] text-red-500 font-medium">{errors.medicalCouncilRegistrationNumber}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="department" required>Specialty / Department</Label>
          <div className="relative">
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 cursor-pointer"
            >
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
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

      <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5">
        <Stethoscope className="size-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Doctor accounts undergo verification by the Medical Super Admin and affiliated hospital before activation.
        </p>
      </div>

      <Button
        type="submit"
        variant="brand"
        size="lg"
        disabled={isLoading || isHospitalsLoading}
        className="w-full text-base font-semibold shadow-lg shadow-blue-600/25 h-12"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            <span>Verifying & Registering...</span>
          </>
        ) : (
          <>
            <span>Register as Doctor</span>
            <ArrowRight className="size-4 ml-1" />
          </>
        )}
      </Button>

      <div className="pt-2 text-center text-sm text-slate-500">
        Already have a doctor account?{' '}
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
