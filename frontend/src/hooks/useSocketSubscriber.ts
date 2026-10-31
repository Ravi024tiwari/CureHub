import { useEffect } from 'react'
import { socketService } from '@/services/socketService'
import { useAuthStore } from '@/store/authStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'
import { useDoctorStore } from '@/store/doctorStore'
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
    if (!isAuthenticated || !token || !user) {
      socketService.disconnect()
      return
    }

    // 1. Establish Handshake Connection with JWT Access Token
    const socket = socketService.connect(token)

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

    // Bind listeners
    socket.on('join-request:created', handleJoinRequestCreated)
    socket.on('join-request:status-updated', handleJoinRequestStatusUpdated)
    socket.on('verification:doctor:status-updated', handleDoctorVerificationUpdated)
    socket.on('verification:hospital-admin:status-updated', handleHospitalAdminVerificationUpdated)
    socket.on('verification:doctor:submitted', handleDoctorSubmitted)
    socket.on('verification:hospital-admin:submitted', handleHospitalAdminSubmitted)

    // Cleanup on unmount or user logout
    return () => {
      socket.off('join-request:created', handleJoinRequestCreated)
      socket.off('join-request:status-updated', handleJoinRequestStatusUpdated)
      socket.off('verification:doctor:status-updated', handleDoctorVerificationUpdated)
      socket.off('verification:hospital-admin:status-updated', handleHospitalAdminVerificationUpdated)
      socket.off('verification:doctor:submitted', handleDoctorSubmitted)
      socket.off('verification:hospital-admin:submitted', handleHospitalAdminSubmitted)
    }
  }, [user, token, isAuthenticated, updateUserApproval])
}

