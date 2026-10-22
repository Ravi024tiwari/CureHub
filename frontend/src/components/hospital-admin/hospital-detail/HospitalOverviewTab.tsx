import { useState, type FC } from 'react'
import {
  Building2,
  Calendar,
  Bed,
  FileText,
  Globe,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Stethoscope,
  Star,
  UserCheck,
  Activity,
} from 'lucide-react'
import type {
  HospitalBranchItem,
  HospitalDoctorItem,
  HospitalActivityItem,
} from '@/types/hospitalAdmin'

// Avatar images matching mockup
import drAmitImg from '@/assets/dr-amit-singh.jpg'
import drNehaImg from '@/assets/dr-sneha-patel.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import drPriyaImg from '@/assets/dr-priya-sharma.jpg'

interface HospitalOverviewTabProps {
  hospital: HospitalBranchItem
  topDoctors: HospitalDoctorItem[]
  recentActivities: HospitalActivityItem[]
  onOpenDoctorsTab: () => void
  onOpenDepartmentsTab: () => void
  onSelectDoctorProfile?: (doc: HospitalDoctorItem) => void
}

export const HospitalOverviewTab: FC<HospitalOverviewTabProps> = ({
  hospital,
  topDoctors,
  recentActivities,
  onOpenDoctorsTab,
  onOpenDepartmentsTab,
  onSelectDoctorProfile,
}) => {
  const [isExpandedAbout, setIsExpandedAbout] = useState(false)

  // Default doctors if none yet in DB (matching mockup exact names & specialties)
  const fallbackDoctors: HospitalDoctorItem[] = [
    {
      _id: 'doc-1',
      userId: {
        _id: 'u-1',
        name: 'Dr. Amit Singh',
        email: 'amit.singh@apollo.com',
        avatar: drAmitImg,
      },
      department: 'Cardiology',
      specialization: ['Cardiologist', 'Interventional Cardiology'],
      experienceYears: 12,
      consultationFee: 800,
      ratingAverage: 4.8,
    },
    {
      _id: 'doc-2',
      userId: {
        _id: 'u-2',
        name: 'Dr. Neha Gupta',
        email: 'neha.gupta@apollo.com',
        avatar: drNehaImg,
      },
      department: 'Dermatology',
      specialization: ['Dermatologist', 'Cosmetology'],
      experienceYears: 8,
      consultationFee: 650,
      ratingAverage: 4.6,
    },
    {
      _id: 'doc-3',
      userId: {
        _id: 'u-3',
        name: 'Dr. Vikram Jain',
        email: 'vikram.jain@apollo.com',
        avatar: drRajeshImg,
      },
      department: 'Orthopedics',
      specialization: ['Orthopedic Surgeon', 'Joint Replacement'],
      experienceYears: 15,
      consultationFee: 900,
      ratingAverage: 4.7,
    },
    {
      _id: 'doc-4',
      userId: {
        _id: 'u-4',
        name: 'Dr. Sneha Patel',
        email: 'sneha.patel@apollo.com',
        avatar: drPriyaImg,
      },
      department: 'Pediatrics',
      specialization: ['Pediatrician', 'Child Health'],
      experienceYears: 10,
      consultationFee: 700,
      ratingAverage: 4.5,
    },
    {
      _id: 'doc-5',
      userId: {
        _id: 'u-5',
        name: 'Dr. Arjun Mehta',
        email: 'arjun.mehta@apollo.com',
        avatar: drAmitImg,
      },
      department: 'Neurology',
      specialization: ['Neurologist', 'Neuro Critical Care'],
      experienceYears: 14,
      consultationFee: 1000,
      ratingAverage: 4.8,
    },
  ]

  const displayDoctors = topDoctors.length > 0 ? topDoctors : fallbackDoctors

  const defaultDepartments = [
    'General Medicine',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Gynecology',
    'Urology',
    'Dermatology',
    'Ophthalmology',
    'ENT',
    'Gastroenterology',
  ]
  const departmentsList = hospital.departments?.length ? hospital.departments : defaultDepartments
  const previewDepartments = departmentsList.slice(0, 8)
  const extraDeptCount = Math.max(0, departmentsList.length - 8)

  const defaultDescription =
    hospital.description ||
    'Apollo Multispeciality Hospital is a leading healthcare institution providing world-class medical care with advanced technology, experienced doctors, and patient-centric services. We are committed to delivering high-quality healthcare across multiple specialties.'

  return (
    <div className="space-y-6">
      {/* 1. About Hospital Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-3">
        <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="size-5 text-blue-600" />
          <span>About Hospital</span>
        </h3>
        <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${isExpandedAbout ? '' : 'line-clamp-3'}`}>
          {defaultDescription}
        </p>
        {defaultDescription.length > 200 && (
          <button
            type="button"
            onClick={() => setIsExpandedAbout(!isExpandedAbout)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            {isExpandedAbout ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>

      {/* 2. Departments Card (Chips) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="size-5 text-indigo-600" />
            <span>Departments</span>
          </h3>
          <button
            type="button"
            onClick={onOpenDepartmentsTab}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {previewDepartments.map((dept, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 text-xs font-bold transition-all"
            >
              {dept}
            </span>
          ))}
          {extraDeptCount > 0 && (
            <button
              type="button"
              onClick={onOpenDepartmentsTab}
              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-black transition-colors cursor-pointer"
            >
              +{extraDeptCount} more
            </button>
          )}
        </div>
      </div>

      {/* 3. Key Information Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
        <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="size-5 text-teal-600" />
          <span>Key Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs sm:text-sm">
          {/* Hospital Type */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-semibold flex items-center gap-2">
              <Building2 className="size-4 text-slate-400" /> Hospital Type
            </span>
            <span className="font-bold text-slate-900">{hospital.hospitalType || 'Multi-Speciality'}</span>
          </div>

          {/* Establishment Year */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-semibold flex items-center gap-2">
              <Calendar className="size-4 text-slate-400" /> Establishment Year
            </span>
            <span className="font-bold text-slate-900">{hospital.establishmentYear || 2010}</span>
          </div>

          {/* Total Beds */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-semibold flex items-center gap-2">
              <Bed className="size-4 text-slate-400" /> Total Beds
            </span>
            <span className="font-bold text-slate-900">{hospital.totalBeds || 200}</span>
          </div>

          {/* License Number */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-semibold flex items-center gap-2">
              <ShieldCheck className="size-4 text-slate-400" /> License Number
            </span>
            <span className="font-bold text-slate-900 font-mono text-xs">
              {hospital.licenseNumber || 'MH/123456/2010'}
            </span>
          </div>

          {/* Website */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-semibold flex items-center gap-2">
              <Globe className="size-4 text-slate-400" /> Website
            </span>
            {hospital.website ? (
              <a
                href={hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-600 hover:underline truncate max-w-[180px] sm:max-w-[220px]"
              >
                {hospital.website}
              </a>
            ) : (
              <span className="text-slate-400 font-medium">Not provided</span>
            )}
          </div>

          {/* Verification Status */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-semibold flex items-center gap-2">
              <CheckCircle2 className="size-4 text-slate-400" /> Verification Status
            </span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="size-3.5 fill-emerald-100" />
              {hospital.verificationStatus === 'APPROVED' ? 'Verified' : hospital.verificationStatus}
            </span>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-semibold flex items-center gap-2">
              <Activity className="size-4 text-slate-400" /> Active Status
            </span>
            <span
              className={`font-bold flex items-center gap-1.5 ${
                hospital.isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <span className={`size-2 rounded-full ${hospital.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              {hospital.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* 24x7 Emergency */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-semibold flex items-center gap-2">
              <Clock className="size-4 text-slate-400" /> 24x7 Emergency
            </span>
            <span className="font-bold text-slate-900">
              {hospital.isEmergency24x7 !== false ? 'Yes' : 'No'}
            </span>
          </div>

          {/* Operating Hours */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 sm:col-span-2">
            <span className="text-slate-500 font-semibold flex items-center gap-2">
              <Clock className="size-4 text-slate-400" /> Operating Hours
            </span>
            <span className="font-bold text-slate-900">
              {hospital.openingTime || '09:00 AM'} - {hospital.closingTime || '11:00 PM'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Top Doctors Preview List Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="size-5 text-blue-600" />
            <span>Top Doctors ({displayDoctors.length})</span>
          </h3>
          <button
            type="button"
            onClick={onOpenDoctorsTab}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {displayDoctors.map((doc, idx) => {
            const avatar = doc.userId.avatar || [drAmitImg, drNehaImg, drRajeshImg, drPriyaImg][idx % 4]
            return (
              <div
                key={doc._id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={avatar}
                    alt={doc.userId.name}
                    className="size-11 sm:size-12 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {doc.userId.name}
                    </h4>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
                      {doc.department || doc.specialization?.[0] || 'Specialist'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
                    {doc.experienceYears}+ Years
                  </span>

                  <div className="flex items-center gap-1 text-xs font-black text-slate-800">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{doc.ratingAverage ? doc.ratingAverage.toFixed(1) : '4.8'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectDoctorProfile) onSelectDoctorProfile(doc)
                      else onOpenDoctorsTab()
                    }}
                    className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Recent Activity Timeline Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="size-5 text-indigo-600" />
            <span>Recent Activity</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">Latest</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {recentActivities.map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-start gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-bold text-slate-900 truncate">{act.title}</h5>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">{act.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">{act.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
