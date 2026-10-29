import mongoose from "mongoose";
import { DoctorLeave, IDoctorLeave } from "../models/DoctorLeave.model.js";
import { Appointment } from "../models/Appointment.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { AppointmentStatus, SlotStatus } from "../constants/index.js";

/** 7-Day Free Priority Reschedule Window Duration in ms */
export const RESCHEDULE_WINDOW_DAYS = 7;
export const SEVEN_DAYS_MS = RESCHEDULE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/**
 * Safely parse a date and time string into a Date object (UTC normalized)
 */
export const parseSlotDateTime = (date: string, time?: string): Date => {
  if (!time) return new Date(`${date}T00:00:00.000Z`);
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${normalizedTime}.000Z`);
};

/**
 * Check if a doctor has an active (PENDING or APPROVED) leave overlapping a specific slot time
 */
export const isDoctorOnLeave = async (
  doctorId: string | mongoose.Types.ObjectId,
  date: string,
  startTime: string,
  endTime?: string
): Promise<{ onLeave: boolean; leave?: IDoctorLeave | null }> => {
  const slotStart = parseSlotDateTime(date, startTime);
  let slotEnd = parseSlotDateTime(date, endTime || startTime);

  // Buffer: slotEnd must be at least slotStart + 15 min if endTime is identical or missing
  if (slotEnd.getTime() <= slotStart.getTime()) {
    slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);
  }

  const conflictingLeave = await DoctorLeave.findOne({
    doctorId: new mongoose.Types.ObjectId(doctorId),
    status: { $in: ["PENDING", "APPROVED"] },
    startDateTime: { $lt: slotEnd },
    endDateTime: { $gt: slotStart },
  });

  return {
    onLeave: !!conflictingLeave,
    leave: conflictingLeave,
  };
};

/**
 * Block unbooked slots in the leave window by setting status to UNAVAILABLE
 */
export const blockSlotsForLeaveWindow = async (
  doctorId: mongoose.Types.ObjectId,
  startDateTime: Date,
  endDateTime: Date
): Promise<number> => {
  const startDateStr = startDateTime.toISOString().split("T")[0];
  const endDateStr = endDateTime.toISOString().split("T")[0];

  const slots = await TimeSlot.find({
    doctorId,
    date: { $gte: startDateStr, $lte: endDateStr },
    status: SlotStatus.AVAILABLE,
  });

  let blockedCount = 0;
  for (const slot of slots) {
    const slotStart = parseSlotDateTime(slot.date, slot.startTime);
    let slotEnd = parseSlotDateTime(slot.date, slot.endTime || slot.startTime);
    if (slotEnd.getTime() <= slotStart.getTime()) {
      slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
    }

    // If slot overlaps with leave window
    if (startDateTime < slotEnd && endDateTime > slotStart) {
      slot.status = SlotStatus.UNAVAILABLE;
      await slot.save();
      blockedCount++;
    }
  }

  return blockedCount;
};

/**
 * Re-open previously blocked unbooked slots back to AVAILABLE (e.g. upon rejection or cancellation)
 */
export const reopenSlotsForLeaveWindow = async (
  doctorId: mongoose.Types.ObjectId,
  startDateTime: Date,
  endDateTime: Date
): Promise<number> => {
  const now = new Date();
  const startDateStr = startDateTime.toISOString().split("T")[0];
  const endDateStr = endDateTime.toISOString().split("T")[0];

  const slots = await TimeSlot.find({
    doctorId,
    date: { $gte: startDateStr, $lte: endDateStr },
    status: SlotStatus.UNAVAILABLE,
    lockedByPatientId: null,
  });

  let reopenedCount = 0;
  for (const slot of slots) {
    const slotStart = parseSlotDateTime(slot.date, slot.startTime);
    let slotEnd = parseSlotDateTime(slot.date, slot.endTime || slot.startTime);
    if (slotEnd.getTime() <= slotStart.getTime()) {
      slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
    }

    // Only reopen future slots that fell within this leave window
    if (slotStart > now && startDateTime < slotEnd && endDateTime > slotStart) {
      slot.status = SlotStatus.AVAILABLE;
      slot.lockedAt = null;
      slot.lockExpiresAt = null;
      await slot.save();
      reopenedCount++;
    }
  }

  return reopenedCount;
};

/**
 * Process active confirmed appointments affected by an APPROVED leave:
 * - Moves them to RESCHEDULE_REQUIRED
 * - Grants a 7-day priority free reschedule window
 * - Records the doctor leave reason
 * - Releases/marks slot UNAVAILABLE
 */
export const processAppointmentsForApprovedLeave = async (
  leave: IDoctorLeave
): Promise<{ affectedCount: number; affectedAppointments: any[] }> => {
  const startDateStr = leave.startDateTime.toISOString().split("T")[0];
  const endDateStr = leave.endDateTime.toISOString().split("T")[0];

  const candidateAppointments = await Appointment.find({
    doctorId: leave.doctorId,
    date: { $gte: startDateStr, $lte: endDateStr },
    status: {
      $in: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CHECKED_IN,
        AppointmentStatus.PENDING_PAYMENT,
      ],
    },
  }).populate("patientId", "name email phoneNumber");

  const rescheduleDeadline = new Date(Date.now() + SEVEN_DAYS_MS);
  const affectedAppointments: any[] = [];

  for (const appt of candidateAppointments) {
    const apptStart = parseSlotDateTime(appt.date, appt.startTime);
    let apptEnd = parseSlotDateTime(appt.date, appt.endTime || appt.startTime);
    if (apptEnd.getTime() <= apptStart.getTime()) {
      apptEnd = new Date(apptStart.getTime() + 30 * 60 * 1000);
    }

    if (leave.startDateTime < apptEnd && leave.endDateTime > apptStart) {
      // 1. Move to RESCHEDULE_REQUIRED
      appt.status = AppointmentStatus.RESCHEDULE_REQUIRED;
      appt.rescheduleDeadline = rescheduleDeadline;
      appt.doctorLeaveReason =
        leave.reason || "Doctor on approved hospital leave";

      await appt.save();

      // 2. Mark the appointment slot UNAVAILABLE
      if (appt.slotId) {
        await TimeSlot.findByIdAndUpdate(appt.slotId, {
          status: SlotStatus.UNAVAILABLE,
          lockedByPatientId: null,
          lockedAt: null,
          lockExpiresAt: null,
        });
      }

      affectedAppointments.push(appt);
    }
  }

  // Also block any unbooked slots in this range
  await blockSlotsForLeaveWindow(
    leave.doctorId,
    leave.startDateTime,
    leave.endDateTime
  );

  return {
    affectedCount: affectedAppointments.length,
    affectedAppointments,
  };
};
