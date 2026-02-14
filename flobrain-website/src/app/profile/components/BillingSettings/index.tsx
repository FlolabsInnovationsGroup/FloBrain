"use client";

import Link from "next/link";
import { getPlanByName, getPlanPrice } from "../../../pricing/plans";

const CURRENT_PLAN_NAME = "Pro";

export default function BillingSettings() {
  const planDefinition = getPlanByName(CURRENT_PLAN_NAME);
  const { price, period } = planDefinition
    ? getPlanPrice(planDefinition, "monthly")
    : { price: "$ 49", period: "/month" };

  const usage = {
    apiCalls: {
      used: "120,500",
      limit: planDefinition?.apiCallsLimit ?? "500,000",
    },
    devices: {
      used: "8",
      limit: planDefinition?.deviceLimit.replace("Up to ", "") ?? "30",
    },
    memoryStorage: {
      used: "12 GB",
      limit: planDefinition?.memoryStorageLimit.replace(" memory storage", "") ?? "50 GB",
    },
  };

  const invoices = [
    { id: "INV-2026-001", date: "Feb 01, 2026", amount: "$ 49.00", status: "Paid" },
    { id: "INV-2026-002", date: "Jan 01, 2026", amount: "$ 49.00", status: "Paid" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Billing</h2>

      {/* Current Plan */}
      <section className="rounded-xl border border-purple-500/30 bg-indigo-950/50 p-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-white/60">Current plan</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-white">
                {planDefinition?.name ?? CURRENT_PLAN_NAME}
              </span>
              <span className="text-white/80">
                {price}
                <span className="text-sm text-white/60">{period}</span>
              </span>
            </div>
            <p className="mt-1 text-sm text-emerald-400">Active</p>
            <p className="mt-1 text-xs text-white/60">Renews on Mar 15, 2026</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#8b5cf6]/40 transition-all"
            >
              Change plan
            </Link>
            <Link
              href="/payment"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-purple-500/40 text-white text-sm font-medium hover:bg-purple-900/30 transition-all"
            >
              Update payment method
            </Link>
          </div>
        </div>
      </section>

      {/* Usage Summary */}
      <section className="rounded-xl border border-purple-500/30 bg-indigo-950/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Usage</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-purple-500/30 bg-indigo-950/60 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">API calls</p>
            <p className="text-white text-lg font-semibold">
              {usage.apiCalls.used}
              <span className="text-sm text-white/60"> / {usage.apiCalls.limit}</span>
            </p>
          </div>
          <div className="rounded-lg border border-purple-500/30 bg-indigo-950/60 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">Devices</p>
            <p className="text-white text-lg font-semibold">
              {usage.devices.used}
              <span className="text-sm text-white/60"> / {usage.devices.limit}</span>
            </p>
          </div>
          <div className="rounded-lg border border-purple-500/30 bg-indigo-950/60 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">Memory storage</p>
            <p className="text-white text-lg font-semibold">
              {usage.memoryStorage.used}
              <span className="text-sm text-white/60"> / {usage.memoryStorage.limit}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Invoices */}
      <section className="rounded-xl border border-purple-500/30 bg-indigo-950/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Billing history</h3>
          <button className="text-xs text-white/70 underline underline-offset-4 hover:text-white">
            Download all invoices
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-white/80">
            <thead className="text-xs uppercase tracking-wide text-white/50 border-b border-purple-500/30">
              <tr>
                <th className="py-2 pr-4">Invoice</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-purple-500/10 last:border-0">
                  <td className="py-2 pr-4 font-mono text-white">{invoice.id}</td>
                  <td className="py-2 pr-4 text-white/80">{invoice.date}</td>
                  <td className="py-2 pr-4 text-white">{invoice.amount}</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Plan management */}
      <section className="rounded-xl border border-red-500/30 bg-red-950/30 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-red-200">Plan management</h3>
        <p className="text-sm text-red-100/80">
          You can downgrade to the free Developer plan at any time. Your current billing period
          will remain active until the end of the cycle.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              // TODO: Call API to downgrade
              // eslint-disable-next-line no-alert
              if (confirm("Are you sure you want to downgrade to the Developer plan?")) {
                console.warn("Downgrading plan to Developer");
              }
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-red-400/60 text-red-100 text-sm font-medium hover:bg-red-900/40 transition-all"
          >
            Downgrade to Developer
          </button>
          <button
            type="button"
            onClick={() => {
              // TODO: Call API to cancel subscription
              // eslint-disable-next-line no-alert
              if (
                confirm(
                  "Are you sure you want to cancel your subscription? Your access will remain until the end of the current billing period."
                )
              ) {
                console.warn("Cancelling subscription");
              }
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600/80 text-white text-sm font-medium hover:bg-red-600 transition-all"
          >
            Cancel subscription
          </button>
        </div>
      </section>
    </div>
  );
}

