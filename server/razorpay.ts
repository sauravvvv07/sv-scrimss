import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret",
});

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  receipt: string;
  description: string;
}

export async function createPaymentOrder(params: CreateOrderParams) {
  try {
    const order = await razorpay.orders.create({
      amount: params.amount * 100, // Convert to paise
      currency: params.currency || "INR",
      receipt: params.receipt,
      description: params.description,
    });
    return order;
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    throw error;
  }
}

export async function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  secret: string
): Promise<boolean> {
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const generated_signature = hmac.digest("hex");
  return generated_signature === razorpaySignature;
}
