// /app/api/create-payment-link/route.ts

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  const { name, email } = await req.json(); 
  const link = await razorpay.paymentLink.create({
    amount: 59000 * 100,
    currency: "INR",
    description: "IRA Score Improvement Plan", 
    customer: {
      name: name || "Valued Customer",  
      email: email || "",               
    },
  });

  return NextResponse.json({ link: link.short_url });
}
