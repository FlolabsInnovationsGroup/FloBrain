import LeadershipDashboard from "@/components/v2/LeadershipDashboard";
import LeadershipPreviewHeader from "@/components/v2/LeadershipPreviewHeader";

export default function LeadershipPreview() {
  return (
    <div className="fb-v2-preview">
      <LeadershipPreviewHeader />
      <LeadershipDashboard />
    </div>
  );
}
