import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import BillingSettings from "./index";

describe("BillingSettings Component", () => {
  it("should render Billing heading", () => {
    render(<BillingSettings />);

    const heading = screen.getByRole("heading", { name: /billing/i });
    expect(heading).toBeDefined();
  });

  it("should display current plan details", () => {
    render(<BillingSettings />);

    expect(screen.getByText(/current plan/i)).toBeDefined();
    expect(screen.getByText(/pro/i)).toBeDefined();
    expect(screen.getByText(/\$ 49/i)).toBeDefined();
    expect(screen.getByText(/\/month/i)).toBeDefined();
    expect(screen.getByText(/active/i)).toBeDefined();
  });

  it("should have links to change plan and update payment method", () => {
    render(<BillingSettings />);

    const changePlanLink = screen.getByRole("link", { name: /change plan/i });
    const paymentMethodLink = screen.getByRole("link", {
      name: /update payment method/i,
    });

    expect(changePlanLink.getAttribute("href")).toBe("/pricing");
    expect(paymentMethodLink.getAttribute("href")).toBe("/payment");
  });

  it("should display usage summary cards", () => {
    render(<BillingSettings />);

    expect(screen.getByText(/api calls/i)).toBeDefined();
    expect(screen.getByText(/devices/i)).toBeDefined();
    expect(screen.getByText(/memory storage/i)).toBeDefined();
  });

  it("should render billing history table with invoices", () => {
    render(<BillingSettings />);

    expect(
      screen.getByRole("heading", { name: /billing history/i })
    ).toBeDefined();

    expect(screen.getByText(/inv-2026-001/i)).toBeDefined();
    expect(screen.getByText(/inv-2026-002/i)).toBeDefined();
  });
});

