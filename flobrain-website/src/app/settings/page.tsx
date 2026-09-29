export default function SettingsPage() {
  return (
    <main className="fb-auth-bg w-full min-h-screen px-6 py-10">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-10">
          <p className="fb-auth-label text-sm font-medium">Workspace Settings</p>

          <h1 className="fb-auth-heading mt-2 text-3xl font-bold md:text-5xl">Account Settings</h1>

          <p className="fb-auth-muted mt-4 max-w-2xl">
            Manage your FloBrain profile, workspace preferences, and subscription details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="fb-auth-card rounded-2xl p-6">
            <p className="fb-auth-label text-sm uppercase tracking-wide">Name</p>
            <h2 className="fb-auth-heading mt-2 text-xl font-semibold">Mock Name</h2>
            <p className="fb-auth-muted mt-2">Your account display name.</p>
          </div>

          <div className="fb-auth-card rounded-2xl p-6">
            <p className="fb-auth-label text-sm uppercase tracking-wide">Email</p>
            <h2 className="fb-auth-heading mt-2 text-xl font-semibold">john@example.com</h2>
            <p className="fb-auth-muted mt-2">The email connected to your FloBrain account.</p>
          </div>

          <div className="fb-auth-card rounded-2xl p-6">
            <p className="fb-auth-label text-sm uppercase tracking-wide">Current Plan</p>
            <h2 className="fb-auth-heading mt-2 text-xl font-semibold">Pro Tier</h2>
            <p className="fb-auth-muted mt-2">Your active FloBrain subscription plan.</p>
          </div>
        </div>

        <div className="fb-auth-card mt-8 rounded-2xl p-6">
          <h2 className="fb-auth-heading text-2xl font-bold">Preferences</h2>
          <p className="fb-auth-muted mt-2">
            Additional workspace and account controls will be added here.
          </p>
        </div>
      </section>
    </main>
  );
}
