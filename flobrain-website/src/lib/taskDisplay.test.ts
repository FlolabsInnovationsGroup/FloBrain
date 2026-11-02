import { describe, expect, it } from "vitest";

import {
  formatAssigneeList,
  formatAssigneeSummary,
  formatTaskListDate,
  taskStatusLabel,
} from "./taskDisplay";

describe("taskDisplay", () => {
  it("formats list dates like the Figma table", () => {
    expect(formatTaskListDate("2026-08-28")).toBe("Aug. 28 2026");
    expect(formatTaskListDate("2026-09-04")).toBe("Sept. 4 2026");
  });

  it("formats assignee lists and summaries", () => {
    expect(formatAssigneeList([])).toBe("—");
    expect(
      formatAssigneeList([
        { id: "1", name: "Claudia L." },
        { id: "2", name: "Serina Z." },
      ])
    ).toBe("Claudia L., Serina Z.");
    expect(formatAssigneeSummary([{ id: "1", name: "Ceren G." }])).toBe("Ceren G.");
    expect(
      formatAssigneeSummary([
        { id: "1", name: "Ceren G." },
        { id: "2", name: "A" },
        { id: "3", name: "B" },
      ])
    ).toBe("Ceren G. + 2");
  });

  it("maps status labels consistently with Create Task", () => {
    expect(taskStatusLabel("active")).toBe("Active");
    expect(taskStatusLabel("pending")).toBe("Pending");
  });
});
