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
      <h2 className="text-3xl font-bold text-[var(--fb-brain-heading)]">Billing</h2>

      {/* Current Plan */}
      <section className="fb-brain-surface space-y-3 rounded-xl border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--fb-brain-text-subtle)]">Current plan</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-[var(--fb-brain-heading)]">
                {planDefinition?.name ?? CURRENT_PLAN_NAME}
              </span>
              <span className="text-[var(--fb-brain-text-muted)]">
                {price}
                <span className="text-sm text-[var(--fb-brain-text-subtle)]">{period}</span>
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--fb-brain-success)]">Active</p>
            <p className="mt-1 text-xs text-[var(--fb-brain-text-subtle)]">Renews on Mar 15, 2026</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 bg-[var(--fb-brain-btn)]"
            >
              Change plan
            </Link>
            <Link
              href="/payment"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--fb-brain-surface-border)] px-4 py-2 text-sm font-medium text-[var(--fb-brain-text-muted)] transition-colors hover:bg-[var(--fb-brain-surface-bg)]"
            >
              Update payment method
            </Link>
          </div>
        </div>
      </section>

      {/* Usage Summary */}
      <section className="fb-brain-surface rounded-xl border p-6">
        <h3 className="mb-4 text-lg font-semibold text-[var(--fb-brain-heading)]">Usage</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="fb-brain-surface rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--fb-brain-text-subtle)] mb-1">API calls</p>
            <p className="text-[var(--fb-brain-heading)] text-lg font-semibold">
              {usage.apiCalls.used}
              <span className="text-sm text-[var(--fb-brain-text-subtle)]"> / {usage.apiCalls.limit}</span>
            </p>
          </div>
          <div className="fb-brain-surface rounded-lg border p-4">
            <p className="mb-1 text-xs uppercase tracking-wide text-[var(--fb-brain-text-subtle)]">Devices</p>
            <p className="text-[var(--fb-brain-heading)] text-lg font-semibold">
              {usage.devices.used}
              <span className="text-sm text-[var(--fb-brain-text-subtle)]"> / {usage.devices.limit}</span>
            </p>
          </div>
          <div className="fb-brain-surface rounded-lg border p-4">
            <p className="mb-1 text-xs uppercase tracking-wide text-[var(--fb-brain-text-subtle)]">Memory storage</p>
            <p className="text-[var(--fb-brain-heading)] text-lg font-semibold">
              {usage.memoryStorage.used}
              <span className="text-sm text-[var(--fb-brain-text-subtle)]"> / {usage.memoryStorage.limit}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Invoices */}
      <section className="fb-brain-surface rounded-xl border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--fb-brain-heading)]">Billing history</h3>
          <button className="text-xs text-[var(--fb-brain-text-muted)] underline underline-offset-4 hover:text-[var(--fb-brain-heading)]">
            Download all invoices
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-[var(--fb-brain-text-muted)]">
            <thead className="border-b border-[var(--fb-brain-surface-border)] text-xs uppercase tracking-wide text-[var(--fb-brain-text-subtle)]">
              <tr>
                <th className="py-2 pr-4">Invoice</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-[var(--fb-brain-surface-border)] last:border-0">
                  <td className="py-2 pr-4 font-mono text-[var(--fb-brain-heading)]">{invoice.id}</td>
                  <td className="py-2 pr-4">{invoice.date}</td>
                  <td className="py-2 pr-4 text-[var(--fb-brain-heading)]">{invoice.amount}</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-[var(--fb-brain-success)]">
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
      <section className="fb-brain-surface space-y-4 rounded-xl border p-6" style={{ borderColor: 'var(--fb-brain-error)' }}>
        <h3 className="text-lg font-semibold text-[var(--fb-brain-error)]">Plan management</h3>
        <p className="text-sm text-[var(--fb-brain-text-muted)]">
          You can downgrade to the free Developer plan at any time. Your current billing period
          will remain active until the end of the cycle.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              // TODO: Call API to downgrade
              if (confirm("Are you sure you want to downgrade to the Developer plan?")) {
                console.warn("Downgrading plan to Developer");
              }
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:opacity-90"
            style={{ borderColor: 'var(--fb-brain-error)', color: 'var(--fb-brain-error)' }}
          >
            Downgrade to Developer
          </button>
          <button
            type="button"
            onClick={() => {
              // TODO: Call API to cancel subscription
              if (
                confirm(
                  "Are you sure you want to cancel your subscription? Your access will remain until the end of the current billing period."
                )
              ) {
                console.warn("Cancelling subscription");
              }
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all"
            style={{ background: 'var(--fb-brain-error)' }}
          >
            Cancel subscription
          </button>
        </div>
      </section>
    </div>
  );
}
