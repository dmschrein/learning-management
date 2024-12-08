import Stripe from "stripe";
import dotenv from "dotenv";
import { Request, Response } from "express";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is required but was not found in env variables"
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const listTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.query;

  try {
    console.log("Fetching transactions for userId:", userId);

    const transactions = userId
      ? await Transaction.query("userId").eq(userId).exec()
      : await Transaction.scan().exec();

    console.log("Transactions retrieved successfully:", transactions);

    res.json({
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ message: "Error retrieving transactions", error });
  }
};

export const createStripePaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  let { amount } = req.body;

  console.log(
    "Received request to create Stripe payment intent with amount:",
    amount
  );

  if (!amount || amount <= 0) {
    console.log("Invalid amount provided. Defaulting to 50.");
    amount = 50;
  }

  try {
    console.log("Creating payment intent with amount:", amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    console.log("Payment intent created successfully:", paymentIntent);

    res.json({
      message: "Payment intent created successfully",
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    console.error("Error creating Stripe payment intent:", error);
    res
      .status(500)
      .json({ message: "Error creating Stripe payment intent", error });
  }
};

export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId, transactionId, amount, paymentProvider } = req.body;

  console.log("Received request to create transaction:", req.body);

  try {
    // 1. Get course info
    console.log("Fetching course details for courseId:", courseId);
    const course = await Course.get(courseId);
    console.log("Course details fetched:", course);

    // 2. Create transaction record
    console.log("Creating new transaction record");
    const newTransaction = new Transaction({
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      amount,
      paymentProvider,
    });
    await newTransaction.save();
    console.log("Transaction record saved successfully:", newTransaction);

    // 3. Create initial course progress
    console.log("Creating initial course progress for userId:", userId);
    const initialProgress = new UserCourseProgress({
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: course.sections.map((section: any) => ({
        sectionId: section.sectionId,
        chapters: section.chapters.map((chapter: any) => ({
          chapterId: chapter.chapterId,
          completed: false,
        })),
      })),
      lastAccessedTimestamp: new Date().toISOString(),
    });
    await initialProgress.save();
    console.log("Initial course progress saved successfully:", initialProgress);

    // 4. Add enrollment to relevant course
    console.log("Updating course enrollments for courseId:", courseId);
    await Course.update(
      { courseId },
      {
        $ADD: {
          enrollments: [{ userId }],
        },
      }
    );
    console.log("Course enrollments updated successfully");

    res.json({
      message: "Purchased Course successfully",
      data: {
        transaction: newTransaction,
        courseProgress: initialProgress,
      },
    });
  } catch (error) {
    console.error(
      "Error creating transaction and enrollment for request:",
      req.body,
      error
    );
    res
      .status(500)
      .json({ message: "Error creating transaction and enrollment", error });
  }
};
