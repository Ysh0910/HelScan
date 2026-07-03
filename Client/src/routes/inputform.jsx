import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { apiPost, uploadImage, API_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Upload,
  User,
  HeartPulse,
  Phone,
  Shield,
  Bike,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/inputform")({
  head: () => ({
    meta: [
      { title: "Create your medical ID — HelScan" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InputFormPage,
});

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const DRAFT_KEY = "helscan_form_draft";

const STEPS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "medical", label: "Medical", icon: HeartPulse },
  { id: "contacts", label: "Contacts", icon: Phone },
  { id: "insurance", label: "Insurance", icon: Shield },
  { id: "vehicle", label: "Vehicle", icon: Bike },
];

function InputFormPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Auth gate — redirect to login if not authenticated
  useEffect(() => {
    if (!getToken()) {
      toast.error("Please log in first");
      navigate({ to: "/login" });
      return;
    }
    // Profile guard — redirect to result page if user already has a profile
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((me) => {
        if (me?.riderId) {
          navigate({ to: "/result/$id", params: { id: String(me.riderId) }, replace: true });
        }
      })
      .catch(() => {});
  }, [navigate]);

  // Clear stale drafts that belong to an already-saved profile
  useEffect(() => {
    const draft = loadDraft();
    if (draft?._savedId) {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: loadDraft() ?? {
      firstName: "",
      lastName: "",
      dob: "",
      photo: "",
      bloodGroup: "",
      height: "",
      weight: "",
      identificationMark: "",
      allergies: "",
      medicalConditions: "",
      currentMedications: "",
      previousSurgeriesOrImplants: "",
      organDonor: false,
      bloodDonorCard: false,
      emergencyContacts: [
        { name: "", phone: "", relation: "" },
        { name: "", phone: "", relation: "" },
      ],
      insurance: { providerName: "", policyNumber: "" },
      vehicleRegistration: "",
      vehicleModel: "",
      homeCity: "",
    },
  });

  const photo = watch("photo");
  const values = watch();

  // Auto-save draft
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {}
    }, 400);
    return () => clearTimeout(id);
  }, [values]);

  const stepFields = [
    ["firstName", "bloodGroup"],
    [],
    ["emergencyContacts.0.name", "emergencyContacts.0.phone"],
    [],
    [],
  ];

  const goNext = async () => {
    const ok = await trigger(stepFields[step]);
    if (!ok) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPhotoChange = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      const url = await uploadImage(compressed);
      setValue("photo", url, { shouldDirty: true });
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await apiPost("/riderform", data, true);
      // Mark draft as belonging to a saved profile so it doesn't auto-load next time
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, _savedId: res.id }));
      } catch {}
      localStorage.removeItem(DRAFT_KEY);
      toast.success("Profile saved");
      navigate({ to: "/result/$id", params: { id: res.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-hero">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Create your medical ID
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length} · {STEPS[step].label}
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Progress
            value={((step + 1) / STEPS.length) * 100}
            className="h-1.5"
          />
          <div className="mt-4 flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div
                  key={s.id}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <div
                    className={
                      "flex h-9 w-9 items-center justify-center rounded-full border transition-all " +
                      (done
                        ? "border-primary bg-primary text-primary-foreground"
                        : active
                          ? "border-primary bg-background text-primary shadow-elegant"
                          : "border-border bg-background text-muted-foreground")
                    }
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={
                      "hidden text-xs sm:block " +
                      (active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground")
                    }
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-elegant sm:p-8"
        >
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <PhotoField
                photo={photo}
                uploading={uploading}
                onChange={onPhotoChange}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  required
                  error={errors.firstName?.message}
                >
                  <Input {...register("firstName", { required: "Required" })} />
                </Field>
                <Field label="Last name">
                  <Input {...register("lastName")} />
                </Field>
                <Field label="Date of birth">
                  <Input type="date" {...register("dob")} />
                </Field>
                <Field
                  label="Blood group"
                  required
                  error={errors.bloodGroup?.message}
                >
                  <Controller
                    control={control}
                    name="bloodGroup"
                    rules={{ required: "Required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Height (cm)">
                  <Input {...register("height")} placeholder="e.g. 175" />
                </Field>
                <Field label="Weight (kg)">
                  <Input
                    type="number"
                    {...register("weight")}
                    placeholder="e.g. 72"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Identification mark">
                    <Input
                      {...register("identificationMark")}
                      placeholder="e.g. Mole on left cheek"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <Field label="Allergies" hint="Comma-separated">
                <Textarea
                  rows={2}
                  {...register("allergies")}
                  placeholder="Penicillin, peanuts"
                />
              </Field>
              <Field label="Medical conditions" hint="Comma-separated">
                <Textarea
                  rows={2}
                  {...register("medicalConditions")}
                  placeholder="Asthma, hypertension"
                />
              </Field>
              <Field label="Current medications">
                <Textarea
                  rows={2}
                  {...register("currentMedications")}
                  placeholder="e.g. Metformin 500mg"
                />
              </Field>
              <Field label="Previous surgeries or implants">
                <Textarea
                  rows={2}
                  {...register("previousSurgeriesOrImplants")}
                />
              </Field>
              <div className="grid gap-3 rounded-xl border border-border/60 bg-secondary/40 p-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="organDonor"
                  render={({ field }) => (
                    <label className="flex items-center gap-3 text-sm">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      Organ donor
                    </label>
                  )}
                />

                <Controller
                  control={control}
                  name="bloodDonorCard"
                  render={({ field }) => (
                    <label className="flex items-center gap-3 text-sm">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      Blood donor card
                    </label>
                  )}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-xl border border-border/60 p-5">
                  <div className="mb-3 text-sm font-semibold">
                    Contact {i + 1}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field
                      label="Name"
                      required={i === 0}
                      error={errors.emergencyContacts?.[i]?.name}
                    >
                      <Input
                        {...register(`emergencyContacts.${i}.name`, {
                          required: i === 0 ? "Required" : false,
                        })}
                      />
                    </Field>
                    <Field
                      label="Phone"
                      required={i === 0}
                      error={errors.emergencyContacts?.[i]?.phone}
                    >
                      <Input
                        type="tel"
                        {...register(`emergencyContacts.${i}.phone`, {
                          required: i === 0 ? "Required" : false,
                        })}
                        placeholder="+91 98•• ••••••"
                      />
                    </Field>
                    <Field label="Relation">
                      <Input
                        {...register(`emergencyContacts.${i}.relation`)}
                        placeholder="Father, Spouse"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 animate-fade-in sm:grid-cols-2">
              <Field label="Provider name">
                <Input
                  {...register("insurance.providerName")}
                  placeholder="Star Health"
                />
              </Field>
              <Field label="Policy number">
                <Input {...register("insurance.policyNumber")} />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 animate-fade-in sm:grid-cols-2">
              <Field label="Vehicle registration">
                <Input
                  {...register("vehicleRegistration")}
                  placeholder="KA-01-AB-1234"
                />
              </Field>
              <Field label="Vehicle model">
                <Input
                  {...register("vehicleModel")}
                  placeholder="Royal Enfield Classic 350"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Home city">
                  <Input {...register("homeCity")} placeholder="Bengaluru" />
                </Field>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 0}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext} className="gap-1.5">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitting || uploading}
                className="gap-1.5 shadow-elegant"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>Save profile</>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function loadDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Field({ label, required, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1 text-sm">
        {label}
        {required && <span className="text-primary">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PhotoField({ photo, uploading, onChange }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        onChange(e.dataTransfer.files?.[0] ?? null);
      }}
      onClick={() => inputRef.current?.click()}
      className={
        "flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-5 transition-all " +
        (drag
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-secondary/40")
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
        {photo ? (
          <img
            src={photo}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <User className="h-8 w-8" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Upload className="h-4 w-4" />
          {photo ? "Replace photo" : "Upload photo"}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Drag & drop or click to browse. JPG or PNG, auto-compressed.
        </p>
      </div>
    </div>
  );
}
