export default function SettingsPage() {
  return (
    <div className="p-10 text-white bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold border-b border-slate-700 pb-4">Account Settings</h1>
      <div className="mt-8 space-y-6 max-w-md">
        <div className="bg-slate-800 p-4 rounded-lg shadow">
          <p className="text-sm text-slate-400 uppercase tracking-wider">Name</p>
          <p className="text-xl font-medium">[Mock Name]</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg shadow">
          <p className="text-sm text-slate-400 uppercase tracking-wider">Email</p>
          <p className="text-xl font-medium">[john@example.com]</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg shadow">
          <p className="text-sm text-slate-400 uppercase tracking-wider">Current Plan</p>
          <p className="text-xl font-medium bg-blue-600 inline-block px-2 py-1 rounded text-sm mt-1">Pro Tier</p>
        </div>
      </div>
    </div>
  );
}
