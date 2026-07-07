"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Phone, ArrowRight, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { sendOtp, verifyOtp, googleAuth } from "@/lib/api";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

const OTP_LEN = 6;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/profile";
  const { login, isAuthenticated, ready } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LEN).fill(""));
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (ready && isAuthenticated) router.replace(redirect);
  }, [ready, isAuthenticated, redirect, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const validPhone = /^[6-9]\d{9}$/.test(phone);

  const doSend = async () => {
    if (!validPhone) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        toast.success(res.message || "OTP sent!");
        if (res.otp) toast(`Dev OTP: ${res.otp}`, { icon: "🔑", duration: 6000 });
        setStep("otp");
        setResendIn(30);
        setTimeout(() => boxes.current[0]?.focus(), 100);
      } else {
        toast.error(res.message || "Couldn't send OTP");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onOtpChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < OTP_LEN - 1) boxes.current[i + 1]?.focus();
  };

  const onOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) boxes.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (text) {
      e.preventDefault();
      const next = Array(OTP_LEN).fill("");
      text.split("").forEach((c, idx) => (next[idx] = c));
      setOtp(next);
      boxes.current[Math.min(text.length, OTP_LEN - 1)]?.focus();
    }
  };

  const doVerify = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LEN) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(phone, code);
      if (res.success && res.token) {
        login(res.token, res.user ?? { id: phone, phone, name: "" });
        toast.success("Welcome to Kuddl! 🎉");
        router.replace(redirect);
      } else {
        toast.error(res.message || "Invalid or expired OTP");
      }
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const doGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const g = result.user;
      const parts = (g.displayName || "").trim().split(" ");
      const res = await googleAuth({
        googleId: g.uid,
        email: g.email || "",
        name: g.displayName || "",
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        profilePicture: g.photoURL || "",
      });
      if (res.success && res.token) {
        const u = res.user;
        const phoneRaw = (u?.phone as string) || "";
        login(res.token, {
          id: u?.id || g.uid,
          email: u?.email || g.email || "",
          first_name: u?.first_name || parts[0] || "",
          name: u?.name || g.displayName || "",
          phone: phoneRaw.startsWith("g:") ? "" : phoneRaw,
          profile_image_url: u?.profile_image_url || g.photoURL || "",
        });
        toast.success("Welcome to Kuddl! 🎉");
        router.replace(redirect);
      } else {
        toast.error(res.message || "Google sign-in failed");
      }
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        toast.error("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <section className="grid min-h-screen place-items-center bg-sand-50 px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-[2rem] border border-sand-200 bg-white p-8 kuddl-shadow-lg"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.svg" alt="Kuddl" className="mx-auto h-10 w-auto" />

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="mt-6 text-center text-2xl font-black text-kuddl-ink">
                Welcome to Kuddl
              </h1>
              <p className="mt-2 text-center text-sm text-sand-600">
                Sign in or create your account with your mobile number.
              </p>

              <label className="mt-7 block text-sm font-bold text-kuddl-ink">
                Mobile number
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-sand-200 px-3 focus-within:border-primary-400">
                <Phone className="h-5 w-5 text-sand-500" />
                <span className="font-bold text-sand-600">+91</span>
                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  onKeyDown={(e) => e.key === "Enter" && doSend()}
                  inputMode="numeric"
                  placeholder="98765 43210"
                  className="w-full bg-transparent py-3 text-base font-semibold tracking-wide outline-none"
                />
              </div>

              <button
                onClick={doSend}
                disabled={loading || !validPhone}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 py-3.5 text-base font-extrabold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Send OTP <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="mt-6 text-center text-2xl font-black text-kuddl-ink">
                Verify your number
              </h1>
              <p className="mt-2 text-center text-sm text-sand-600">
                We sent a 6-digit code to{" "}
                <span className="font-bold text-kuddl-ink">+91 {phone}</span>
              </p>

              <div className="mt-7 flex justify-center gap-2" onPaste={onPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      boxes.current[i] = el;
                    }}
                    value={d}
                    onChange={(e) => onOtpChange(i, e.target.value)}
                    onKeyDown={(e) => onOtpKey(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-12 w-11 rounded-xl border-2 border-sand-200 text-center text-xl font-black text-kuddl-ink outline-none focus:border-primary-400"
                  />
                ))}
              </div>

              <button
                onClick={doVerify}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-secondary-500 py-3.5 text-base font-extrabold text-white transition-colors hover:bg-secondary-600 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Verify & continue"
                )}
              </button>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  onClick={() => setStep("phone")}
                  className="inline-flex items-center gap-1 font-bold text-sand-600 hover:text-kuddl-ink"
                >
                  <ArrowLeft className="h-4 w-4" /> Change number
                </button>
                <button
                  onClick={doSend}
                  disabled={resendIn > 0}
                  className="font-bold text-primary-600 disabled:text-sand-400"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-sand-200" />
          <span className="text-xs font-bold text-sand-400">OR</span>
          <div className="h-px flex-1 bg-sand-200" />
        </div>

        <button
          onClick={doGoogle}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-sand-200 bg-white py-3 text-sm font-extrabold text-kuddl-ink transition-colors hover:bg-sand-50 disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <GoogleGlyph />
              Continue with Google
            </>
          )}
        </button>

        <p className="mt-7 flex items-center justify-center gap-1.5 text-center text-xs text-sand-500">
          <ShieldCheck className="h-3.5 w-3.5 text-secondary-500" />
          Your details are safe & secure with Kuddl
        </p>
      </motion.div>
    </section>
  );
}

function GoogleGlyph() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
