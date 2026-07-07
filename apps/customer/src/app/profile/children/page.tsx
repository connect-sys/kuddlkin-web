"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, X, Loader2, Camera } from "lucide-react";
import { getCustomerChildren, addCustomerChild, type Child } from "@/lib/api";
import { resolveImage } from "@/lib/images";
import { initials } from "@/lib/utils";

const GENDERS = ["Boy", "Girl", "Other"];
const avatarColors = ["#EF9855", "#267D71", "#9895EE", "#FB5261", "#00B6AA"];

const emptyForm = {
  name: "",
  nickname: "",
  dateOfBirth: "",
  gender: "Boy",
  allergies: "",
  specialNeeds: "",
  notes: "",
  profilePicture: "",
};

function ageFromDob(dob?: string): string {
  if (!dob) return "";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const yrs = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  return yrs >= 0 ? `${yrs} yrs` : "";
}

function childPhoto(c: Child): string | null {
  return resolveImage(c.profile_picture || c.profilePicture || null);
}

export default function MyChildren() {
  const qc = useQueryClient();
  const { data: children = [], isLoading } = useQuery({
    queryKey: ["customer-children"],
    queryFn: getCustomerChildren,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const valid =
    form.name.trim().length > 1 && !!form.dateOfBirth && !!form.gender;

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_500_000) {
      toast.error("Please choose an image under 2.5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setForm((f) => ({ ...f, profilePicture: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const res = await addCustomerChild({
        name: form.name.trim(),
        nickname: form.nickname.trim(),
        gender: form.gender.toLowerCase(),
        dateOfBirth: form.dateOfBirth,
        allergies: form.allergies.trim(),
        specialNeeds: form.specialNeeds.trim(),
        notes: form.notes.trim(),
        profilePicture: form.profilePicture,
      });
      if (res.success) {
        toast.success(`${form.name} added! 🎉`);
        setForm({ ...emptyForm });
        setOpen(false);
        qc.invalidateQueries({ queryKey: ["customer-children"] });
      } else {
        toast.error(res.message || "Couldn't add child");
      }
    } catch {
      toast.error("Couldn't add child. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-kuddl-ink sm:text-3xl">
          My children
        </h1>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" /> Add child
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          [0, 1].map((i) => <div key={i} className="skeleton h-24 rounded-3xl" />)
        ) : children.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-sand-300 bg-white p-12 text-center">
            <p className="text-5xl">🧒</p>
            <p className="mt-4 text-lg font-black text-kuddl-ink">
              No children added yet
            </p>
            <p className="mt-1 text-sm text-sand-600">
              Add your little ones to make booking faster.
            </p>
          </div>
        ) : (
          children.map((c, i) => {
            const photo = childPhoto(c);
            const age = c.age ? `${c.age} yrs` : ageFromDob(c.date_of_birth);
            return (
              <div
                key={c.id || i}
                className="flex items-center gap-4 rounded-3xl border border-sand-200 bg-white p-5 kuddl-shadow"
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={c.name}
                    className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                  />
                ) : (
                  <span
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-black text-white"
                    style={{ background: avatarColors[i % avatarColors.length] }}
                  >
                    {initials(c.name)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-kuddl-ink">
                    {c.name}
                    {c.nickname ? (
                      <span className="ml-1 text-sm font-semibold text-sand-500">
                        ({c.nickname})
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm font-semibold capitalize text-sand-600">
                    {[age, c.gender].filter(Boolean).join(" · ")}
                  </p>
                  {c.allergies ? (
                    <p className="mt-0.5 text-xs font-semibold text-adventure">
                      ⚠ Allergies: {String(c.allergies)}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add child modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/40 p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="my-8 w-full max-w-md rounded-3xl bg-white p-6 kuddl-shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-kuddl-ink">Add a child</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Photo */}
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-3xl border-2 border-dashed border-sand-300 bg-sand-50 text-sand-500 transition-colors hover:border-primary-400"
                >
                  {form.profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.profilePicture}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-7 w-7" />
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/40 py-0.5 text-[10px] font-bold text-white">
                    Photo
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPhoto}
                  className="hidden"
                />
              </div>

              <div className="mt-5 space-y-3">
                <Input
                  label="Child's name *"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Aryan"
                />
                <Input
                  label="Nickname"
                  value={form.nickname}
                  onChange={(v) => setForm({ ...form, nickname: v })}
                  placeholder="e.g. Ari"
                />
                <div>
                  <Label>Date of birth *</Label>
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={form.dateOfBirth}
                    onChange={(e) =>
                      setForm({ ...form, dateOfBirth: e.target.value })
                    }
                    className="w-full rounded-xl border-2 border-sand-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary-400"
                  />
                </div>
                <div>
                  <Label>Gender *</Label>
                  <div className="flex gap-2">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        onClick={() => setForm({ ...form, gender: g })}
                        className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-colors ${
                          form.gender === g
                            ? "border-primary-400 bg-primary-50 text-primary-700"
                            : "border-sand-200 text-sand-600"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  label="Allergies"
                  value={form.allergies}
                  onChange={(v) => setForm({ ...form, allergies: v })}
                  placeholder="e.g. Peanuts, dairy"
                />
                <Input
                  label="Special needs"
                  value={form.specialNeeds}
                  onChange={(v) => setForm({ ...form, specialNeeds: v })}
                  placeholder="Anything we should be aware of"
                />
                <div>
                  <Label>Notes</Label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    placeholder="Likes, comfort items, routines…"
                    className="w-full rounded-xl border-2 border-sand-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary-400"
                  />
                </div>
              </div>

              <button
                onClick={save}
                disabled={!valid || saving}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-sm font-extrabold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save child"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-sand-500">
      {children}
    </label>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-sand-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary-400"
      />
    </div>
  );
}
