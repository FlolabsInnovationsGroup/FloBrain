"use client";

import { useState } from "react";
import { Lock, CreditCard, Shield, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface CheckoutPageProps {
  selectedPlan: {
    name: string;
    price: string;
    period: string;
    features: string[];
  };
}

const inputClass =
  "fb-auth-input h-12 w-full rounded-xl border px-4 text-sm outline-none transition-all disabled:opacity-60";
const labelClass = "fb-auth-label mb-1.5 block text-sm font-medium";

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

    if (!termsAccepted) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      sessionStorage.setItem("billingInfo", JSON.stringify(billingInfo));

      router.push(`/payment?plan=${selectedPlan.name}&price=${selectedPlan.price}`);
    } catch (error) {
      console.error("Checkout error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="fb-auth-bg min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.back()}
          className="fb-auth-link mb-8 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to pricing</span>
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-8">
              <h1 className="fb-auth-heading mb-2 text-4xl font-bold">Complete your purchase</h1>
              <p className="fb-auth-muted">Enter your billing details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="fb-auth-card rounded-2xl p-6">
                <h2 className="fb-auth-heading mb-6 flex items-center gap-2 text-xl font-semibold">
                  <Lock className="fb-auth-icon h-5 w-5" />
                  Billing Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Email address *</label>
                    <input
                      type="email"
                      required
                      value={billingInfo.email}
                      onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Full name *</label>
                    <input
                      type="text"
                      required
                      value={billingInfo.fullName}
                      onChange={(e) => setBillingInfo({ ...billingInfo, fullName: e.target.value })}
                      placeholder="John Doe"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Company (optional)</label>
                    <input
                      type="text"
                      value={billingInfo.company}
                      onChange={(e) => setBillingInfo({ ...billingInfo, company: e.target.value })}
                      placeholder="Your company name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Country *</label>
                    <select
                      required
                      value={billingInfo.country}
                      onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
                      className={inputClass}
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Lebanon">Lebanon</option>
                      <option value="Sweden">Sweden</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>VAT ID (optional)</label>
                    <input
                      type="text"
                      value={billingInfo.vatId}
                      onChange={(e) => setBillingInfo({ ...billingInfo, vatId: e.target.value })}
                      placeholder="EU123456789"
                      className={inputClass}
                    />
                    <p className="fb-auth-muted mt-1 text-xs">For EU customers with valid VAT ID</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded accent-[var(--fb-auth-btn)]"
                />
                <label htmlFor="terms" className="fb-auth-muted text-sm">
                  I agree to the{" "}
                  <a href="#" className="fb-auth-link font-semibold transition-colors">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="fb-auth-link font-semibold transition-colors">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={!termsAccepted || isSubmitting}
                className={`fb-auth-btn flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-opacity ${
                  !termsAccepted || isSubmitting ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to payment
                    <CreditCard className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div>
            <div className="fb-auth-card sticky top-8 rounded-2xl p-6">
              <h2 className="fb-auth-heading mb-6 text-xl font-semibold">Order Summary</h2>

              <div className="mb-6 pb-6">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="fb-auth-heading text-lg font-semibold">{selectedPlan.name} Plan</h3>
                    <p className="fb-auth-muted mt-1 text-sm">
                      Billed {selectedPlan.period === "/month" ? "monthly" : "annually"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="fb-auth-heading text-2xl font-bold">{selectedPlan.price}</div>
                    <div className="fb-auth-muted text-sm">{selectedPlan.period}</div>
                  </div>
                </div>
                <div className="fb-auth-divider mt-6 h-px w-full" />
              </div>

              <div className="mb-6">
                <h4 className="fb-auth-label mb-3 text-sm">What is included:</h4>
                <ul className="space-y-2">
                  {selectedPlan.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="fb-auth-muted flex items-start gap-2 text-sm">
                      <div className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--fb-auth-btn)]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 py-4">
                <div className="fb-auth-divider h-px w-full" />
                <div className="flex justify-between text-sm">
                  <span className="fb-auth-muted">Subtotal</span>
                  <span className="fb-auth-heading">{selectedPlan.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="fb-auth-muted">Tax</span>
                  <span className="fb-auth-heading">Calculated at checkout</span>
                </div>
                <div className="fb-auth-divider h-px w-full" />
                <div className="flex justify-between pt-1 text-lg font-semibold">
                  <span className="fb-auth-heading">Total due today</span>
                  <span className="fb-auth-heading">{selectedPlan.price}</span>
                </div>
              </div>

              <div className="mt-6 pt-2">
                <div className="fb-auth-divider mb-6 h-px w-full" />
                <div className="fb-auth-muted flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-[#00A409]" />
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
