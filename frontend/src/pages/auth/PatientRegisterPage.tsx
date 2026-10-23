import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PatientRegisterForm } from '@/components/auth/forms/PatientRegisterForm'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserRole } from '@/types/auth'

export const PatientRegisterPage: FC = () => {
  const navigate = useNavigate()
  const [registeredUser, setRegisteredUser] = useState<string | null>(null)

  if (registeredUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff] p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-5 animate-in fade-in duration-300">
          <div className="size-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="size-9" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">
              Welcome, {registeredUser}!
            </h3>
            <p className="text-sm text-slate-600">
              Your patient account has been successfully created. You can now book appointments and access digital medical records.
            </p>
          </div>
          <Button
            variant="brand"
            size="lg"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AuthLayout
      currentRole={UserRole.PATIENT}
      title="Create Patient Account"
      subtitle="Book appointments and manage your health records"
    >
      {() => (
        <PatientRegisterForm
          onSuccess={(name) => setRegisteredUser(name)}
          onSignInClick={() => navigate('/login')}
        />
      )}
    </AuthLayout>
  )
}
export default PatientRegisterPage
