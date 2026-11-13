import { fireEvent, render, screen, within } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateTeamPage from "@/app/(v2)/leadership/teams/new/page";
import CreateTeamForm from "./CreateTeamForm";
import { PageStructure } from "../PageStructure";

function field(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Create Team" }));
}

function membersInput() {
  return screen.getByRole("combobox", { name: "Add members" });
}

function renderRoute() {
  return render(
    <PageStructure>
      <CreateTeamPage />
    </PageStructure>
  );
}

beforeEach(() => {
  vi.mocked(usePathname).mockReturnValue("/leadership/teams/new");
});

describe("Create Team page in the V2 shell", () => {
  it("renders every form field inside the shared content slot", () => {
    renderRoute();

    const content = document.querySelector<HTMLElement>("[data-slot='content']")!;
    expect(content.querySelector(".fb-v2-create-team form")).toBeInTheDocument();
    expect(
      within(content).getByRole("heading", { level: 2, name: "Create Team" })
    ).toBeInTheDocument();
    for (const label of [
      "Team name",
      "Department",
      "Description - optional",
      "Assign leadership",
      "Assign co-lead",
    ]) {
      expect(within(content).getByLabelText(label)).toBeInTheDocument();
    }
    expect(membersInput()).toBeInTheDocument();
    expect(within(content).getByRole("button", { name: "Create Team" })).toHaveAttribute(
      "type",
      "submit"
    );
  });

  it("does not duplicate the shell's containers, heading or create links", () => {
    renderRoute();

    expect(document.querySelectorAll("main")).toHaveLength(0);
    expect(document.querySelectorAll(".fb-v2-content")).toHaveLength(1);
    expect(document.querySelector(".fb-v2-preview")).not.toBeInTheDocument();
    expect(document.querySelector(".fb-v2-lead-panel")).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Create Team");
    expect(screen.getAllByRole("link", { name: "Create Team" })).toHaveLength(1);
    expect(screen.getAllByRole("navigation", { name: "Leadership" })).toHaveLength(1);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  });

  it("keeps Leadership, Teams and Create Team selected without search", () => {
    renderRoute();

    expect(screen.getByRole("link", { name: "LEADERSHIP" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "TEAMS" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "DASHBOARD" })).not.toHaveAttribute("aria-current");
    const createTeam = screen.getByRole("link", { name: "Create Team" });
    expect(createTeam).toHaveAttribute("href", "/leadership/teams/new");
    expect(createTeam).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Create Project" })).not.toHaveAttribute(
      "aria-current"
    );
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("returns to the Leadership Dashboard on Cancel", () => {
    renderRoute();

    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/leadership/dashboard"
    );
  });
});

describe("Create Team form", () => {
  it("renders exactly one chevron inside each dropdown", () => {
    render(<CreateTeamForm />);
    for (const label of ["Assign leadership", "Assign co-lead"]) {
      const wrapper = screen.getByLabelText(label).parentElement!;
      expect(wrapper).toHaveClass("fb-v2-select");
      expect(wrapper.querySelectorAll("svg")).toHaveLength(1);
    }
    const members = membersInput().parentElement!;
    expect(members.querySelectorAll("svg")).toHaveLength(1);
  });

  it("lists every mock member as a lead and co-lead option", () => {
    render(<CreateTeamForm />);
    for (const label of ["Assign leadership", "Assign co-lead"]) {
      const options = within(screen.getByLabelText(label)).getAllByRole("option");
      expect(options).toHaveLength(15);
      expect(options[0]).toHaveValue("");
    }
  });

  it("shows required errors, focuses the first one and clears errors on edit", () => {
    render(<CreateTeamForm />);
    submit();
    expect(screen.getByText("Enter a team name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a department.")).toBeInTheDocument();
    expect(screen.getByText("Choose a team lead.")).toBeInTheDocument();
    expect(screen.getByLabelText("Team name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Team name")).toHaveAttribute(
      "aria-describedby",
      "team-name-error"
    );
    expect(screen.getByLabelText("Team name")).toHaveFocus();
    expect(screen.getByLabelText("Description - optional")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByLabelText("Assign co-lead")).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    field("Team name", "   ");
    expect(screen.queryByText("Enter a team name.")).not.toBeInTheDocument();
    submit();
    expect(screen.getByText("Enter a team name.")).toBeInTheDocument();
  });

  it("focuses the first invalid field when earlier fields are valid", () => {
    render(<CreateTeamForm />);
    field("Team name", "Wearables");
    submit();
    expect(screen.queryByText("Enter a team name.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Department")).toHaveFocus();
  });

  it("rejects the same person as lead and co-lead", () => {
    render(<CreateTeamForm />);
    field("Team name", "Wearables");
    field("Department", "Engineering");
    field("Assign leadership", "9");
    field("Assign co-lead", "9");
    submit();
    expect(screen.getByText(/co-lead must be a different person/)).toBeInTheDocument();
    expect(screen.getByLabelText("Assign co-lead")).toHaveFocus();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("searches, filters by letter, selects and removes members", () => {
    render(<CreateTeamForm />);
    fireEvent.change(membersInput(), { target: { value: "mar" } });
    const listbox = screen.getByRole("listbox", { name: "Add members" });
    expect(
      within(listbox)
        .getAllByRole("option")
        .map((option) => option.textContent)
    ).toEqual(["Amara Okafor", "Maria Lopez", "Zoe Martin"]);

    fireEvent.click(within(listbox).getByRole("option", { name: "Maria Lopez" }));
    fireEvent.keyDown(membersInput(), { key: "ArrowDown" });
    fireEvent.keyDown(membersInput(), { key: "ArrowDown" });
    fireEvent.keyDown(membersInput(), { key: "Enter" });
    const selected = screen.getByRole("list", { name: "Selected members" });
    expect(within(selected).getByText("Maria Lopez")).toBeInTheDocument();
    expect(within(selected).getByText("Zoe Martin")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove Maria Lopez" }));
    expect(within(selected).queryByText("Maria Lopez")).not.toBeInTheDocument();

    fireEvent.change(membersInput(), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Z" }));
    expect(screen.getByRole("button", { name: "Z" })).toHaveAttribute("aria-pressed", "true");
    expect(within(screen.getByRole("listbox")).getAllByRole("option")).toHaveLength(1);
    expect(
      within(screen.getByRole("listbox")).getByRole("option", { name: "Zoe Martin" })
    ).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(membersInput(), { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters by first letter only, combines with search and toggles off", () => {
    render(<CreateTeamForm />);
    const letter = (name: string) => screen.getByRole("button", { name });
    const optionNames = () =>
      within(screen.getByRole("listbox"))
        .queryAllByRole("option")
        .map((option) => option.textContent);

    // "M" matches first names starting with M, not every name containing an m.
    fireEvent.click(letter("M"));
    expect(optionNames()).toEqual(["Maria Lopez"]);

    // Switching letters replaces the filter.
    fireEvent.click(letter("S"));
    expect(letter("M")).toHaveAttribute("aria-pressed", "false");
    expect(optionNames()).toEqual(["Sam Taylor"]);

    // Letter and search narrow together.
    fireEvent.change(membersInput(), { target: { value: "lewis" } });
    expect(optionNames()).toEqual([]);
    expect(screen.getByText("No members match.")).toBeInTheDocument();

    // Clicking the active letter clears it.
    fireEvent.click(letter("S"));
    expect(letter("S")).toHaveAttribute("aria-pressed", "false");
    expect(optionNames()).toEqual(["Ben Lewis"]);
  });

  it("closes a list opened from a letter with Escape or by leaving the field", () => {
    render(<CreateTeamForm />);
    const letterM = screen.getByRole("button", { name: "M" });

    letterM.focus();
    fireEvent.click(letterM);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(letterM, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.click(letterM);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.blur(letterM, { relatedTarget: screen.getByLabelText("Team name") });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    // Moving between the letters and the search box keeps it open.
    fireEvent.click(letterM);
    fireEvent.blur(letterM, { relatedTarget: membersInput() });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("does not submit the form when Enter picks a member", () => {
    render(<CreateTeamForm />);
    fireEvent.change(membersInput(), { target: { value: "Ben" } });
    fireEvent.keyDown(membersInput(), { key: "Enter" });
    expect(
      within(screen.getByRole("list", { name: "Selected members" })).getByText("Ben Lewis")
    ).toBeInTheDocument();
    expect(screen.queryByText("Enter a team name.")).not.toBeInTheDocument();
  });

  it("lets a lead also be added as a member", () => {
    render(<CreateTeamForm />);
    field("Assign leadership", "9");
    fireEvent.change(membersInput(), { target: { value: "Maria" } });
    expect(
      within(screen.getByRole("listbox")).getByRole("option", { name: "Maria Lopez" })
    ).toBeInTheDocument();
  });

  it("shows demo feedback without claiming the team was saved", () => {
    render(<CreateTeamForm />);
    field("Team name", "Wearables");
    field("Department", "Engineering");
    field("Assign leadership", "9");
    submit();
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent('Demo only: "Wearables" passed validation but was not saved.');
    expect(status.textContent).not.toMatch(/successfully|has been saved|was saved/i);

    field("Team name", "Wearables 2");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("does not call any backend when submitted", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<CreateTeamForm />);
    field("Team name", "Wearables");
    field("Department", "Engineering");
    field("Assign leadership", "9");
    submit();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
