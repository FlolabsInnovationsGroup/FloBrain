export default function SettingsPage() {
  return (
    <main className="w-full min-h-screen px-6 py-10">
      <section className="w-full max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-sm text-purple-300 font-medium">
            Workspace Settings
          </p>

          <h1 className="text-3xl md:text-5xl font-bold text-white mt-2">
            Account Settings
          </h1>

          <p className="text-zinc-400 mt-4 max-w-2xl">
            Manage your FloBrain profile, workspace preferences, and subscription details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-purple-500/20 bg-white/5 p-6">
            <p className="text-sm text-purple-300 uppercase tracking-wide">
              Name
            </p>
            <h2 className="text-xl font-semibold text-white mt-2">
              Mock Name
            </h2>
            <p className="text-zinc-400 mt-2">
              Your account display name.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-white/5 p-6">
            <p className="text-sm text-purple-300 uppercase tracking-wide">
              Email
            </p>
            <h2 className="text-xl font-semibold text-white mt-2">
              john@example.com
            </h2>
            <p className="text-zinc-400 mt-2">
              The email connected to your FloBrain account.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-white/5 p-6">
            <p className="text-sm text-purple-300 uppercase tracking-wide">
              Current Plan
            </p>
            <h2 className="text-xl font-semibold text-white mt-2">
              Pro Tier
            </h2>
            <p className="text-zinc-400 mt-2">
              Your active FloBrain subscription plan.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-purple-500/20 bg-white/5 p-6">
          <h2 className="text-2xl font-bold text-white">
            Preferences
          </h2>

          <p className="text-zinc-400 mt-2">
            Additional workspace and account controls will be added here.
          </p>
        </div>
      </section>
    </main>
  );
}
