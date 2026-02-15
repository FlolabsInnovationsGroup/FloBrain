"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlanUpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: {
    name: string;
    price: string;
  };
  selectedPlan: {
    name: string;
    price: string;
    period?: string;
  };
  onConfirm: () => void;
}


export default function PlanUpgradePopup({
  isOpen,
  onClose,
  currentPlan,
  selectedPlan,
  onConfirm,
}: PlanUpgradePopupProps) {
  const router = useRouter();
  
  if (!isOpen) return null;

  const isUpgrade = currentPlan.name !== selectedPlan.name;

  const handleConfirmAction = async () => {
  try {
    if (selectedPlan.price === "Free") {
      onConfirm();
      onClose();
    } else if (selectedPlan.price === "Custom") {
      router.push('/contact');
    } else {
      // Close popup first for better UX
      onClose();
      // Then navigate
      router.push(`/checkout?plan=${encodeURIComponent(selectedPlan.name)}&price=${encodeURIComponent(selectedPlan.price)}&period=${encodeURIComponent(selectedPlan.period || '/month')}`);
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a2e] border border-[#4c1d95]/50 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a1a1aa] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6">
          Confirm changes
        </h2>

        {/* Current Plan */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-4 bg-[#2a1a4a]/30 rounded-lg border border-[#4c1d95]/30">
            <span className="text-white font-medium capitalize">{currentPlan.name}</span>
            <span className="text-[#a1a1aa] text-sm">
              {currentPlan.price}
            </span>
          </div>
        </div>

        {/* Upgrade Arrow */}
        {isUpgrade && (
          <div className="flex justify-center mb-4">
            <div className="text-[#a1a1aa] text-sm">↓ Upgrade to</div>
          </div>
        )}

        {/* Selected Plan */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#8b5cf6]/20 to-[#c084fc]/20 rounded-lg border border-[#8b5cf6]/50">
            <span className="text-white font-medium">{selectedPlan.name}</span>
            <span className="text-white font-semibold">
              {selectedPlan.price}
              {selectedPlan.price !== "Free" && selectedPlan.price !== "Custom" && (
                <span className="text-sm">/mo</span>
              )}
            </span>
          </div>
        </div>

        {/* Payment Method Section (for paid plans) */}
        {selectedPlan.price !== "Free" && selectedPlan.price !== "Custom" && (
          <div className="mb-6">
            <p className="text-[#a1a1aa] text-sm mb-3">
              You will be redirected to complete your billing information and payment.
            </p>
          </div>
        )}

        {/* Enterprise Contact */}
        {selectedPlan.price === "Custom" && (
          <div className="mb-6">
            <p className="text-[#a1a1aa] text-sm mb-3">
              Our sales team will contact you to discuss custom pricing and features for your organization.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-transparent border border-[#4c1d95] text-white rounded-lg font-medium hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/10 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAction}
            className="flex-1 py-3 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white hover:shadow-lg hover:shadow-[#8b5cf6]/50"
          >
            {selectedPlan.price === "Free" ? "Activate" : selectedPlan.price === "Custom" ? "Contact Sales" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
