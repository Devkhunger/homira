"use client";
import Link from "next/link";
import { useState } from "react";
import { useFormAction } from "@/components/ui/useFormAction";
import { loginWithEmail, register, requestOtp, verifyOtp, type AuthState } from "@/app/(store)/account/auth-actions";

function GoogleButton({ next, enabled }: { next: string; enabled: boolean }) {
  if (!enabled) return null;
  return (
    <>
      <a href={`/api/auth/google?next=${encodeURIComponent(next)}`} className="btn-outline w-full normal-case tracking-normal">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12Z" />
        </svg>
        Continue with Google
      </a>
      <div className="my-5 flex items-center gap-3 text-xs uppercase text-neutral-400"><span className="h-px flex-1 bg-neutral-200" />or<span className="h-px flex-1 bg-neutral-200" /></div>
    </>
  );
}

export function LoginForm({ next, googleEnabled, initialError }: { next: string; googleEnabled: boolean; initialError?: string }) {
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [emailState, emailAction, emailPending] = useFormAction<AuthState>(loginWithEmail, { error: initialError });
  const [otpState, otpAction, otpPending] = useFormAction<AuthState>(requestOtp, {});
  const [verifyState, verifyAction, verifyPending] = useFormAction<AuthState>(verifyOtp, {});
  const onOtpStep = otpState.step === "otp";

  return (
    <div>
      <GoogleButton next={next} enabled={googleEnabled} />
      <div className="mb-6 grid grid-cols-2 border border-neutral-300 text-sm">
        {(["email", "phone"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`py-2.5 font-semibold ${tab === t ? "bg-ink text-white" : ""}`}>
            {t === "email" ? "Email & Password" : "Mobile OTP"}
          </button>
        ))}
      </div>

      {tab === "email" ? (
        <form onSubmit={emailAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="input" /></div>
          <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="input" /></div>
          {emailState.error && <p className="text-sm text-sale">{emailState.error}</p>}
          <button disabled={emailPending} className="btn-dark w-full">{emailPending ? "Signing in…" : "Sign in"}</button>
        </form>
      ) : !onOtpStep ? (
        <form onSubmit={otpAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="phone">Mobile number</label>
            <div className="flex"><span className="border border-r-0 border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm">+91</span><input id="phone" name="phone" inputMode="numeric" maxLength={10} required className="input" /></div>
          </div>
          {otpState.error && <p className="text-sm text-sale">{otpState.error}</p>}
          <button disabled={otpPending} className="btn-dark w-full">{otpPending ? "Sending…" : "Send OTP"}</button>
        </form>
      ) : (
        <form onSubmit={verifyAction} className="space-y-4">
          <input type="hidden" name="phone" value={otpState.phone} />
          <input type="hidden" name="next" value={next} />
          {otpState.info && <p className="bg-green-50 p-3 text-sm text-green-800">{otpState.info}</p>}
          <div><label className="label" htmlFor="code">Enter 6-digit OTP</label><input id="code" name="code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" required className="input tracking-[0.5em]" /></div>
          <div><label className="label" htmlFor="oname">Your name (new customers)</label><input id="oname" name="name" className="input" autoComplete="name" /></div>
          {verifyState.error && <p className="text-sm text-sale">{verifyState.error}</p>}
          <button disabled={verifyPending} className="btn-dark w-full">{verifyPending ? "Verifying…" : "Verify & continue"}</button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        New here? <Link href={`/account/register?next=${encodeURIComponent(next)}`} className="font-semibold link-underline">Create an account</Link>
      </p>
    </div>
  );
}

export function RegisterForm({ next, googleEnabled }: { next: string; googleEnabled: boolean }) {
  const [state, action, pending] = useFormAction<AuthState>(register, {});
  return (
    <div>
      <GoogleButton next={next} enabled={googleEnabled} />
      <form onSubmit={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="name" className="input" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="input" /></div>
        <div><label className="label" htmlFor="phone">Mobile (optional)</label><input id="phone" name="phone" inputMode="numeric" maxLength={10} autoComplete="tel" className="input" /></div>
        <div><label className="label" htmlFor="password">Password (min 8 characters)</label><input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" className="input" /></div>
        {state.error && <p className="text-sm text-sale">{state.error}</p>}
        <button disabled={pending} className="btn-dark w-full">{pending ? "Creating account…" : "Create account"}</button>
      </form>
      <p className="mt-6 text-center text-sm">
        Already have an account? <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="font-semibold link-underline">Sign in</Link>
      </p>
    </div>
  );
}
