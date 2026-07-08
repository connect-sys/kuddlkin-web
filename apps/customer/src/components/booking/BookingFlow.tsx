"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  MapPin,
  PartyPopper,
  ShieldCheck,
} from "lucide-react";
import {
  getServiceById,
  createBooking,
  bookCamp,
  addCustomerChild,
  getCustomerChildren,
  type BookingChild,
  type CreateBookingResult,
} from "@/lib/api";

/** A child row in the form; childId is set when it came from the saved profile. */
type FormChild = BookingChild & { childId?: string };

/** Best-effort age from a stored date_of_birth. */
function ageFromDob(dob?: string): number | undefined {
  if (!dob) return undefined;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return undefined;
  const age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
  return age >= 0 && age < 25 ? age : undefined;
}
import { serviceImage } from "@/lib/images";
import { formatPrice, priceLabel, cn } from "@/lib/utils";
import { getModule } from "@/lib/modules";
import { useAuth } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/Button";

const STEPS = ["Schedule", "Details", "Review"] as const;

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const hh = String(Math.floor((total % 1440) / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function fmtDate(d?: string): string {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BookingFlow() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user, isAuthenticated, ready } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  // Bookings require a signed-in parent (camps endpoint mandates a token, and we
  // sync the children into the parent's profile).
  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace(`/login?redirect=/booking/${serviceId}`);
    }
  }, [ready, isAuthenticated, router, serviceId]);

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => getServiceById(serviceId),
    enabled: !!serviceId,
  });

  const [step, setStep] = useState(0);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [qty, setQty] = useState(1);
  const [children, setChildren] = useState<FormChild[]>([
    { name: "", age: "" },
  ]);

  // Saved children from the parent's profile — so returning parents don't retype.
  const { data: savedChildren } = useQuery({
    queryKey: ["customer-children"],
    queryFn: getCustomerChildren,
    enabled: isAuthenticated,
  });
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    if (prefilled || !savedChildren?.length) return;
    const first = savedChildren[0];
    setChildren([
      {
        name: first.name || "",
        age: String(first.age ?? ageFromDob(first.date_of_birth) ?? ""),
        gender: (first.gender as string) || "",
        childId: first.id,
      },
    ]);
    setQty(1);
    setPrefilled(true);
  }, [savedChildren, prefilled]);

  /** Fill row `i` from a saved child (used by the quick-pick chips). */
  const useSavedChild = (i: number, id: string) => {
    const sc = savedChildren?.find((c) => c.id === id);
    if (!sc) return;
    setChildren((prev) =>
      prev.map((c, idx) =>
        idx === i
          ? {
              name: sc.name || "",
              age: String(sc.age ?? ageFromDob(sc.date_of_birth) ?? ""),
              gender: (sc.gender as string) || "",
              childId: sc.id,
            }
          : c
      )
    );
  };
  const [parent, setParent] = useState({
    fullName: user?.name || user?.first_name || "",
    email: user?.email || "",
    phone: user?.phone || user?.phoneNumber || "",
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateBookingResult | null>(null);

  // Camps run on a fixed schedule — we don't let the parent pick a date/time.
  const isCamp =
    service?.item_type === "camp" ||
    service?.price_type === "camp" ||
    service?.priceType === "camp";

  // Both duration_minutes and the legacy `duration` field are stored in minutes.
  const duration = service?.duration_minutes || service?.duration || 60;
  const endTime = useMemo(() => {
    if (isCamp && service?.schedule_end_time) return service.schedule_end_time;
    return addMinutes(time, duration);
  }, [isCamp, service, time, duration]);
  const total = (service?.price || 0) * Math.max(1, qty);
  const mod =
    getModule(service?.category_module) ?? getModule(service?.category_name);
  const today = new Date().toISOString().split("T")[0];

  // Prefill the camp's own schedule once the service loads.
  useEffect(() => {
    if (isCamp && service) {
      if (service.start_date) setDate(service.start_date.split("T")[0]);
      if (service.schedule_start_time) setTime(service.schedule_start_time);
    }
  }, [isCamp, service]);

  const setQtyAndChildren = (n: number) => {
    const next = Math.max(1, Math.min(10, n));
    setQty(next);
    setChildren((prev) => {
      const arr = [...prev];
      while (arr.length < next) arr.push({ name: "", age: "" });
      return arr.slice(0, next);
    });
  };

  const updateChild = (i: number, key: keyof BookingChild, value: string) => {
    setChildren((prev) =>
      prev.map((c, idx) =>
        idx === i
          ? // Editing the name detaches it from the saved profile, so it gets saved.
            { ...c, [key]: value, ...(key === "name" ? { childId: undefined } : {}) }
          : c
      )
    );
  };

  const validStep0 = isCamp ? true : !!date && !!time;
  const validStep1 =
    /^[6-9]\d{9}$/.test(parent.phone.replace(/\D/g, "")) &&
    parent.fullName.trim().length > 1 &&
    children.every((c) => c.name.trim() && String(c.age).trim());

  const providerId = service?.provider_id || service?.provider?.id;

  const submit = async () => {
    if (!service) return;
    setSubmitting(true);
    try {
      let res: CreateBookingResult;

      if (isCamp) {
        // Camps are enrolled per child through the dedicated camp endpoint.
        const start = (service.start_date || date).split("T")[0];
        const end = (service.end_date || service.start_date || date).split("T")[0];
        let last: CreateBookingResult | null = null;
        for (const c of children) {
          last = await bookCamp({
            camp_id: service.id,
            child_name: c.name.trim(),
            child_age: Number(c.age) || 0,
            selected_start_date: start,
            selected_end_date: end,
            special_requirements: notes.trim(),
            payment_status: "pending",
          });
          if (!last?.success) break;
        }
        res = last ?? { success: false, message: "Booking failed" };
      } else {
        if (!providerId) {
          toast.error("This experience can't be booked right now.");
          setSubmitting(false);
          return;
        }
        res = await createBooking({
          serviceId: service.id,
          providerId,
          selectedDate: date,
          startTime: time,
          endTime,
          parentDetails: {
            fullName: parent.fullName.trim(),
            email: parent.email.trim(),
            phone: parent.phone.replace(/\D/g, ""),
          },
          children: children.map((c) => ({
            name: c.name.trim(),
            age: Number(c.age) || 0,
            gender: c.gender || "unknown",
          })),
          specialInstructions: notes.trim(),
          totalAmount: total,
        });
      }

      if (res.success) {
        // Save only NEW children to the parent's profile (skip ones already saved).
        await Promise.allSettled(
          children
            .filter((c) => !c.childId && c.name.trim())
            .map((c) =>
              addCustomerChild({
                name: c.name.trim(),
                age: Number(c.age) || 0,
                gender: (c.gender || "").toLowerCase(),
              })
            )
        );
        qc.invalidateQueries({ queryKey: ["customer-bookings"] });
        qc.invalidateQueries({ queryKey: ["customer-children"] });
        setResult(res);
        toast.success("Booking confirmed! 🎉");
      } else {
        toast.error(res.message || "Booking failed. Please try again.");
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Booking failed. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-28">
        <div className="skeleton h-8 w-1/2 rounded-full" />
        <div className="skeleton mt-6 h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4 text-center">
        <div>
          <p className="text-6xl">🧸</p>
          <h1 className="mt-4 text-2xl font-black text-kuddl-ink">
            Experience not found
          </h1>
          <ButtonLink href="/services" className="mt-6">
            Browse experiences
          </ButtonLink>
        </div>
      </div>
    );
  }

  /* ----- Success screen ----- */
  if (result) {
    return (
      <div className="grid min-h-screen place-items-center bg-sand-50 px-4 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-[2rem] border border-sand-200 bg-white p-8 text-center kuddl-shadow-lg"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary-100">
            <PartyPopper className="h-8 w-8 text-secondary-600" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-kuddl-ink">
            You’re all booked!
          </h1>
          <p className="mt-2 text-sand-600">
            Your booking for <b>{service.name}</b> is confirmed. We’ve shared the
            details with you.
          </p>

          {/* Entry QR — provider scans this at the venue to pull up the booking */}
          {result.booking?.invoice_qr_url && (
            <div className="mt-5 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.booking.invoice_qr_url}
                alt="Booking QR code"
                className="mx-auto h-44 w-44 rounded-xl bg-white p-2"
              />
              <p className="mt-3 text-sm font-bold text-primary-700">
                Show this QR at the venue
              </p>
              <p className="text-xs text-sand-600">
                The partner scans it to see your child, parent & payment details.
              </p>
            </div>
          )}

          <div className="mt-5 space-y-2 rounded-2xl bg-sand-50 p-4 text-left text-sm">
            <Row
              label="Booking ID"
              value={
                result.bookingId ||
                result.booking?.booking_id ||
                result.booking?.id
              }
            />
            {result.booking?.invoice_id && (
              <Row label="Invoice" value={result.booking.invoice_id} />
            )}
            <Row label="When" value={isCamp ? fmtDate(date) : `${date} · ${time}`} />
            <Row label="Children" value={String(qty)} />
            <Row label="Total" value={formatPrice(total)} />
            <Row
              label="Status"
              value={(result.booking?.status || "confirmed").replace(/_/g, " ")}
            />
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <ButtonLink href="/profile">Go to my bookings</ButtonLink>
            <ButtonLink href="/services" variant="outline">
              Explore more
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    );
  }

  const img = serviceImage(service);

  return (
    <div className="bg-sand-50 pb-28 pt-24 lg:pt-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href={`/services/${service.id}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-sand-600 hover:text-primary-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back to experience
        </Link>

        {/* Stepper */}
        <div className="mt-5 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-extrabold transition-colors",
                  i <= step
                    ? "bg-primary-500 text-white"
                    : "bg-white text-sand-500"
                )}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25 text-xs">
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    i < step ? "bg-primary-500" : "bg-sand-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Step panel */}
          <div className="rounded-3xl border border-sand-200 bg-white p-6 kuddl-shadow">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="s0"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {isCamp ? (
                    <>
                      <h2 className="text-xl font-black text-kuddl-ink">
                        Camp schedule
                      </h2>
                      <p className="mt-1 text-sm text-sand-600">
                        This camp runs on a fixed schedule set by the partner.
                      </p>
                      <div className="mt-5 space-y-2.5 rounded-2xl bg-discover-soft p-4 text-sm">
                        <Row label="Starts" value={fmtDate(service.start_date)} />
                        <Row label="Ends" value={fmtDate(service.end_date)} />
                        {service.schedule_days && (
                          <Row label="Days" value={service.schedule_days} />
                        )}
                        <Row
                          label="Daily timing"
                          value={
                            time
                              ? `${time}${
                                  service.schedule_end_time
                                    ? ` – ${service.schedule_end_time}`
                                    : ""
                                }`
                              : "As scheduled"
                          }
                        />
                        {service.duration_days ? (
                          <Row
                            label="Duration"
                            value={`${service.duration_days} days`}
                          />
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-black text-kuddl-ink">
                        When works for you?
                      </h2>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Date"
                          icon={<Calendar className="h-4 w-4" />}
                        >
                          <input
                            type="date"
                            min={today}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-transparent py-2 font-semibold outline-none"
                          />
                        </Field>
                        <Field
                          label="Start time"
                          icon={<Clock className="h-4 w-4" />}
                        >
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-transparent py-2 font-semibold outline-none"
                          />
                        </Field>
                      </div>

                      <p className="mt-4 text-sm text-sand-600">
                        Approx. duration{" "}
                        <b>
                          {duration >= 60
                            ? `${Math.round((duration / 60) * 10) / 10} hr`
                            : `${duration} min`}
                        </b>{" "}
                        · ends around <b>{endTime}</b>
                      </p>
                    </>
                  )}

                  <h3 className="mt-7 text-sm font-black text-kuddl-ink">
                    How many children?
                  </h3>
                  <div className="mt-2 flex items-center gap-4">
                    <Stepper value={qty} onChange={setQtyAndChildren} />
                    <span className="text-sm text-sand-600">
                      {service.age_group_min != null ||
                      service.age_group_max != null
                        ? `Ages ${service.age_group_min ?? 0}–${
                            service.age_group_max ?? 12
                          }`
                        : "All ages welcome"}
                    </span>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-xl font-black text-kuddl-ink">
                    Who’s coming along?
                  </h2>

                  {savedChildren && savedChildren.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-sand-600">
                        Your children — tap to add
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {savedChildren.map((sc) => {
                          const used = children.some((c) => c.childId === sc.id);
                          const scAge = sc.age ?? ageFromDob(sc.date_of_birth);
                          return (
                            <button
                              key={sc.id}
                              type="button"
                              disabled={used}
                              onClick={() => {
                                const emptyIdx = children.findIndex(
                                  (c) => !c.name.trim()
                                );
                                if (emptyIdx >= 0) {
                                  useSavedChild(emptyIdx, sc.id);
                                } else if (children.length < 10) {
                                  setChildren((prev) => [
                                    ...prev,
                                    {
                                      name: sc.name || "",
                                      age: String(scAge ?? ""),
                                      gender: (sc.gender as string) || "",
                                      childId: sc.id,
                                    },
                                  ]);
                                  setQty((q) => Math.min(10, q + 1));
                                }
                              }}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors",
                                used
                                  ? "border-sand-200 bg-sand-100 text-sand-400"
                                  : "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100"
                              )}
                            >
                              {sc.name}
                              {scAge != null ? ` · ${scAge}` : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 space-y-3">
                    {children.map((c, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_5rem] gap-3 rounded-2xl bg-sand-50 p-3"
                      >
                        <input
                          value={c.name}
                          onChange={(e) => updateChild(i, "name", e.target.value)}
                          placeholder={`Child ${i + 1} name`}
                          className="rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-primary-400"
                        />
                        <input
                          value={String(c.age)}
                          onChange={(e) =>
                            updateChild(
                              i,
                              "age",
                              e.target.value.replace(/\D/g, "").slice(0, 2)
                            )
                          }
                          inputMode="numeric"
                          placeholder="Age"
                          className="rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-primary-400"
                        />
                      </div>
                    ))}
                  </div>

                  <h3 className="mt-6 text-sm font-black text-kuddl-ink">
                    Parent / guardian details
                  </h3>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <input
                      value={parent.fullName}
                      onChange={(e) =>
                        setParent({ ...parent, fullName: e.target.value })
                      }
                      placeholder="Full name"
                      className="rounded-xl border border-sand-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary-400"
                    />
                    <input
                      value={parent.phone}
                      onChange={(e) =>
                        setParent({
                          ...parent,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      inputMode="numeric"
                      placeholder="Mobile number"
                      className="rounded-xl border border-sand-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary-400"
                    />
                    <input
                      value={parent.email}
                      onChange={(e) =>
                        setParent({ ...parent, email: e.target.value })
                      }
                      placeholder="Email (optional)"
                      className="rounded-xl border border-sand-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary-400 sm:col-span-2"
                    />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything we should know? (allergies, special requests…)"
                      rows={3}
                      className="rounded-xl border border-sand-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary-400 sm:col-span-2"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-xl font-black text-kuddl-ink">
                    Review & confirm
                  </h2>
                  <div className="mt-5 space-y-2 rounded-2xl bg-sand-50 p-4 text-sm">
                    <Row label="When" value={`${date} · ${time}–${endTime}`} />
                    <Row
                      label="Children"
                      value={children
                        .map((c) => `${c.name} (${c.age})`)
                        .join(", ")}
                    />
                    <Row label="Parent" value={parent.fullName} />
                    <Row label="Mobile" value={`+91 ${parent.phone}`} />
                    {notes && <Row label="Notes" value={notes} />}
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-xs text-sand-600">
                    <ShieldCheck className="h-4 w-4 text-secondary-500" />
                    By confirming you agree to Kuddl’s terms. Payment is collected
                    securely as per the partner’s policy.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav */}
            <div className="mt-7 flex items-center justify-between gap-3">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-extrabold text-sand-600 transition-colors hover:bg-sand-100 disabled:opacity-0"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>

              {step < 2 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 0 ? !validStep0 : !validStep1}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-500 px-6 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary-500 px-6 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-secondary-600 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Confirm booking</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Summary card */}
          <div className="lg:relative">
            <div className="lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-3xl border border-sand-200 bg-white kuddl-shadow">
                <div className="relative aspect-[16/10] bg-sand-100">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={service.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="grid h-full w-full place-items-center text-6xl"
                      style={{ background: mod?.soft ?? "#f8f5f0" }}
                    >
                      {mod?.emoji ?? "🎨"}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black text-kuddl-ink">
                    {service.name}
                  </h3>
                  {(service.city || service.provider?.city) && (
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-sand-600">
                      <MapPin className="h-3.5 w-3.5" />
                      {service.city || service.provider?.city}
                    </p>
                  )}
                  <div className="mt-4 space-y-1.5 border-t border-sand-100 pt-4 text-sm">
                    <Row
                      label={`${formatPrice(service.price)}${priceLabel(
                        service.priceType || service.price_type
                      )} × ${qty}`}
                      value={formatPrice(total)}
                    />
                    <div className="flex items-center justify-between pt-2 text-base">
                      <span className="font-black text-kuddl-ink">Total</span>
                      <span className="font-black text-primary-700">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-secondary-600">
                    <Users className="h-3.5 w-3.5" /> {qty} child
                    {qty === 1 ? "" : "ren"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----- small helpers ----- */
function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sand-600">{label}</span>
      <span className="text-right font-bold text-kuddl-ink">{value || "—"}</span>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-kuddl-ink">
        <span className="text-primary-500">{icon}</span>
        {label}
      </span>
      <div className="rounded-xl border-2 border-sand-200 px-3 focus-within:border-primary-400">
        {children}
      </div>
    </label>
  );
}

function Stepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border-2 border-sand-200 px-2 py-1.5">
      <button
        onClick={() => onChange(value - 1)}
        className="grid h-8 w-8 place-items-center rounded-full bg-sand-100 text-lg font-black text-kuddl-ink hover:bg-sand-200"
        aria-label="Fewer"
      >
        −
      </button>
      <span className="w-6 text-center text-lg font-black text-kuddl-ink">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="grid h-8 w-8 place-items-center rounded-full bg-primary-500 text-lg font-black text-white hover:bg-primary-600"
        aria-label="More"
      >
        +
      </button>
    </div>
  );
}
