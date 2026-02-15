import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import BillingSettings from "./index";

describe("BillingSettings Component", () => {
  it("should render Billing heading", () => {
    render(<BillingSettings />);

    const headings = screen.getAllByRole("heading", { name: /billing/i });
    expect(headings.length).toBeGreaterThanOrEqual(1);
    expect(headings[0]).toHaveTextContent(/billing/i);
  });

  it("should display current plan details", () => {
    render(<BillingSettings />);

    expect(screen.getByText(/current plan/i)).toBeDefined();
    expect(screen.getByText(/pro/i)).toBeDefined();
    expect(screen.getAllByText(/\$ 49/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/\/month/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/active/i).length).toBeGreaterThanOrEqual(1);
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

    expect(screen.getAllByText(/api calls/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/devices/i).length).toBeGreaterThanOrEqual(1);
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

