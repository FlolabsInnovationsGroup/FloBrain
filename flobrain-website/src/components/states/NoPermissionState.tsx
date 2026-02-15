import { ShieldOff } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface NoPermissionStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const NoPermissionState = ({ 
  title = "No Permission", 
  description = "You don't have permission to access this resource. Contact your administrator if you believe this is an error.",
  action
}: NoPermissionStateProps) => {
  return (
    <EmptyState
      icon={ShieldOff}
      title={title}
      description={description}
      action={action}
    />
  );
};
