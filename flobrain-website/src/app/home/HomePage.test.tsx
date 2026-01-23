import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HomePage } from ".";

vi.mock("./constants", () => ({
    features: [
        { id: 1, title: "Integration Feature 1", description: "Desc 1", icon: <span />, color: "#000" },
        { id: 2, title: "Integration Feature 2", description: "Desc 2", icon: <span />, color: "#fff" }
    ],
    applications: [
        { id: 1, title: "Integration App 1", description: "App Desc 1", tags: ["Tag1"], icon: <span /> },
        { id: 2, title: "Integration App 2", description: "App Desc 2", tags: ["Tag2"], icon: <span /> }
    ],
    possibilities: ["Possibility 1"]
}));

vi.mock("next/image", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: (props: any) => <img {...props} />
}));

vi.mock("../../../../../assets/images/brain.svg", () => ({
    default: "brain.svg"
}));

describe("HomePage Integration", () => {
    
    it("should render the main page sections and static headings", () => {
        render(<HomePage />);
        expect(screen.getByText("Powerful Features, Simple Integration")).toBeDefined();
        expect(screen.getByText("Every Where, All At Once")).toBeDefined();
        expect(screen.getByText("THE INTELLIGENCE LAYER")).toBeDefined(); 
        expect(screen.getByText("One Brain, Infinite Possibilities")).toBeDefined();
    });

    it("should map and render all features from constants", () => {
        render(<HomePage />);
        expect(screen.getByText("Integration Feature 1")).toBeDefined();
        expect(screen.getByText("Integration Feature 2")).toBeDefined();
        
        const features = screen.getAllByText(/Integration Feature/);
        expect(features).toHaveLength(2);
    });

    it("should map and render all applications from constants", () => {
        render(<HomePage />);
        expect(screen.getByText("Integration App 1")).toBeDefined();
        expect(screen.getByText("Integration App 2")).toBeDefined();

        const apps = screen.getAllByText(/Integration App/);
        expect(apps).toHaveLength(2);
    });

    it("should render the footer banner with its content", () => {
        render(<HomePage />);
        expect(screen.getByText(/Whether you're using a wearable/i)).toBeDefined();
    });
});