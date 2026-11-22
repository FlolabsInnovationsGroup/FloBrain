import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EmptyState } from "./EmptyState";
import { Database } from "lucide-react";

describe("EmptyState Component", () => {
  it("should render without crashing", () => {
    const { container } = render(
      <EmptyState icon={Database} title="No data" description="No data available" />
    );
    expect(container).toBeDefined();
  });

  it("should display title and description", () => {
    const { getByText } = render(
      <EmptyState icon={Database} title="No Data Found" description="There is no data to display" />
    );

    expect(getByText("No Data Found")).toBeDefined();
    expect(getByText("There is no data to display")).toBeDefined();
  });

  it("should render action button when provided", () => {
    const mockAction = vi.fn();
    const { getByText } = render(
      <EmptyState
        icon={Database}
        title="No data"
        description="No data available"
        action={{ label: "Add Data", onClick: mockAction }}
      />
    );

    const button = getByText("Add Data");
    expect(button).toBeDefined();
  });

  it("should call action onClick when button is clicked", () => {
    const mockAction = vi.fn();
    const { getByText } = render(
      <EmptyState
        icon={Database}
        title="No data"
        description="No data available"
        action={{ label: "Add Data", onClick: mockAction }}
      />
    );

    const button = getByText("Add Data");
    fireEvent.click(button);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it("should not render action button when not provided", () => {
    const { queryByRole } = render(
      <EmptyState icon={Database} title="No data" description="No data available" />
    );

    const button = queryByRole("button");
    expect(button).toBeNull();
  });
});
