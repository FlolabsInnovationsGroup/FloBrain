"use client";

import { useState } from "react";
import { Lock, CreditCard, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CheckoutPageProps {
  selectedPlan: {
    name: string;
    price: string;
    period: string;
    features: string[];
  };
}

export default function CheckoutPage({ selectedPlan }: CheckoutPageProps) {
  const router = useRouter();
  const [billingInfo, setBillingInfo] = useState({
    email: "",
    fullName: "",
    company: "",
    country: "United States",
    vatId: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate billing info
    if (!termsAccepted) return;

    setIsSubmitting(true);

    try {
      // Simulate validation/processing
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Pass billing info to payment page via sessionStorage or state management
      sessionStorage.setItem("billingInfo", JSON.stringify(billingInfo));

      // Navigate to payment method page
      router.push(`/payment?plan=${selectedPlan.name}&price=${selectedPlan.price}`);
    } catch (error) {
      console.error("Checkout error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a0033] via-[#2a1a4a] to-[#0f0f23] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#a1a1aa] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to pricing</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Billing Information */}
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Complete your purchase</h1>
              <p className="text-[#a1a1aa]">Enter your billing details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Billing Information Card */}
              <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-[#4c1d95]/50 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#8b5cf6]" />
                  Billing Information
                </h2>

                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email address *
                    </label>
                    <input
                      type="email"
                      required
                      value={billingInfo.email}
                      onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-[#2a1a4a]/50 border border-[#4c1d95]/50 rounded-lg text-white placeholder-[#6b6b7a] focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-colors"
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Full name *</label>
                    <input
                      type="text"
                      required
                      value={billingInfo.fullName}
                      onChange={(e) => setBillingInfo({ ...billingInfo, fullName: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-[#2a1a4a]/50 border border-[#4c1d95]/50 rounded-lg text-white placeholder-[#6b6b7a] focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-colors"
                    />
                  </div>

                  {/* Company (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Company (optional)
                    </label>
                    <input
                      type="text"
                      value={billingInfo.company}
                      onChange={(e) => setBillingInfo({ ...billingInfo, company: e.target.value })}
                      placeholder="Your company name"
                      className="w-full px-4 py-3 bg-[#2a1a4a]/50 border border-[#4c1d95]/50 rounded-lg text-white placeholder-[#6b6b7a] focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-colors"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Country *</label>
                    <select
                      required
                      value={billingInfo.country}
                      onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
                      className="w-full px-4 py-3 bg-[#2a1a4a]/50 border border-[#4c1d95]/50 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-colors"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Lebanon">Lebanon</option>
                      <option value="Sweden">Sweden</option>
                      {/* Add more countries as needed */}
                    </select>
                  </div>

                  {/* VAT ID (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      VAT ID (optional)
                    </label>
                    <input
                      type="text"
                      value={billingInfo.vatId}
                      onChange={(e) => setBillingInfo({ ...billingInfo, vatId: e.target.value })}
                      placeholder="EU123456789"
                      className="w-full px-4 py-3 bg-[#2a1a4a]/50 border border-[#4c1d95]/50 rounded-lg text-white placeholder-[#6b6b7a] focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-colors"
                    />
                    <p className="text-xs text-[#a1a1aa] mt-1">
                      For EU customers with valid VAT ID
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 bg-[#2a1a4a]/50 border-[#4c1d95] rounded text-[#8b5cf6] focus:ring-[#8b5cf6]"
                />
                <label htmlFor="terms" className="text-sm text-[#a1a1aa]">
                  I agree to the{" "}
                  <a href="#" className="text-[#8b5cf6] hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-[#8b5cf6] hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!termsAccepted || isSubmitting}
                className={`w-full py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  termsAccepted && !isSubmitting
                    ? "bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white hover:shadow-lg hover:shadow-[#8b5cf6]/50"
                    : "bg-[#3a3a52] text-[#6b6b7a] cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to payment
                    <CreditCard className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-[#4c1d95]/50 rounded-2xl p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

              {/* Plan Details */}
              <div className="mb-6 pb-6 border-b border-[#4c1d95]/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedPlan.name} Plan</h3>
                    <p className="text-sm text-[#a1a1aa] mt-1">
                      Billed {selectedPlan.period === "/month" ? "monthly" : "annually"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{selectedPlan.price}</div>
                    <div className="text-sm text-[#a1a1aa]">{selectedPlan.period}</div>
                  </div>
                </div>
              </div>

              {/* Features Included */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-white mb-3">What is included:</h4>
                <ul className="space-y-2">
                  {selectedPlan.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="text-sm text-[#a1a1aa] flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#8b5cf6] mt-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 py-4 border-t border-[#4c1d95]/30">
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Subtotal</span>
                  <span className="text-white">{selectedPlan.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Tax</span>
                  <span className="text-white">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-[#4c1d95]/30">
                  <span className="text-white">Total due today</span>
                  <span className="text-white">{selectedPlan.price}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-[#4c1d95]/30">
                <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                  <Shield className="w-4 h-4 text-[#10b981]" />
                  <span>Secure SSL encrypted payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
