import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryNodeSidePanel } from "./memory-node-side-panel";
import { api } from "@/lib/api";
import type { ApiResult, MemoryNodeDetailApi } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    getMemoryNode: vi.fn(),
    updateMemoryNode: vi.fn(),
    deleteMemoryNode: vi.fn(),
  },
}));

const mockGetMemoryNode = vi.mocked(api.getMemoryNode);
const mockUpdateMemoryNode = vi.mocked(api.updateMemoryNode);
const mockDeleteMemoryNode = vi.mocked(api.deleteMemoryNode);

const NODE = { id: "node-1", name: "Tea title", memory_type: "summary", relevance: 0.5 };
const CONTENT = "Synthetic favourite tea is oolong-7731";

function detail(overrides: Partial<MemoryNodeDetailApi> = {}): ApiResult<MemoryNodeDetailApi> {
  return {
    data: {
      ...NODE,
      val: 0.5,
      group: "summary",
      content: CONTENT,
      is_excluded: false,
      index_status: "indexed",
      connections: { outgoing: [], incoming: [], total: 0 },
      ...overrides,
    },
    status: 200,
  };
}

function renderPanel(onOpenChange = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const remove = vi.spyOn(queryClient, "removeQueries");
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryNodeSidePanel open onOpenChange={onOpenChange} node={NODE} />
    </QueryClientProvider>
  );
  return { invalidate, remove, onOpenChange };
}

function expectGraphAndNodeInvalidated(invalidate: ReturnType<typeof vi.spyOn>) {
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ["memory", "graph"] });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ["memory", "node", "node-1"] });
}

describe("MemoryNodeSidePanel actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMemoryNode.mockResolvedValue(detail());
    mockUpdateMemoryNode.mockResolvedValue(detail());
    mockDeleteMemoryNode.mockResolvedValue({ status: 204 });
  });

  it("shows the memory content, not the title, under Raw Text", async () => {
    renderPanel();

    expect(await screen.findByText(CONTENT)).toBeDefined();
    expect(screen.queryByText("Tea title")).toBeNull();
  });

  it("Edit Context sends PATCH content and refreshes graph and node", async () => {
    const { invalidate } = renderPanel();
    await screen.findByText(CONTENT);

    fireEvent.click(screen.getByRole("button", { name: /edit context/i }));
    const editor = screen.getByRole("textbox", { name: /memory content/i });
    expect((editor as HTMLTextAreaElement).value).toBe(CONTENT);
    fireEvent.change(editor, { target: { value: "Synthetic favourite tea is sencha-1188" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() =>
      expect(mockUpdateMemoryNode).toHaveBeenCalledWith("node-1", {
        content: "Synthetic favourite tea is sencha-1188",
      })
    );
    await waitFor(() => expectGraphAndNodeInvalidated(invalidate));
  });

  it("Exclude from Future sends PATCH is_excluded and toggles back", async () => {
    const { invalidate } = renderPanel();
    await screen.findByText(CONTENT);

    fireEvent.click(screen.getByRole("button", { name: /exclude from future/i }));

    await waitFor(() =>
      expect(mockUpdateMemoryNode).toHaveBeenCalledWith("node-1", { is_excluded: true })
    );
    await waitFor(() => expectGraphAndNodeInvalidated(invalidate));
  });

  it("offers Include in Future for an excluded memory", async () => {
    mockGetMemoryNode.mockResolvedValue(detail({ is_excluded: true }));
    renderPanel();

    fireEvent.click(await screen.findByRole("button", { name: /include in future/i }));

    await waitFor(() =>
      expect(mockUpdateMemoryNode).toHaveBeenCalledWith("node-1", { is_excluded: false })
    );
  });

  it("Delete Node asks for confirmation before sending DELETE", async () => {
    const { invalidate, remove, onOpenChange } = renderPanel();
    await screen.findByText(CONTENT);

    fireEvent.click(screen.getByRole("button", { name: /delete node/i }));
    expect(mockDeleteMemoryNode).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("button", { name: /confirm delete/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /delete node/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm delete/i }));

    await waitFor(() => expect(mockDeleteMemoryNode).toHaveBeenCalledWith("node-1"));
    // The deleted node's detail is dropped (not refetched into a 404); the graph refreshes
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["memory", "graph"] }));
    expect(remove).toHaveBeenCalledWith({ queryKey: ["memory", "node", "node-1"] });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows an error and keeps the panel open when an action fails", async () => {
    mockUpdateMemoryNode.mockResolvedValue({ error: "Couldn't connect to FloBrain", status: 0 });
    const { onOpenChange } = renderPanel();
    await screen.findByText(CONTENT);

    fireEvent.click(screen.getByRole("button", { name: /exclude from future/i }));

    expect(await screen.findByRole("alert")).toBeDefined();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
