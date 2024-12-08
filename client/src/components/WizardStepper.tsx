import { cn } from "@/lib/utils"; // Utility function for conditionally combining class names
import { Check } from "lucide-react"; // Icon component for a checkmark
import React from "react";

// Props type definition for the WizardStepper component
interface WizardStepperProps {
  currentStep: number; // The current step in the wizard process
}

// Functional component for displaying a stepper for a wizard-like UI flow
const WizardStepper = ({ currentStep }: WizardStepperProps) => {
  return (
    <div className="wizard-stepper">
      {/* Container for the stepper elements */}
      <div className="wizard-stepper__container">
        {/* Map through an array of steps (1, 2, 3) to dynamically render step components */}
        {[1, 2, 3].map((step, index) => (
          // React.Fragment is used to avoid unnecessary wrapper elements
          <React.Fragment key={step}>
            {/* Individual step container */}
            <div className="wizard-stepper__step">
              {/* Circle representing the step */}
              <div
                className={cn("wizard-stepper__circle", {
                  // Style the circle as completed if the current step is past this step
                  "wizard-stepper__circle--completed":
                    currentStep > step || (currentStep === 3 && step === 3),
                  // Style the circle as the current step if it's active but not the last step
                  "wizard-stepper__circle--current":
                    currentStep === step && step !== 3,
                  // Style the circle as upcoming if the current step hasn't reached this step
                  "wizard-stepper__circle--upcoming": currentStep < step,
                })}
              >
                {/* Show a check icon if the step is completed; otherwise, show the step number */}
                {currentStep > step || (currentStep === 3 && step === 3) ? (
                  <Check className="w-5 h-5" /> // Check icon for completed steps
                ) : (
                  <span>{step}</span> // Step number for non-completed steps
                )}
              </div>
              {/* Text below the circle describing the step */}
              <p
                className={cn("wizard-stepper__text", {
                  // Style the text as active if the current step has reached or passed this step
                  "wizard-stepper__text--active": currentStep >= step,
                  // Style the text as inactive if the current step is before this step
                  "wizard-stepper__text--inactive": currentStep < step,
                })}
              >
                {/* Dynamically set the step description based on the step number */}
                {step === 1 && "Details"}
                {step === 2 && "Payment"}
                {step === 3 && "Completion"}
              </p>
            </div>
            {/* Render a line between steps except after the last step */}
            {index < 2 && (
              <div
                className={cn("wizard-stepper__line", {
                  // Style the line as completed if the current step has passed this step
                  "wizard-stepper__line--completed": currentStep > step,
                  // Style the line as incomplete if the current step hasn't passed this step
                  "wizard-stepper__line--incomplete": currentStep <= step,
                })}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WizardStepper; // Export the component as the default export
