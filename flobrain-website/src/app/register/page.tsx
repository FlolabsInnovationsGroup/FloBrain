import "./register.css";
import { RegisterCard } from "./register-card";

export default function Register() {
  const router = useRouter();
  const { register: doRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const result = await doRegister({ name, email, password });
      if (result.ok) {
        router.push("/dashboard");
        return;
      }
      setError(result.error ?? "Registration failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="register-page relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: "linear-gradient(160deg, #1a0a2e 0%, #0d0618 60%, #070014 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div className="register-glow" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <h1 className="register-hero-title text-center text-[28px] font-bold text-[#EC4899] sm:text-[32px]">
          Create Account
        </h1>

        {/* Card */}
        <div
          className="w-full rounded-2xl p-5 sm:p-6 flex flex-col gap-5"
          style={{
            background: "rgba(22, 10, 40, 0.85)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            boxShadow: "0 0 40px rgba(124, 58, 237, 0.12), 0 4px 24px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/80">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition-all disabled:opacity-60"
                  style={{
                    background: "#e8e3f0",
                    border: "1px solid rgba(139,92,246,0.15)",
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/80">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="johndoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition-all disabled:opacity-60"
                  style={{
                    background: "#e8e3f0",
                    border: "1px solid rgba(139,92,246,0.15)",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/80">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 pl-10 pr-12 rounded-xl text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition-all disabled:opacity-60"
                  style={{
                    background: "#e8e3f0",
                    border: "1px solid rgba(139,92,246,0.15)",
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/80">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm-password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 pl-10 pr-12 rounded-xl text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition-all disabled:opacity-60"
                  style={{
                    background: "#e8e3f0",
                    border: "1px solid rgba(139,92,246,0.15)",
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-white text-[15px] flex items-center justify-center gap-2 mt-1 transition-opacity disabled:opacity-60 cursor-pointer"
              style={{
                background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)",
                boxShadow: "0 0 24px rgba(168, 85, 247, 0.5), 0 4px 16px rgba(124, 58, 237, 0.4)",
              }}
            >
              {loading ? "Creating account…" : "Create Account"}
              {!loading && <span className="text-base">→</span>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="w-full h-12 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-3 transition-colors hover:opacity-90"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full h-12 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-3 transition-colors hover:opacity-90"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Apple size={20} className="text-white" />
              Continue with Apple
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold transition-colors"
              style={{ color: "#a855f7" }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
