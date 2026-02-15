import { WifiOff } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface NotConnectedStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const NotConnectedState = ({ 
  title = "Not Connected", 
  description = "Unable to establish connection. Please check your network and try again.",
  action
}: NotConnectedStateProps) => {
  return (
    <EmptyState
      icon={WifiOff}
      title={title}
      description={description}
      action={action}
    />
  );
};
