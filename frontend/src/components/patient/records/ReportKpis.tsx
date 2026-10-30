import { type FC } from 'react'
import { FileText, HeartPulse, Scan, FileCheck } from 'lucide-react'
import type { MedicalRecordItem } from '@/types/patient'

interface ReportKpisProps {
  records: MedicalRecordItem[]
}

export const ReportKpis: FC<ReportKpisProps> = ({ records }) => {
  const total = records.length

  const labCount = records.filter(
    (r) =>
      r.category.toLowerCase().includes('lab') ||
      r.title.toLowerCase().includes('blood') ||
      r.title.toLowerCase().includes('test') ||
      r.title.toLowerCase().includes('ecg') ||
      r.title.toLowerCase().includes('lipid') ||
      r.title.toLowerCase().includes('thyroid') ||
      r.title.toLowerCase().includes('sugar')
  ).length

  const imagingCount = records.filter(
    (r) =>
      r.category.toLowerCase().includes('imaging') ||
      r.title.toLowerCase().includes('x-ray') ||
      r.title.toLowerCase().includes('mri') ||
      r.title.toLowerCase().includes('scan') ||
      r.title.toLowerCase().includes('ultrasound')
  ).length

  const otherCount = Math.max(0, total - (labCount + imagingCount))

  const labPercent = total > 0 ? ((labCount / total) * 100).toFixed(1) : '0.0'
  const imagingPercent = total > 0 ? ((imagingCount / total) * 100).toFixed(1) : '0.0'
  const otherPercent = total > 0 ? ((otherCount / total) * 100).toFixed(1) : '0.0'

  const kpis = [
    {
      id: 'total',
      label: 'Total Reports',
      value: total,
      subBadge: '↑ 4 this month',
      subBadgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 'lab',
      label: 'Lab Reports',
      value: labCount,
      subBadge: `${labPercent}% of total`,
      subBadgeClass: 'text-rose-700 bg-rose-50 border-rose-100',
      icon: HeartPulse,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      id: 'imaging',
      label: 'Imaging Reports',
      value: imagingCount,
      subBadge: `${imagingPercent}% of total`,
      subBadgeClass: 'text-sky-700 bg-sky-50 border-sky-100',
      icon: Scan,
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      id: 'other',
      label: 'Other Reports',
      value: otherCount,
      subBadge: `${otherPercent}% of total`,
      subBadgeClass: 'text-purple-700 bg-purple-50 border-purple-100',
      icon: FileCheck,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <div
            key={kpi.id}
            className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex items-start gap-3 sm:gap-4"
          >
            <div
              className={`size-11 sm:size-12 rounded-2xl border flex items-center justify-center shrink-0 ${kpi.iconBg}`}
            >
              <Icon className="size-5 sm:size-6 stroke-[2]" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                {kpi.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 truncate">
                {kpi.label}
              </div>
              <div className="pt-0.5">
                <span
                  className={`inline-block text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${kpi.subBadgeClass}`}
                >
                  {kpi.subBadge}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

