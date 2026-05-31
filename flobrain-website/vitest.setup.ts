import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

vi.mock("@/components/motion", () => import("@/test/motion-mock"));

afterEach(() => {
  cleanup();
});
