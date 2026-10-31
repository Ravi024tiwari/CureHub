import { useEffect } from 'react'
import { socketService } from '@/services/socketService'
import { useAuthStore } from '@/store/authStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'
import { useHospitalAdminLeavesStore } from '@/store/hospitalAdminLeavesStore'
import { useDoctorStore } from '@/store/doctorStore'
import { useAppointmentStore } from '@/store/appointmentStore'
import { toast } from '@/store/toastStore'
import { UserRole } from '@/types/auth'

/**
 * Global Real-time WebSocket Subscriber
 * Connects when user is authenticated, subscribes to role-specific events,
 * and reactively mutates Zustand stores with zero page reloads.
 */
export const useSocketSubscriber = () => {
  const { user, token, isAuthenticated, updateUserApproval } = useAuthStore()

  useEffect(() => {
    const effectiveToken = token || localStorage.getItem('careplus_token')

    if (!isAuthenticated || !effectiveToken || !user) {
      socketService.disconnect()
      return
    }

    // 1. Establish Handshake Connection with JWT Access Token
    const socket = socketService.connect(effectiveToken)

    // 2. Event: Doctor Join Request Created (Hospital Admin receives)
    const handleJoinRequestCreated = (data: any) => {
      if (user.role === UserRole.HOSPITAL_ADMIN) {
        useHospitalAdminStore.getState().addPendingRequestLocally(data)
        const doctorName = data?.doctorName || data?.doctorUserId?.name || 'A Doctor'
        toast.info(`${doctorName} has submitted an affiliation request!`, 'New Join Request')
      }
    }

    // 3. Event: Doctor Join Request Status Updated (Doctor receives)
    const handleJoinRequestStatusUpdated = (data: {
      requestId: string
      status: string
      hospitalName?: string
      hospitalId?: string
      rejectionReason?: string
    }) => {
      if (user.role === UserRole.DOCTOR) {
        useDoctorStore.getState().updateAffiliationLocally(data.status, data.hospitalId, data.hospitalName)
        if (data.status === 'APPROVED') {
          toast.success(
            `Your affiliation request with ${data.hospitalName || 'the hospital'} was APPROVED!`,
            'Affiliation Approved'
          )
        } else if (data.status === 'REJECTED') {
          toast.error(
            `Affiliation request declined. Reason: ${data.rejectionReason || 'Declined by administration'}`,
            'Application Declined'
          )
        }
      }
    }

    // 4. Event: Doctor Verification Status Updated by Super Admin (Doctor receives)
    const handleDoctorVerificationUpdated = (data: {
      status: string
      isAccountApproved: boolean
      rejectionReason?: string
    }) => {
      if (user.role === UserRole.DOCTOR) {
        updateUserApproval(data.isAccountApproved)
        if (data.isAccountApproved) {
          toast.success(
            '🎉 Congratulations! Your Doctor credentials have been verified by Super Admin. All clinical features unlocked!',
            'Account Verified'
          )
        } else if (data.status === 'REJECTED') {
          toast.error(
            `Doctor profile verification declined: ${data.rejectionReason || 'Please review your uploaded documents'}`,
            'Verification Declined'
          )
        }
      }
    }

    // 5. Event: Hospital Admin Verification Status Updated by Super Admin (Hospital Admin receives)
    const handleHospitalAdminVerificationUpdated = (data: {
      status: string
      isAccountApproved: boolean
      rejectionReason?: string
    }) => {
      if (user.role === UserRole.HOSPITAL_ADMIN) {
        updateUserApproval(data.isAccountApproved)
        if (data.isAccountApproved) {
          toast.success(
            '🎉 Congratulations! Your Hospital Administrator account has been verified by Super Admin. Portal unlocked!',
            'Hospital Admin Verified'
          )
        } else if (data.status === 'REJECTED') {
          toast.error(
            `Hospital Admin verification declined: ${data.rejectionReason || 'Please check your submitted details'}`,
            'Verification Declined'
          )
        }
      }
    }

    // 6. Events for Super Admin (Incoming verification submissions)
    const handleDoctorSubmitted = (data: any) => {
      if (user.role === UserRole.SUPER_ADMIN) {
        toast.info(
          `Dr. ${data.doctorName || 'Specialist'} submitted verification documents for review.`,
          'Doctor Verification'
        )
      }
    }

    const handleHospitalAdminSubmitted = (data: any) => {
      if (user.role === UserRole.SUPER_ADMIN) {
        toast.info(
          `Hospital Admin (${data.adminName || 'Admin'}) submitted verification application for review.`,
          'Hospital Admin Verification'
        )
      }
    }

    // 7. Event: Doctor Leave Created (Hospital Admin receives)
    const handleDoctorLeaveCreated = (data: any) => {
      if (user.role === UserRole.HOSPITAL_ADMIN) {
        useHospitalAdminLeavesStore.getState().addLeaveLocally(data.leave || data)
        const doctorName = data.doctorName || 'A Doctor'
        const count = data.affectedAppointmentsCount || 0
        toast.info(
          `${doctorName} submitted a leave application (${count} booking${count === 1 ? '' : 's'} affected).`,
          'New Doctor Leave'
        )
      }
    }

    // 8. Event: Doctor Leave Status Updated (Doctor & Hospital Admin receive)
    const handleDoctorLeaveStatusUpdated = (data: {
      leaveId: string
      status: string
      hospitalName?: string
      rejectionReason?: string
      affectedAppointmentsCount?: number
      startDateTime?: string
      endDateTime?: string
    }) => {
      if (user.role === UserRole.DOCTOR) {
        useDoctorStore.getState().updateLeaveStatusLocally(data.leaveId, data.status, data.rejectionReason)
        if (data.status === 'APPROVED') {
          toast.success(
            `Your leave request was APPROVED by ${data.hospitalName || 'hospital administration'}. Time slots are locked.`,
            'Leave Approved'
          )
        } else if (data.status === 'REJECTED') {
          toast.error(
            `Your leave request was declined: ${data.rejectionReason || 'Declined by administration'}. Time slots have been restored.`,
            'Leave Declined'
          )
        }
      } else if (user.role === UserRole.HOSPITAL_ADMIN) {
        useHospitalAdminLeavesStore.getState().updateLeaveStatusLocally(data.leaveId, data.status, data.rejectionReason)
      }
    }

    // 9. Event: Doctor Leave Cancelled (Hospital Admin receives)
    const handleDoctorLeaveCancelled = (data: {
      leaveId: string
      doctorId: string
      reopenedSlotsCount?: number
    }) => {
      if (user.role === UserRole.HOSPITAL_ADMIN) {
        useHospitalAdminLeavesStore.getState().updateLeaveStatusLocally(data.leaveId, 'CANCELLED')
        toast.info('A scheduled doctor leave was cancelled. Time slots are reopened.', 'Leave Cancelled')
      }
    }

    // 10. Event: Appointment Requires Reschedule Due to Doctor Leave (Patient receives)
    const handleAppointmentRescheduleRequired = (data: {
      appointmentId: string
      appointmentNumber?: string
      doctorName?: string
      doctorLeaveReason?: string
      rescheduleDeadline?: string
      date?: string
      time?: string
    }) => {
      if (user.role === UserRole.PATIENT) {
        useAppointmentStore.getState().updateAppointmentStatusLocally(
          data.appointmentId,
          'Reschedule Required',
          data.doctorLeaveReason
        )
        toast.warning(
          `Notice: Dr. ${data.doctorName || 'Your Doctor'} is on leave. Your appointment (#${data.appointmentNumber || ''}) requires priority rescheduling.`,
          'Priority Reschedule Required'
        )
      }
    }

    // Bind listeners
    socket.on('join-request:created', handleJoinRequestCreated)
    socket.on('join-request:status-updated', handleJoinRequestStatusUpdated)
    socket.on('verification:doctor:status-updated', handleDoctorVerificationUpdated)
    socket.on('verification:hospital-admin:status-updated', handleHospitalAdminVerificationUpdated)
    socket.on('verification:doctor:submitted', handleDoctorSubmitted)
    socket.on('verification:hospital-admin:submitted', handleHospitalAdminSubmitted)
    socket.on('doctor-leave:created', handleDoctorLeaveCreated)
    socket.on('doctor-leave:status-updated', handleDoctorLeaveStatusUpdated)
    socket.on('doctor-leave:cancelled', handleDoctorLeaveCancelled)
    socket.on('appointment:reschedule-required', handleAppointmentRescheduleRequired)

    // Cleanup on unmount or user logout
    return () => {
      socket.off('join-request:created', handleJoinRequestCreated)
      socket.off('join-request:status-updated', handleJoinRequestStatusUpdated)
      socket.off('verification:doctor:status-updated', handleDoctorVerificationUpdated)
      socket.off('verification:hospital-admin:status-updated', handleHospitalAdminVerificationUpdated)
      socket.off('verification:doctor:submitted', handleDoctorSubmitted)
      socket.off('verification:hospital-admin:submitted', handleHospitalAdminSubmitted)
      socket.off('doctor-leave:created', handleDoctorLeaveCreated)
      socket.off('doctor-leave:status-updated', handleDoctorLeaveStatusUpdated)
      socket.off('doctor-leave:cancelled', handleDoctorLeaveCancelled)
      socket.off('appointment:reschedule-required', handleAppointmentRescheduleRequired)
    }
  }, [user, token, isAuthenticated, updateUserApproval])
}

