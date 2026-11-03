import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import CreateTeamForm from "./CreateTeamForm";
import CreateTeamPage from "@/app/teams/new/page";

function field(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Create Team" }));
}

function membersInput() {
  return screen.getByRole("combobox", { name: "Add members" });
}

describe("Create Team page", () => {
  it("renders the Figma fields inside the V2 preview shell", () => {
    const { container } = render(<CreateTeamPage />);
    expect(container.firstChild).toHaveClass("fb-v2-preview");
    expect(screen.getByRole("heading", { name: "Create Team" })).toBeInTheDocument();
    for (const label of [
      "Team name",
      "Department",
      "Description - optional",
      "Assign leadership",
      "Assign co-lead",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(membersInput()).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/leadership-preview"
    );
  });

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

  it("shows required errors, focuses the first one and clears errors on edit", () => {
    render(<CreateTeamForm />);
    submit();
    expect(screen.getByText("Enter a team name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a department.")).toBeInTheDocument();
    expect(screen.getByText("Choose a team lead.")).toBeInTheDocument();
    expect(screen.getByLabelText("Team name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Team name")).toHaveFocus();
    expect(screen.getByLabelText("Description - optional")).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    field("Team name", "   ");
    expect(screen.queryByText("Enter a team name.")).not.toBeInTheDocument();
    submit();
    expect(screen.getByText("Enter a team name.")).toBeInTheDocument();
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
  });
});
