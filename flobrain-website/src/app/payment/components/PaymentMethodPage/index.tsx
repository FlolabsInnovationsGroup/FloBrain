"use client";

import { useState } from "react";
import { CreditCard, Lock, ArrowLeft, AlertCircle, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily: "system-ui, sans-serif",
      fontSize: "16px",
      "::placeholder": {
        color: "#6b6b7a",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

function PaymentMethodForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
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
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message || "An error occurred");
        setIsProcessing(false);
        return;
      }

      // Here you would send paymentMethod.id to your backend
      console.warn("Payment Method ID:", paymentMethod?.id);

      // Simulate successful payment
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-[#10b981]/20 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-[#10b981]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
        <p className="text-[#a1a1aa]">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Card number *</label>
        <div className="px-4 py-3 bg-[#2a1a4a]/50 border border-[#4c1d95]/50 rounded-lg focus-within:border-[#8b5cf6] focus-within:ring-1 focus-within:ring-[#8b5cf6] transition-colors">
          <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Expiry and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Expiry date *</label>
          <div className="px-4 py-3 bg-[#2a1a4a]/50 border border-[#4c1d95]/50 rounded-lg focus-within:border-[#8b5cf6] focus-within:ring-1 focus-within:ring-[#8b5cf6] transition-colors">
            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">CVC *</label>
          <div className="px-4 py-3 bg-[#2a1a4a]/50 border border-[#4c1d95]/50 rounded-lg focus-within:border-[#8b5cf6] focus-within:ring-1 focus-within:ring-[#8b5cf6] transition-colors">
            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">Last 3 digits on back of card</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
          !stripe || isProcessing
            ? "bg-[#3a3a52] text-[#6b6b7a] cursor-not-allowed"
            : "bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white hover:shadow-lg hover:shadow-[#8b5cf6]/50"
        }`}
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Complete Payment
          </>
        )}
      </button>

      {/* Security Info */}
      <div className="flex items-center justify-center gap-6 pt-4 text-xs text-[#a1a1aa]">
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          <span>PCI Compliant</span>
        </div>
      </div>
    </form>
  );
}

export default function PaymentMethodPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a0033] via-[#2a1a4a] to-[#0f0f23] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#a1a1aa] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Add payment method</h1>
          <p className="text-[#a1a1aa]">Enter your card details to complete your subscription</p>
        </div>

        {/* Payment Form Card */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-[#4c1d95]/50 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <h2 className="text-xl font-semibold text-white">Card Details</h2>
          </div>

          <Elements stripe={stripePromise}>
            <PaymentMethodForm />
          </Elements>

          {/* Accepted Cards */}
          <div className="mt-8 pt-6 border-t border-[#4c1d95]/30">
            <p className="text-xs text-[#a1a1aa] mb-3">We accept:</p>
            <div className="flex gap-3">
              {["Visa", "Mastercard", "Amex", "Discover"].map((card) => (
                <div
                  key={card}
                  className="px-3 py-2 bg-[#2a1a4a]/50 border border-[#4c1d95]/30 rounded text-xs text-[#a1a1aa]"
                >
                  {card}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#a1a1aa]">
            By providing your card information, you allow FloBrain to charge your card for future
            payments in accordance with their terms.
          </p>
        </div>
      </div>
    </main>
  );
}
