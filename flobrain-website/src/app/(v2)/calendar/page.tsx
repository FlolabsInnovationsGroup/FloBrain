
import type { Metadata } from "next";
import { CalendarOverview } from "./components/CalendarOverview";

export const metadata: Metadata = {
  title: "Calendar",
};

export default function MyCalendarPage() {
  return <CalendarOverview />;
}
