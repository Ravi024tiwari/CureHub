import Razorpay from "razorpay";

/**
 * Razorpay SDK Singleton Instance
 *
 * Initialized once and reused across the application.
 * Uses test credentials from environment variables.
 *
 * Razorpay Test Mode:
 * - No real money is charged
 * - Use Razorpay test card/UPI flows for frontend testing
 * - Webhook signatures work identically to production
 */

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  throw new Error(
    "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be defined in environment variables."
  );
}

export const razorpayInstance = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

export const RAZORPAY_KEY_ID = razorpayKeyId;
export const RAZORPAY_KEY_SECRET = razorpayKeySecret;
