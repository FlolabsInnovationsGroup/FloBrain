export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "workflow" | "memory" | "system" | "billing";
}

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Workflow completed",
    message: "Sentiment Analysis workflow finished successfully",
    timestamp: "2 min ago",
    read: false,
    type: "workflow",
  },
  {
    id: "2",
    title: "Memory threshold",
    message: "Memory usage is at 85% of your plan limit",
    timestamp: "1 hour ago",
    read: false,
    type: "memory",
  },
  {
    id: "3",
    title: "System update",
    message: "FloBrain v1.0.5 is now available",
    timestamp: "3 hours ago",
    read: true,
    type: "system",
  },
  {
    id: "4",
    title: "Payment received",
    message: "Your Pro plan renewal was successful",
    timestamp: "Yesterday",
    read: true,
    type: "billing",
  },
];
