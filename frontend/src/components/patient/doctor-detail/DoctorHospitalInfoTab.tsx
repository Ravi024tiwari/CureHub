import { type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Bed,
  ShieldCheck,
  Flame,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DoctorDetailData } from '@/types/patient'
import apolloImg from '@/assets/apollo-hospital.jpg'

interface DoctorHospitalInfoTabProps {
  doctor: DoctorDetailData
}

export const DoctorHospitalInfoTab: FC<DoctorHospitalInfoTabProps> = ({ doctor }) => {
  const navigate = useNavigate()
  const hospital = doctor.hospitalId

  const hospitalName = doctor.hospitalName || hospital?.name || 'Apollo Multispeciality Hospital'
  const coverImage = hospital?.images?.coverImage || apolloImg
  const fullAddress = hospital?.address
    ? `${hospital.address.street || ''}, ${hospital.address.city || ''}, ${hospital.address.state || ''} ${hospital.address.zipCode || ''}, ${hospital.address.country || 'India'}`
    : doctor.hospitalLocation || 'Civil Lines, Bilaspur, Chhattisgarh 495001, India'

  const departments = hospital?.departments?.length
    ? hospital.departments
    : ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Dermatology']

  const facilities = hospital?.facilities?.length
    ? hospital.facilities
    : ['24x7 Emergency', 'Ambulance Service', 'Intensive Care Unit (ICU)', 'In-house Pharmacy', 'Pathology Lab']

  return (
    <div className="space-y-6">
      {/* Hospital Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="relative h-48 sm:h-64 w-full bg-slate-100">
          <img src={coverImage} alt={hospitalName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white">
              <ShieldCheck className="size-3" />
              <span>Affiliated Healthcare Institution</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-sm">{hospitalName}</h2>
            <p className="text-xs text-slate-200">
              {hospital?.hospitalType || 'Multi-Speciality Hospital'} • {hospital?.totalBeds || 200} Beds • Rating: {hospital?.rating || 4.8} ★
            </p>
          </div>
        </div>

        {/* Core Attributes */}
        <div className="p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-slate-400 font-medium">Hospital Type</span>
              <p className="text-sm font-bold text-slate-800">{hospital?.hospitalType || 'Multi-Speciality'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-slate-400 font-medium">Bed Capacity</span>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Bed className="size-4 text-blue-600" />
                <span>{hospital?.totalBeds || 200} Beds</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-slate-400 font-medium">Emergency Care</span>
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                <Flame className="size-4 text-emerald-500" />
                <span>24x7 Available</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-slate-400 font-medium">Distance</span>
              <p className="text-sm font-bold text-slate-800">{hospital?.distance || '2.5 km away'}</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 pt-4 border-t border-slate-100 text-xs sm:text-sm">
            <h4 className="font-bold text-slate-900">Hospital Contact & Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="size-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{fullAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 text-slate-400 shrink-0" />
                <span>{hospital?.contactPhone || '+91 7752 494000'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-slate-400 shrink-0" />
                <span>{hospital?.contactEmail || 'contact@apollo.careplus.com'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="size-4 text-slate-400 shrink-0" />
                <span>{hospital?.website || 'www.apollohospitals.com'}</span>
              </div>
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Medical Departments</h4>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Available Facilities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              {facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-slate-700">
                  <ShieldCheck className="size-3.5 text-blue-600 shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-4 border-t border-slate-100">
            <Button
              onClick={() => {
                if (hospital?._id) {
                  navigate(`/patient/hospitals?search=${encodeURIComponent(hospitalName)}`)
                } else {
                  navigate('/patient/hospitals')
                }
              }}
              className="h-11 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Hospital Facilities & Specialists</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
