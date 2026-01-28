import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Footer from ".";

describe("Footer Component", () => {
    
    it("should render the logo and tagline", () => {
        render(<Footer />);
        const logo = screen.getByRole("heading", { level: 2, name: /CAIPO/i });
        expect(logo).toBeDefined();
        expect(screen.getByText("Building the future.")).toBeDefined();
    });

    it("should render the copyright notice with the current year", () => {
        render(<Footer />);
        const currentYear = new Date().getFullYear();
        expect(screen.getByText(`© ${currentYear} Caipo. All rights reserved.`)).toBeDefined();
    });

    it("should render within a semantic footer tag", () => {
        render(<Footer />);
        expect(screen.getByRole("contentinfo")).toBeDefined();
    });
});