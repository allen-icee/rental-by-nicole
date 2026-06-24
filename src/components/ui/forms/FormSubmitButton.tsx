import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

type FormSubmitButtonProps = {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  isSubmitSuccessful: boolean;
  defaultText?: string;
  loadingText?: string;
  successText?: string;
};

export function FormSubmitButton({
  isDirty,
  isValid,
  isSubmitting,
  isSubmitSuccessful,
  defaultText = "Save Changes",
  loadingText = "Saving...",
  successText = "Saved!"
}: FormSubmitButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSubmitSuccessful) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitSuccessful]);

  const isDisabled = !isDirty || !isValid || isSubmitting;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`relative flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-bold text-white transition-all duration-300 w-full sm:w-auto overflow-hidden ${
        showSuccess
          ? "bg-green-500 hover:bg-green-600 shadow-sm"
          : isSubmitting
          ? "bg-brand-primary/80 cursor-not-allowed"
          : isDisabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-brand-primary hover:bg-brand-accent shadow-soft hover:-translate-y-1"
      }`}
    >
      {showSuccess ? (
        <>
          <Icon icon="mdi:check-circle" className="size-5 animate-bounce" />
          <span>{successText}</span>
        </>
      ) : isSubmitting ? (
        <>
          <Icon icon="mdi:loading" className="size-5 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <span>{defaultText}</span>
      )}
    </button>
  );
}
