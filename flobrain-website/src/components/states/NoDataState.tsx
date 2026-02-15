import { Database } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface NoDataStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const NoDataState = ({ 
  title = "No Data Available", 
  description = "There's nothing to display here yet. Start by adding some data.",
  action
}: NoDataStateProps) => {
  return (
    <EmptyState
      icon={Database}
      title={title}
      description={description}
      action={action}
    />
  );
};
