import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Navbar from ".";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => <img alt="" {...props} data-testid="mock-hero-image" />
}));


vi.mock("../../../../assets/images/flolabs-logo.svg", () => ({
    default: "logo-mock"
}));

describe("Navbar Component", () => {
    
    it("should render the logo and brand name", () => {
        render(<Navbar />);
        expect(screen.getByAltText("FloLabs' logo")).toBeDefined();
        expect(screen.getByText("FLOBRAIN")).toBeDefined();
    });

    it("should render desktop navigation links", () => {
        render(<Navbar />);
        const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
        const brainLink = screen.getByRole("link", { name: "Brain" });
        
        expect(dashboardLink).toBeDefined();
        expect(brainLink).toBeDefined();
        expect(dashboardLink.getAttribute("href")).toBe("/dashboard");
    });

    it("should toggle mobile menu when hamburger button is clicked", () => {
        render(<Navbar />);
        
        const toggleButton = screen.getByRole("button");
        const dashboardLinksBefore = screen.getAllByText("Dashboard");
        expect(dashboardLinksBefore).toHaveLength(1); 

        fireEvent.click(toggleButton);

        const dashboardLinksAfter = screen.getAllByText("Dashboard");
        expect(dashboardLinksAfter).toHaveLength(2);
    });

    it("should close mobile menu when a link is clicked", () => {
        render(<Navbar />);
        
        const toggleButton = screen.getByRole("button");
        fireEvent.click(toggleButton);

        const mobileLinks = screen.getAllByText("Dashboard");
        expect(mobileLinks).toHaveLength(2);

        const mobileDashboardLink = mobileLinks[1]; 
        fireEvent.click(mobileDashboardLink);

        const finalLinks = screen.getAllByText("Dashboard");
        expect(finalLinks).toHaveLength(1);
    });
});