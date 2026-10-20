import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { DoctorRegisterForm } from '@/components/auth/forms/DoctorRegisterForm'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const DoctorRegisterPage: FC = () => {
  const navigate = useNavigate()
  const [registeredUser, setRegisteredUser] = useState<string | null>(null)

  if (registeredUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff] p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-5 animate-in fade-in duration-300">
          <div className="size-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="size-9" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">
              Welcome, {registeredUser}!
            </h3>
            <p className="text-sm text-slate-600">
              Your doctor onboarding application has been submitted. Your medical license will be verified by the Super Admin shortly.
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
      currentRole="doctor"
      title="Register as Doctor"
      subtitle="Join CarePlus verified medical network and consult patients"
    >
      {() => (
        <DoctorRegisterForm
          onSuccess={(name) => setRegisteredUser(name)}
          onSignInClick={() => navigate('/login')}
        />
      )}
    </AuthLayout>
  )
}
export default DoctorRegisterPage
