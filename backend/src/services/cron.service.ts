import cron from "node-cron";
import { Appointment } from "../models/Appointment.model.js";
import { Payment } from "../models/Payment.model.js";
import { AppointmentStatus, PaymentStatus } from "../constants/index.js";
import { razorpayInstance } from "../config/razorpay.js";
import { releaseExpiredSlotLocks } from "../controllers/payment.controller.js";

/**
 * Auto-refund patients whose 7-day priority reschedule window has expired
 */
export const processExpiredRescheduleRefunds = async (): Promise<void> => {
  try {
    const now = new Date();
    const expiredAppointments = await Appointment.find({
      status: AppointmentStatus.RESCHEDULE_REQUIRED,
      rescheduleDeadline: { $lte: now },
    });

    if (expiredAppointments.length === 0) return;

    console.log(
      `[Cron: Reschedule Expiry] Found ${expiredAppointments.length} appointment(s) with expired reschedule windows. Processing auto-refunds...`
    );

    for (const appt of expiredAppointments) {
      appt.status = AppointmentStatus.CANCELLED_BY_DOCTOR;
      appt.cancellation = {
        reason: "Auto-cancelled: 7-day priority reschedule window expired after doctor leave. Full refund initiated.",
        cancelledAt: new Date(),
      };
      appt.rescheduleDeadline = null;
      await appt.save();

      // Find completed payment and issue Razorpay refund
      const payment = await Payment.findOne({
        appointmentId: appt._id,
        status: PaymentStatus.COMPLETED,
      });

      if (payment && payment.transactionId) {
        try {
          const refund = await razorpayInstance.payments.refund(payment.transactionId, {
            speed: "normal",
            notes: {
              reason: "Auto-refund: 7-day reschedule window expired",
              appointmentNumber: appt.appointmentNumber,
            },
          });

          payment.status = PaymentStatus.REFUNDED;
          payment.refundedAt = new Date();
          payment.refundId = refund.id;
          await payment.save();

          console.log(
            `[Cron: Auto-Refund Success] Appt: ${appt.appointmentNumber}, Payment: ${payment.transactionId}, Refund: ${refund.id}`
          );
        } catch (refundErr: any) {
          console.error(
            `[Cron: Auto-Refund Error] Failed to refund ${appt.appointmentNumber}: ${refundErr.message}`
          );
          payment.status = PaymentStatus.REFUNDED;
          payment.refundedAt = new Date();
          payment.refundId = `MANUAL-REFUND-PENDING-${Date.now()}`;
          await payment.save();
        }
      } else if (payment) {
        payment.status = PaymentStatus.FAILED;
        await payment.save();
      }
    }
  } catch (err: any) {
    console.error("[Cron: Reschedule Expiry Job Error]", err.message);
  }
};

/**
 * Initialize all production background cron jobs
 */
export const initCronJobs = (): void => {
  // 1. Release expired 5-minute locked slots (Runs every 1 minute)
  cron.schedule("* * * * *", async () => {
    try {
      await releaseExpiredSlotLocks();
    } catch (err: any) {
      console.error("[Cron: Slot Release Error]", err.message);
    }
  });

  // 2. Process auto-refunds for expired doctor-leave reschedule windows (Runs every 15 minutes)
  cron.schedule("*/15 * * * *", async () => {
    await processExpiredRescheduleRefunds();
  });

  console.log("⏰ Production background cron jobs scheduled (Slot Lock Cleanup: 1m, Reschedule Auto-Refund: 15m)");
};
