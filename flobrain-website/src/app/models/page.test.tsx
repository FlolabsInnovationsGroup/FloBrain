import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import ModelRegistryPage from "./page";
import {
  createRegisteredModel,
  deleteRegisteredModel,
  listRegisteredModels,
  updateRegisteredModel,
  type RegisteredModel,
} from "./modelRegistryApi";

vi.mock("./modelRegistryApi", async () => {
  const actual = await vi.importActual<typeof import("./modelRegistryApi")>("./modelRegistryApi");
  return {
    ...actual,
    listRegisteredModels: vi.fn(),
    createRegisteredModel: vi.fn(),
    updateRegisteredModel: vi.fn(),
    deleteRegisteredModel: vi.fn(),
  };
});

const model: RegisteredModel = {
  id: 1,
  name: "GPT-4o",
  provider_name: "OpenAI",
  provider_type: "private" as const,
  supported_input_types: ["text", "image"],
  capabilities: ["chat", "coding"],
  created_at: "2026-08-25T10:00:00Z",
  updated_at: "2026-08-25T10:00:00Z",
};

describe("ModelRegistryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listRegisteredModels).mockResolvedValue([model]);
    vi.mocked(createRegisteredModel).mockResolvedValue(model);
    vi.mocked(updateRegisteredModel).mockResolvedValue(model);
    vi.mocked(deleteRegisteredModel).mockResolvedValue();
  });

  it("lists registered model information", async () => {
    renderWithProviders(<ModelRegistryPage />);

    expect(await screen.findAllByText("GPT-4o")).not.toHaveLength(0);
    expect(screen.getAllByText("OpenAI")).not.toHaveLength(0);
    expect(screen.getAllByText("coding")).not.toHaveLength(0);
    expect(screen.getByRole("heading", { name: "Model Registry" })).toBeInTheDocument();
  });

  it("renders the empty state", async () => {
    vi.mocked(listRegisteredModels).mockResolvedValue([]);
    renderWithProviders(<ModelRegistryPage />);

    expect(await screen.findByText("No models registered")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register the first model/i })).toBeInTheDocument();
  });

  it("renders and retries the API error state", async () => {
    vi.mocked(listRegisteredModels).mockRejectedValue(new Error("offline"));
    renderWithProviders(<ModelRegistryPage />);

    expect(await screen.findByText("Model registry unavailable")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't connect");
    fireEvent.click(screen.getByRole("button", { name: /Try again/i }));
    await waitFor(() => expect(listRegisteredModels).toHaveBeenCalledTimes(2));
  });

  it("validates and creates a registered model", async () => {
    vi.mocked(listRegisteredModels).mockResolvedValue([]);
    renderWithProviders(<ModelRegistryPage />);

    fireEvent.click(await screen.findByRole("button", { name: /Register model/i }));
    expect(screen.queryByLabelText(/multimodal/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Register model/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Model name and provider name are required"
    );

    fireEvent.change(screen.getByLabelText("Model name"), { target: { value: "GPT-4o" } });
    fireEvent.change(screen.getByLabelText("Provider name"), { target: { value: "OpenAI" } });
    fireEvent.click(screen.getByLabelText("text"));
    fireEvent.change(screen.getByLabelText("Capabilities"), { target: { value: "chat, coding" } });
    fireEvent.click(screen.getByRole("button", { name: /Register model/i }));

    await waitFor(() =>
      expect(createRegisteredModel).toHaveBeenCalledWith({
        name: "GPT-4o",
        provider_name: "OpenAI",
        provider_type: "private",
        supported_input_types: ["text"],
        capabilities: ["chat", "coding"],
      })
    );
  });

  it("updates and deletes a registered model", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderWithProviders(<ModelRegistryPage />);

    const editButtons = await screen.findAllByRole("button", { name: "Edit GPT-4o" });
    fireEvent.click(editButtons[0]);
    fireEvent.change(screen.getByLabelText("Capabilities"), {
      target: { value: "chat, coding, classification" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(updateRegisteredModel).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ capabilities: ["chat", "coding", "classification"] })
      )
    );

    const deleteButtons = screen.getAllByRole("button", { name: "Delete GPT-4o" });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => expect(deleteRegisteredModel).toHaveBeenCalledWith(1));
  });
});
