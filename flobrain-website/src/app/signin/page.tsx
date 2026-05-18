import "./signin.css";
import { SignInCard } from "./signin-card";

export default function Login() {
  return (
    <main
      className="signin-page relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: "linear-gradient(160deg, #1a0a2e 0%, #0d0618 60%, #070014 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div className="signin-glow" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <h1 className="signin-hero-title text-center text-[28px] font-bold text-[#EC4899] sm:text-[32px]">
          Welcome Back
        </h1>

        <div className="signin-card-wrap">
          <SignInCard />
        </div>
      </div>
    </main>
  );
}
