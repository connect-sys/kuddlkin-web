"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, QrCode, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { CustomerBooking } from "@/lib/api";
import { resolveImage } from "@/lib/images";
import { formatPrice } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  confirmed: "bg-secondary-100 text-secondary-700",
  completed: "bg-secondary-100 text-secondary-700",
  pending: "bg-bloom-soft text-bloom",
  pending_payment: "bg-bloom-soft text-bloom",
  cancelled: "bg-adventure-soft text-adventure",
  rejected: "bg-adventure-soft text-adventure",
};

export function BookingCard({ booking }: { booking: CustomerBooking }) {
  const [showQr, setShowQr] = useState(false);
  const img = resolveImage(booking.primary_image_url);
  const status = (booking.status || "pending").toLowerCase();
  const date = booking.selected_date
    ? new Date(booking.selected_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="flex gap-4 rounded-3xl border border-sand-200 bg-white p-4 kuddl-shadow">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-sand-100">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-3xl">🎈</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-extrabold text-kuddl-ink">
            {booking.service_name || "Kuddl experience"}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold capitalize ${
              statusStyles[status] || "bg-sand-100 text-sand-600"
            }`}
          >
            {status.replace(/_/g, " ")}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-sand-600">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {date}
          </span>
          {booking.start_time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {booking.start_time}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-black text-primary-700">
            {formatPrice(booking.total_amount)}
          </span>
          <div className="flex items-center gap-3">
            {booking.invoice_qr_url && (
              <button
                onClick={() => setShowQr(true)}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-primary-600 hover:text-primary-700"
              >
                <QrCode className="h-4 w-4" /> Entry QR
              </button>
            )}
            {booking.service_id && (
              <Link
                href={`/services/${booking.service_id}`}
                className="text-xs font-extrabold text-secondary-600 hover:text-secondary-700"
              >
                View →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* QR modal */}
      <AnimatePresence>
        {showQr && booking.invoice_qr_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQr(false)}
            className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-3xl bg-white p-6 text-center kuddl-shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black text-kuddl-ink">Entry QR</h3>
                <button
                  onClick={() => setShowQr(false)}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-sand-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={booking.invoice_qr_url}
                alt="Entry QR code"
                className="mx-auto mt-3 h-56 w-56 rounded-xl border border-sand-200 p-2"
              />
              <p className="mt-3 text-sm font-bold text-kuddl-ink">
                {booking.service_name}
              </p>
              <p className="mt-1 text-xs text-sand-600">
                Show this at the venue — the partner scans it to view your
                child, parent &amp; payment details.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
