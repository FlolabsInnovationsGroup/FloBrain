export default function PageHeader({ title }: { title: string }) {
  return (
    <div className="fb-v2-page-header">
      <h1 className="text-sm font-semibold uppercase tracking-wide">{title}</h1>
    </div>
  );
}
