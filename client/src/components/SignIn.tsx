"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import React from "react";
import { dark } from "@clerk/themes";
import { useSearchParams } from "next/navigation";

const SignInComponent = () => {
  const { user } = useUser(); // Hook to get the autheticated user
  const searchParams = useSearchParams(); // Hook to retrieve query parameters from the URL
  const isCheckoutPage = searchParams.get("showSignUp") !== null; // Check if the URL contains "showSignUp" (indicates we're in the checkout flow)
  const courseId = searchParams.get("id"); //Extract the course ID from the query parameters

  // Determine the sign-up URL based on whether it's a checkout page or not
  const signUpUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=true` // Checkout specific sign up flow
    : "/signup"; // Default sign up flow

  // Function to compute the redirec URL after signing in
  const getRedirectUrl = () => {
    if (isCheckoutPage) {
      // Redirect to the next step in the checkout flow
      return `/checkout?step=2&id=${courseId}&showSignUp=true`;
    }

    // Determine the redirect URL based on user type (e.g. "teacher" or general user)
    const userType = user?.publicMetadata?.userType as string;
    if (userType === "teacher") {
      return "/teacher/courses";
    }
    return "/user/courses";
  };

  return (
    <SignIn
      appearance={{
        baseTheme: dark,
        elements: {
          rootBox: "flex justify-center items-center py-5",
          cardBox: "shadow-none",
          card: "bg-customgreys-secondarybg w-full shadow-none",
          footer: {
            background: "#25262F",
            padding: "0rem 2.5rem",
            "& > div > div:nth-child(1)": {
              background: "#25262F",
            },
          },
          formFieldLabel: "text-white-50 font-normal",
          formButtonPrimary:
            "bg-primary-700 text-white-100 hover:bg-primary-600 !shadow-none",
          formFieldInput: "bg-customgreys-primarybg text-white-50 !shadow-none",
          footerActionLink: "text-primary-750 hover:text-primary-600",
        },
      }}
      signUpUrl={signUpUrl}
      forceRedirectUrl={getRedirectUrl()}
      routing="hash"
      afterSignOutUrl="/"
    />
  );
};

export default SignInComponent;
