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
    <div className="space-y-6">
      <section className="fb-profile-card rounded-2xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
              className="fb-profile-btn-primary inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Change plan
            </Link>
            <Link
              href="/payment"
              className="fb-profile-btn-secondary inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Update payment
            </Link>
          </div>
        </div>
      </section>

      <section className="fb-profile-card rounded-2xl p-6">
        <h3 className="fb-profile-title mb-4 text-lg font-semibold">Usage</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ["API calls", usage.apiCalls],
              ["Devices", usage.devices],
              ["Memory storage", usage.memoryStorage],
            ] as const
          ).map(([label, data]) => (
            <div
              key={label}
              className="rounded-xl border px-4 py-4"
              style={{
                background: "var(--fb-profile-field-bg)",
                borderColor: "var(--fb-profile-field-border)",
              }}
            >
              <p className="fb-profile-label mb-1 text-xs uppercase tracking-wide">
                {label}
              </p>
              <p className="fb-profile-title text-lg font-semibold">
                {data.used}
                <span className="fb-profile-label text-sm font-normal"> / {data.limit}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="fb-profile-card rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="fb-profile-title text-lg font-semibold">Billing history</h3>
          <button
            type="button"
            className="fb-profile-label text-xs underline underline-offset-4 hover:opacity-80"
          >
            Download all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="fb-profile-label border-b text-xs uppercase tracking-wide" style={{ borderColor: "var(--fb-profile-divider)" }}>
                <th className="py-2 pr-4">Invoice</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b last:border-0"
                  style={{ borderColor: "var(--fb-profile-divider)" }}
                >
                  <td className="fb-profile-title py-3 pr-4 font-mono">{invoice.id}</td>
                  <td className="fb-profile-body py-3 pr-4">{invoice.date}</td>
                  <td className="fb-profile-title py-3 pr-4">{invoice.amount}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="rounded-2xl border p-6"
        style={{
          background: "var(--fb-profile-danger-bg)",
          borderColor: "var(--fb-profile-danger-border)",
        }}
      >
        <h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--fb-profile-danger)" }}>
          Plan management
        </h3>
        <p className="fb-profile-body mb-4 text-sm">
          You can downgrade to the free Personal plan at any time. Your current billing period
          remains active until the end of the cycle.
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
