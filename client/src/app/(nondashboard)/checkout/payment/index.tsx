import React from "react";
import StripeProvider from "./StripeProvider";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { useClerk, useUser } from "@clerk/nextjs";
import CoursePreview from "@/components/CoursePreview";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTransactionMutation } from "@/state/api";
import { toast } from "sonner";

const PaymentPageContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [createTransaction] = useCreateTransactionMutation();
  const { navigateToStep } = useCheckoutNavigation();
  const { course, courseId } = useCurrentCourse();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Payment submission started");

    if (!stripe || !elements) {
      toast.error("Stripe service is not available");
      console.error("Stripe or elements not initialized");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL
      ? `http://${process.env.NEXT_PUBLIC_LOCAL_URL}`
      : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined;

    console.log("Base URL determined:", baseUrl);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${baseUrl}/checkout?step=3&id=${courseId}`,
        },
        redirect: "if_required",
      });

      console.log("Payment result:", result);

      if (result.error) {
        console.error("Error in payment confirmation:", result.error);
        toast.error(`Payment failed: ${result.error.message}`);
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        console.log("Payment succeeded:", result.paymentIntent);

        const transactionData: Partial<Transaction> = {
          transactionId: result.paymentIntent.id,
          userId: user?.id,
          courseId: courseId,
          paymentProvider: "stripe",
          amount: course?.price || 0,
        };

        console.log("Transaction data:", transactionData);

        await createTransaction(transactionData);
        navigateToStep(3);

        toast.success("Payment successful!");
      } else {
        console.warn("Payment intent status:", result.paymentIntent?.status);
        toast.warning(
          `Payment not completed. Status: ${result.paymentIntent?.status}`
        );
      }
    } catch (error) {
      console.error("Unexpected error during payment:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleSignOutAndNavigate = async () => {
    await signOut();
    navigateToStep(1);
  };

  if (!course) return null;

  return (
    <div className="payment">
      <div className="payment__container">
        {/* Order Summary */}
        <div className="payment__preview">
          <CoursePreview course={course} />
        </div>

        {/* Payment Form */}
        <div className="payment__form-container">
          <form
            id="payment-form"
            onSubmit={handleSubmit}
            className="payment__form"
          >
            <div className="payment__content">
              <h1 className="payment__title">Checkout</h1>
              <p className="payment__subtitle">
                Fill out the payment details below to complete your purchase.
              </p>

              <div className="payment__method">
                <h3 className="payment__method-title">Payment Method</h3>

                <div className="payment__card-container">
                  <div className="payment__card-header">
                    <CreditCard size={24} />
                    <span>Credit/Debit Card</span>
                  </div>
                  <div className="payment__card-element">
                    <PaymentElement />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="payment__actions">
        <Button
          className="hover:bg-white-50/10"
          onClick={handleSignOutAndNavigate}
          variant="outline"
          type="button"
        >
          Switch Account
        </Button>

        <Button
          form="payment-form"
          type="submit"
          className="payment__submit"
          disabled={!stripe || !elements}
        >
          Pay with Credit Card
        </Button>
      </div>
    </div>
  );
};

const PaymentPage = () => (
  <StripeProvider>
    <PaymentPageContent />
  </StripeProvider>
);

export default PaymentPage;
