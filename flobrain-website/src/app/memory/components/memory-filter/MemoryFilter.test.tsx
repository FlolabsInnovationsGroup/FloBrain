import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryFilter } from "./index";

describe("MemoryFilter Component", () => {
  const defaultProps = {
    filtersOpen: false,
    searchQuery: "",
    dateRange: "All Time",
    memoryType: "All",
    minRelevance: 0.0,
    onSearchQueryChange: vi.fn(),
    onDateRangeChange: vi.fn(),
    onMemoryTypeChange: vi.fn(),
    onMinRelevanceChange: vi.fn(),
    onToggleFilters: vi.fn(),
    onClearFilters: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the search input", () => {
    render(<MemoryFilter {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText("Search memories by content or keyword...");
    expect(searchInput).toBeDefined();
  });

  it("should call onSearchQueryChange when typing in search input", () => {
    render(<MemoryFilter {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText("Search memories by content or keyword...");
    fireEvent.change(searchInput, { target: { value: "test query" } });
    expect(defaultProps.onSearchQueryChange).toHaveBeenCalledWith("test query");
  });

  it("should render the Advanced filters control", () => {
    render(<MemoryFilter {...defaultProps} />);
    const filterButton = screen.getByRole("button", { name: "Advanced filters" });
    expect(filterButton).toBeDefined();
  });

  it("should call onToggleFilters when clicking Advanced filters", () => {
    render(<MemoryFilter {...defaultProps} />);
    const filterButton = screen.getByRole("button", { name: "Advanced filters" });
    fireEvent.click(filterButton);
    expect(defaultProps.onToggleFilters).toHaveBeenCalledTimes(1);
  });

  it("should not render filter modal when filtersOpen is false", () => {
    render(<MemoryFilter {...defaultProps} />);
    const modalTitle = screen.queryByText("Advanced Filters");
    expect(modalTitle).toBeNull();
  });

  it("should render filter modal when filtersOpen is true", () => {
    render(<MemoryFilter {...defaultProps} filtersOpen={true} />);
    const modalTitle = screen.getByText("Advanced Filters");
    expect(modalTitle).toBeDefined();
  });

  it("should call onDateRangeChange when clicking a date range option", () => {
    render(<MemoryFilter {...defaultProps} filtersOpen={true} />);
    const lastWeekButton = screen.getByText("Last Week");
    fireEvent.click(lastWeekButton);
    expect(defaultProps.onDateRangeChange).toHaveBeenCalledWith("Last Week");
  });

  it("should call onMemoryTypeChange when clicking a memory type option", () => {
    render(<MemoryFilter {...defaultProps} filtersOpen={true} />);
    const chunksButton = screen.getByText("Chunks");
    fireEvent.click(chunksButton);
    expect(defaultProps.onMemoryTypeChange).toHaveBeenCalledWith("Chunks");
  });

  it("should call onMinRelevanceChange when adjusting the slider", () => {
    render(<MemoryFilter {...defaultProps} filtersOpen={true} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "0.5" } });
    expect(defaultProps.onMinRelevanceChange).toHaveBeenCalledWith(0.5);
  });

  it("should call onClearFilters when clicking Clear All Filters button", () => {
    render(<MemoryFilter {...defaultProps} filtersOpen={true} />);
    const clearButton = screen.getByText("Clear All Filters");
    fireEvent.click(clearButton);
    expect(defaultProps.onClearFilters).toHaveBeenCalledTimes(1);
  });

  it("should display the current minRelevance value", () => {
    render(<MemoryFilter {...defaultProps} filtersOpen={true} minRelevance={0.7} />);
    const relevanceLabel = screen.getByText(/Min Relevance:/);
    expect(relevanceLabel.textContent).toContain("0.7");
  });

  it("should call onToggleFilters when clicking the close button", () => {
    render(<MemoryFilter {...defaultProps} filtersOpen={true} />);
    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);
    expect(defaultProps.onToggleFilters).toHaveBeenCalled();
  });

  it("should highlight the active date range option", () => {
    render(<MemoryFilter {...defaultProps} filtersOpen={true} dateRange="Last Month" />);
    const lastMonthButton = screen.getByText("Last Month");
    expect(lastMonthButton.className).toContain("fb-memory-option-active");
  });

  it("should highlight the active memory type option", () => {
    render(<MemoryFilter {...defaultProps} filtersOpen={true} memoryType="Summaries" />);
    const summariesInModal = screen
      .getAllByText("Summaries")
      .find((el) => el.tagName === "BUTTON");
    expect(summariesInModal).toBeTruthy();
    expect(summariesInModal!.className).toContain("fb-memory-option-active");
  });
});
