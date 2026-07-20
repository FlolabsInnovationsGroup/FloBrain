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
      limit: planDefinition?.calls ?? "500K calls/mo",
    },
    devices: {
      used: "8",
      limit: planDefinition?.devices ?? "50",
    },
    memoryStorage: {
      used: "12 GB",
      limit: planDefinition?.memory ?? "50GB storage",
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
      <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="fb-profile-label text-sm">Current plan</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="fb-profile-title text-xl font-semibold">
                {planDefinition?.name ?? CURRENT_PLAN_NAME}
              </span>
              <span className="fb-profile-title">
                {price}
                <span className="fb-profile-label text-sm">{period}</span>
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Active
            </p>
            <p className="fb-profile-label mt-1 text-xs">Renews on Mar 15, 2026</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              Change plan
            </Link>
            <Link
              href="/payment"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
            >
              Update payment
            </Link>
          </div>
        </div>
      </section>

      {/* Usage Summary */}
      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Usage</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-[#0B0719]/50 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">API calls</p>
            <p className="text-white text-lg font-semibold">
              {usage.apiCalls.used}
              <span className="text-sm text-white/60"> / {usage.apiCalls.limit}</span>
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0B0719]/50 p-4">
            <p className="mb-1 text-xs uppercase tracking-wide text-white/50">Devices</p>
            <p className="text-white text-lg font-semibold">
              {usage.devices.used}
              <span className="text-sm text-white/60"> / {usage.devices.limit}</span>
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0B0719]/50 p-4">
            <p className="mb-1 text-xs uppercase tracking-wide text-white/50">Memory storage</p>
            <p className="text-white text-lg font-semibold">
              {usage.memoryStorage.used}
              <span className="text-sm text-white/60"> / {usage.memoryStorage.limit}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Invoices */}
      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Billing history</h3>
          <button className="text-xs text-white/70 underline underline-offset-4 hover:text-white">
            Download all invoices
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-white/80">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/50">
              <tr>
                <th className="py-2 pr-4">Invoice</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-white/10 last:border-0">
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
      <section className="space-y-4 rounded-xl border border-red-500/30 bg-red-950/20 p-6">
        <h3 className="text-lg font-semibold text-red-200">Plan management</h3>
        <p className="text-sm text-red-100/80">
          You can downgrade to the free Developer plan at any time. Your current billing period
          will remain active until the end of the cycle.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to downgrade to the Personal plan?")) {
                console.warn("Downgrading plan");
              }
            }}
            className="fb-profile-btn-danger rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            Downgrade to Personal
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Cancel your subscription? Access remains until the end of the billing period."
                )
              ) {
                console.warn("Cancelling subscription");
              }
            }}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors"
            style={{ background: "var(--fb-profile-danger)" }}
          >
            Cancel subscription
          </button>
        </div>
      </section>
    </div>
  );
}
