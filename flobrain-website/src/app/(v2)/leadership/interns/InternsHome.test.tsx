import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InternsHome } from "./interns-home";
import { mockInterns } from "./mockData";

describe("InternsHome", () => {
  it("renders a card for each mock intern", () => {
    render(<InternsHome />);

    mockInterns.forEach((intern) => {
      expect(screen.getByRole("heading", { name: intern.name })).toBeInTheDocument();
      expect(screen.getByText(intern.designation)).toBeInTheDocument();
      expect(screen.getByText(intern.specialization)).toBeInTheDocument();
    });
  });
});
