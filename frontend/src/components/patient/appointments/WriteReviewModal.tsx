import { useState, useEffect, type FC } from 'react'
import {
  X,
  Star,
  AlertCircle,
  Calendar,
  Clock,
  Trash2,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import type { AppointmentCardData } from '@/types/patient'
import {
  submitAppointmentReviewApi,
  updateAppointmentReviewApi,
  deleteAppointmentReviewApi,
} from '@/services/patientService'

interface WriteReviewModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentCardData
  onReviewSubmitted: (updatedAppointment: AppointmentCardData) => void
}

const CLINICAL_TAGS = [
  'Polite Doctor',
  'Accurate Diagnosis',
  'Detailed Explanation',
  'Short Waiting Time',
  'Clean Facility',
  'Helpful Staff',
  'Effective Treatment',
  'Good Listener',
]

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Poor Consultation Experience',
  2: 'Below Average Experience',
  3: 'Average Consultation',
  4: 'Very Good Experience',
  5: 'Excellent Doctor & Care',
}

export const WriteReviewModal: FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onReviewSubmitted,
}) => {
  const existingReview = appointment.review

  const [rating, setRating] = useState<number>(existingReview?.rating || 5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState<string>(existingReview?.comment || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingReview?.tags || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Sync state if appointment prop changes
  useEffect(() => {
    if (appointment.review) {
      setRating(appointment.review.rating)
      setComment(appointment.review.comment || '')
      setSelectedTags(appointment.review.tags || [])
    } else {
      setRating(5)
      setComment('')
      setSelectedTags([])
    }
    setErrorMessage(null)
  }, [appointment])

  if (!isOpen) return null

  const activeRating = hoverRating || rating

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (rating < 1 || rating > 5) {
      setErrorMessage('Please select a star rating between 1 and 5.')
      return
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMessage('Please share feedback of at least 5 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      if (existingReview?._id) {
        // Edit existing review
        const updated = await updateAppointmentReviewApi(existingReview._id, {
          rating,
          comment: comment.trim(),
          tags: selectedTags,
        })

        const updatedAppt: AppointmentCardData = {
          ...appointment,
          isReviewed: true,
          review: {
            _id: updated?._id || existingReview._id,
            rating,
            comment: comment.trim(),
            tags: selectedTags,
            createdAt: existingReview.createdAt || new Date().toISOString(),
          },
        }

        onReviewSubmitted(updatedAppt)
        onClose()
      } else {
        // Create new review
        const created = await submitAppointmentReviewApi({
          appointmentId: appointment._id,
          rating,
          comment: comment.trim(),
          tags: selectedTags,
        })

        const createdDoc = created?.review || created

        const updatedAppt: AppointmentCardData = {
          ...appointment,
          isReviewed: true,
          review: {
            _id: createdDoc?._id || `rev-${Date.now()}`,
            rating,
            comment: comment.trim(),
            tags: selectedTags,
            createdAt: new Date().toISOString(),
          },
        }

        onReviewSubmitted(updatedAppt)
        onClose()
      }
    } catch (err: any) {
      console.error('Failed to submit review:', err)
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to submit review. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingReview?._id) return

    if (!window.confirm('Are you sure you want to delete this verified review?')) {
      return
    }

    setIsDeleting(true)
    setErrorMessage(null)

    try {
      await deleteAppointmentReviewApi(existingReview._id)

      const updatedAppt: AppointmentCardData = {
        ...appointment,
        isReviewed: false,
        review: undefined,
      }

      onReviewSubmitted(updatedAppt)
      onClose()
    } catch (err: any) {
      console.error('Failed to delete review:', err)
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to delete review.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg my-auto overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="size-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {existingReview ? 'Edit Your Review' : 'Rate Your Consultation'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verified feedback for completed consultation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Appointment Context Snippet */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
            {appointment.doctorAvatar ? (
              <img
                src={appointment.doctorAvatar}
                alt={appointment.doctorName}
                className="size-11 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="size-11 rounded-xl bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center shrink-0">
                {appointment.doctorName?.slice(0, 2).toUpperCase() || 'DR'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-black text-slate-900 truncate">
                  {appointment.doctorName}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                  <ShieldCheck className="size-3" />
                  Verified Visit
                </span>
              </div>
              <p className="text-[11px] font-semibold text-blue-600 truncate">
                {appointment.doctorSpecialty} • {appointment.hospitalName}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {appointment.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {appointment.time}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Star Rating */}
          <div className="text-center space-y-2 py-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              How was your experience?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = starValue <= activeRating
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-slate-300 hover:scale-115 active:scale-95 transition-all cursor-pointer focus:outline-none"
                    aria-label={`Rate ${starValue} stars`}
                  >
                    <Star
                      className={`size-8 sm:size-9 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 fill-slate-100 hover:text-amber-200'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
            <p className="text-xs font-extrabold text-amber-600">
              {RATING_DESCRIPTIONS[activeRating] || 'Select your rating'}
            </p>
          </div>

          {/* Clinical Feedback Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              What went well? <span className="text-slate-400 font-normal">(Tap to select)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CLINICAL_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Detailed Feedback Textarea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Detailed Feedback <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-slate-400">
                {comment.length} / 1000
              </span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience with ${appointment.doctorName}. How was the consultation, diagnosis, and treatment plan?`}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions Footer */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {existingReview ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
