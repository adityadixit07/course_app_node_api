import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentProcessing = async (paymentDetail) => {
  try {
    // Initialize Razorpay payment
    const payment = await razorpay.orders.create({
      amount: paymentDetail.amount, // Amount in smallest currency unit (e.g., paisa in India)
      currency: paymentDetail.currency,
      receipt: paymentDetail.receipt,
    });

    return payment;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

export default paymentProcessing;
