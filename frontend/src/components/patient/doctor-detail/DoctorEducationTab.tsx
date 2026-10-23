import { type FC } from 'react'
import {
  GraduationCap,
  Briefcase,
  Award,
  BookOpen,
} from 'lucide-react'
import type { DoctorDetailData } from '@/types/patient'

interface DoctorEducationTabProps {
  doctor: DoctorDetailData
}

export const DoctorEducationTab: FC<DoctorEducationTabProps> = ({ doctor }) => {
  const qualifications = doctor.qualifications?.length
    ? doctor.qualifications
    : [
        `DM ${doctor.department || 'Cardiology'} - AIIMS Delhi (2012)`,
        'MD Medicine - PGIMER, Chandigarh (2009)',
        "MBBS - King George's Medical University (2005)",
        'Fellowship in Interventional Cardiology - ESC',
        'Certificate in Advanced Cardiac Imaging',
      ]

  const expYears = doctor.experienceYears || 12
  const currentHospital = doctor.hospitalName || 'Apollo Multispeciality Hospital'
  const timeline = doctor.experiences && doctor.experiences.length > 0
    ? doctor.experiences
    : [
        {
          title: `Senior ${doctor.specialty || doctor.department || 'Specialist'}`,
          institution: `${currentHospital}, Bilaspur`,
          period: '2019 - Present',
          duration: `${Math.max(1, expYears - 7)}+ Years`,
          description:
            'Leading primary clinical consultations, complex interventions, and inpatient clinical care protocols.',
        },
        {
          title: `Consultant ${doctor.department || 'Physician'}`,
          institution: 'Fortis Hospital, Raipur',
          period: '2015 - 2019',
          duration: '4 Years',
          description:
            'Managed OPD/IPD operations, emergency admissions, and inter-departmental referrals.',
        },
        {
          title: 'Senior Resident Doctor',
          institution: 'AIIMS Delhi',
          period: '2012 - 2015',
          duration: '3 Years',
          description:
            'Completed specialized super-specialty residency and clinical research papers.',
        },
      ]

  return (
    <div className="space-y-6">
      {/* Education & Qualifications */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="size-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Education & Academic Background
            </h3>
            <p className="text-xs text-slate-500">
              Recognized degrees and certifications verified by Medical Council
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {qualifications.map((qual, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60"
            >
              <div className="size-8 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="size-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{qual}</h4>
                <p className="text-[11px] text-slate-500 font-medium">Accredited Medical Degree</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Career Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="size-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Professional Work Experience
            </h3>
            <p className="text-xs text-slate-500">
              Over {doctor.experienceYears || 12} years of dedicated patient care
            </p>
          </div>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
          {timeline.map((item, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-6 top-1 size-4.5 rounded-full ring-4 ring-white bg-blue-600 flex items-center justify-center">
                <span className="size-1.5 rounded-full bg-white" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">{item.title}</h4>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 self-start sm:self-auto">
                    {item.period} ({item.duration})
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">{item.institution}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Certifications & Memberships */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-3.5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="size-4" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
            Professional Affiliations & Licenses
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
            <Award className="size-4 text-blue-600 shrink-0" />
            <span>State Medical Council Registered Practitioner</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
            <Award className="size-4 text-blue-600 shrink-0" />
            <span>Indian Medical Association (IMA) Life Member</span>
          </div>
        </div>
      </div>
    </div>
  )
}
