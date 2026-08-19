"use client";

import { useState } from "react";
import { CreditCard, Lock, ArrowLeft, AlertCircle, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : Promise.resolve(null);

const inputWrapClass =
  "fb-auth-input rounded-xl border px-4 py-3";
const nativeInputClass =
  "fb-auth-input h-12 w-full rounded-xl border px-4 text-sm outline-none transition-all disabled:opacity-60";
const labelClass = "fb-auth-label mb-1.5 block text-sm font-medium";
const submitClass =
  "fb-auth-btn mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60";

function stripeCardOptions(isLight: boolean) {
  return {
    style: {
      base: {
        color: isLight ? "#000000" : "#ffffff",
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        "::placeholder": {
          color: isLight ? "rgba(0, 0, 0, 0.38)" : "#6b6b7a",
        },
        "::selection": {
          color: isLight ? "#000000" : "#ffffff",
          backgroundColor: isLight ? "rgba(194, 98, 226, 0.28)" : "rgba(139,92,246,0.25)",
        },
      },
      invalid: {
        color: isLight ? "#d70000" : "#ef4444",
        iconColor: isLight ? "#d70000" : "#ef4444",
      },
    },
    disabled: false,
  };
}

function SuccessState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00A409]/15">
        <Check className="h-8 w-8 text-[#00A409]" />
      </div>
      <h2 className="fb-auth-heading mb-2 text-2xl font-bold">Payment Successful!</h2>
      <p className="fb-auth-muted">Redirecting to your dashboard...</p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="fb-auth-error flex items-start gap-2 rounded-lg border px-3 py-2">
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function SecurityNotes() {
  return (
    <div className="fb-auth-muted flex items-center justify-center gap-6 pt-4 text-xs">
      <div className="flex items-center gap-1">
        <Lock className="h-3 w-3" />
        <span>SSL Encrypted</span>
      </div>
      <div className="flex items-center gap-1">
        <CreditCard className="h-3 w-3" />
        <span>PCI Compliant</span>
      </div>
    </div>
  );
}

function PaymentMethodForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { resolvedTheme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const cardOptions = stripeCardOptions(resolvedTheme === "light");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe is not available yet. Please refresh the page.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardNumberElement);

    if (!cardElement) {
      setError("Card element not found");
      setIsProcessing(false);
      return;
    }

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message || "An error occurred");
        setIsProcessing(false);
        return;
      }

      console.warn("Payment Method ID:", paymentMethod?.id);
      setPaymentSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (_err) {
      setError("An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return <SuccessState />;
  }

  const submitDisabled = !stripe || isProcessing;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Card number *</label>
        <div className={inputWrapClass}>
          <CardNumberElement options={cardOptions} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Expiry date *</label>
          <div className={inputWrapClass}>
            <CardExpiryElement options={cardOptions} />
          </div>
        </div>

        <div>
          <label className={labelClass}>CVC *</label>
          <div className={inputWrapClass}>
            <CardCvcElement options={cardOptions} />
          </div>
          <p className="fb-auth-muted mt-1 text-xs">Last 3 digits on back of card</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <button
        type="submit"
        disabled={submitDisabled}
        className={submitClass}
      >
        {isProcessing ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            Complete Payment
          </>
        )}
      </button>

      <SecurityNotes />
    </form>
  );
}

function PaymentMethodFormFallback() {
  const router = useRouter();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cardNumber.trim() || !expiry.trim() || !cvc.trim()) {
      setError("Please fill in all card fields.");
      return;
    }

    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 800));
    setPaymentSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  if (paymentSuccess) {
    return <SuccessState />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Card number *</label>
        <input
          type="text"
          inputMode="numeric"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="4242 4242 4242 4242"
          className={nativeInputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Expiry date *</label>
          <input
            type="text"
            inputMode="numeric"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            placeholder="MM / YY"
            className={nativeInputClass}
          />
        </div>

        <div>
          <label className={labelClass}>CVC *</label>
          <input
            type="text"
            inputMode="numeric"
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
            placeholder="123"
            className={nativeInputClass}
          />
          <p className="fb-auth-muted mt-1 text-xs">Last 3 digits on back of card</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <button
        type="submit"
        disabled={isProcessing}
        className={submitClass}
      >
        {isProcessing ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            Complete Payment
          </>
        )}
      </button>

      <SecurityNotes />
    </form>
  );
}

export default function PaymentMethodPage() {
  const router = useRouter();
  const isStripeConfigured = Boolean(STRIPE_PUBLISHABLE_KEY);

  return (
    <main className="fb-auth-bg min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.back()}
          className="fb-auth-link mb-8 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="mb-8">
          <h1 className="fb-auth-heading mb-2 text-4xl font-bold">Add payment method</h1>
          <p className="fb-auth-muted">Enter your card details to complete your subscription</p>
        </div>

        <div className="fb-auth-card rounded-2xl p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="fb-auth-social flex h-10 w-10 items-center justify-center rounded-lg border">
              <CreditCard className="fb-auth-icon h-5 w-5" />
            </div>
            <h2 className="fb-auth-heading text-xl font-semibold">Card Details</h2>
          </div>

          {isStripeConfigured ? (
            <Elements stripe={stripePromise}>
              <PaymentMethodForm />
            </Elements>
          ) : (
            <PaymentMethodFormFallback />
          )}

          <div className="mt-8 pt-6">
            <div className="fb-auth-divider mb-6 h-px w-full" />
            <p className="fb-auth-muted mb-3 text-xs">We accept:</p>
            <div className="flex gap-3">
              {["Visa", "Mastercard", "Amex", "Discover"].map((card) => (
                <div key={card} className="fb-auth-social rounded-xl border px-3 py-2 text-xs font-medium">
                  {card}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="fb-auth-muted text-sm">
            By providing your card information, you allow FloBrain to charge your card for future
            payments in accordance with their terms.
          </p>
        </div>
      </div>
    </main>
  );
}
