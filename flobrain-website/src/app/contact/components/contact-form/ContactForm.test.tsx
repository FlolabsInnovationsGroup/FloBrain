import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ContactForm } from ".";

describe("ContactForm Component", () => {
  it("should render the Get in Touch heading", () => {
    render(<ContactForm />);
    expect(screen.getByText("Get in Touch")).toBeDefined();
  });

  it("should render all form fields", () => {
    render(<ContactForm />);
    expect(screen.getByPlaceholderText("Full Name")).toBeDefined();
    expect(screen.getByPlaceholderText("Work Email")).toBeDefined();
    expect(screen.getByPlaceholderText("Company Type")).toBeDefined();
    expect(screen.getByPlaceholderText("Message")).toBeDefined();
  });

  it("should render the Send Message button", () => {
    render(<ContactForm />);
    expect(screen.getByRole("button", { name: /Send Message/i })).toBeDefined();
  });

  it("should update input value on change", () => {
    render(<ContactForm />);
    const nameInput = screen.getByPlaceholderText("Full Name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { name: "fullName", value: "Jane Smith" } });
    expect(nameInput.value).toBe("Jane Smith");
  });

  it("should show Sending... state while submitting", async () => {
    render(<ContactForm />);
    const form = screen.getByRole("button", { name: /Send Message/i }).closest("form")!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText(/Sending/i)).toBeDefined();
    });
  });

  it("should render privacy policy disclaimer", () => {
    render(<ContactForm />);
    expect(screen.getByText(/Privacy Policy and Terms of Service/i)).toBeDefined();
  });
});
