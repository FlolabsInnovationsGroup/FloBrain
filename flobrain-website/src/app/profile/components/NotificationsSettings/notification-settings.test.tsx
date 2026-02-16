import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NotificationsSettings from "./index";

describe("NotificationsSettings Component", () => {
  it("should render Notifications heading", () => {
    render(<NotificationsSettings />);

    const heading = screen.getByRole("heading", { name: /notifications/i });
    expect(heading).toBeDefined();
  });

  it("should render all notification settings labels", () => {
    render(<NotificationsSettings />);

    expect(screen.getByText(/alerts/i)).toBeDefined();
    expect(screen.getByText(/setting 2/i)).toBeDefined();
    expect(screen.getByText(/setting 3/i)).toBeDefined();
  });

  it("should render select elements for each setting", () => {
    render(<NotificationsSettings />);

    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });

  it("should allow changing notification option for a setting", () => {
    render(<NotificationsSettings />);

    const selects = screen.getAllByRole("combobox");
    const alertsSelect = selects[0] as HTMLSelectElement;

    expect(alertsSelect.value).toBe("push");

    fireEvent.change(alertsSelect, { target: { value: "email" } });

    expect(alertsSelect.value).toBe("email");
  });

  it("should support all notification options in dropdown", () => {
    render(<NotificationsSettings />);

    const selects = screen.getAllByRole("combobox");
    const firstSelect = selects[0] as HTMLSelectElement;
    const options = Array.from(firstSelect.querySelectorAll("option")).map(
      (o) => o.value
    );

    expect(options).toEqual(["push", "email", "off"]);
  });
});

