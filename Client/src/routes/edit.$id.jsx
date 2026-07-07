import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { useForm, Controller } from "react-hook-form";
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
import { Separator } from "@/components/ui/separator";
import { apiGet, apiPatch, uploadImage } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  ArrowLeft,
  Loader2,
  Save,
  User,
  HeartPulse,
  Phone,
  Shield,
  Bike,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/edit/$id")({
  head: () => ({
    meta: [
      { title: "Edit profile — HelScan" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditProfilePage,
});

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-elegant sm:p-8 mt-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
      </div>
      <Separator className="mb-5" />
      {children}
    </div>
  );
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

function EditProfilePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Auth gate
  useEffect(() => {
    if (!getToken()) {
      toast.error("Please log in first");
      navigate({ to: "/login" });
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      photo: "",
      firstName: "",
      lastName: "",
      dob: "",
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
  const [uploading, setUploading] = useState(false);

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

  // Load existing rider data
  useEffect(() => {
    if (!id) return;
    apiGet(`/rider/${id}`, true)
      .then((rider) => {
        // Format dob for date input (YYYY-MM-DD)
        let dob = "";
        if (rider.dob) {
          dob = new Date(rider.dob).toISOString().split("T")[0];
        }

        // Normalize allergies / conditions arrays → comma string
        const normalize = (val) => {
          if (Array.isArray(val)) return val.join(", ");
          return val ?? "";
        };

        // Ensure two emergency contacts
        const contacts = [
          rider.emergencyContacts?.[0] ?? { name: "", phone: "", relation: "" },
          rider.emergencyContacts?.[1] ?? { name: "", phone: "", relation: "" },
        ];

        reset({
          firstName: rider.firstName ?? "",
          lastName: rider.lastName ?? "",
          dob,
          photo: rider.photo ?? "",
          bloodGroup: rider.bloodGroup ?? "",
          height: rider.height ?? "",
          weight: rider.weight ?? "",
          identificationMark: rider.identificationMark ?? "",
          allergies: normalize(rider.allergies),
          medicalConditions: normalize(rider.medicalConditions),
          currentMedications: rider.currentMedications ?? "",
          previousSurgeriesOrImplants: rider.previousSurgeriesOrImplants ?? "",
          organDonor: rider.organDonor ?? false,
          bloodDonorCard: rider.bloodDonorCard ?? false,
          emergencyContacts: contacts,
          insurance: {
            providerName: rider.insurance?.providerName ?? "",
            policyNumber: rider.insurance?.policyNumber ?? "",
          },
          vehicleRegistration: rider.vehicleRegistration ?? "",
          vehicleModel: rider.vehicleModel ?? "",
          homeCity: rider.homeCity ?? "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Filter out empty strings (but keep false booleans and 0)
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => {
          if (typeof v === "boolean") return true;
          if (typeof v === "number") return true;
          if (typeof v === "object" && v !== null) return true;
          return v !== "" && v !== null && v !== undefined;
        })
      );

      await apiPatch(`/rider/${id}`, payload, true);
      toast.success("Profile updated");
      navigate({ to: "/result/$id", params: { id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-hero">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Back link */}
        <Link
          to="/result/$id"
          params={{ id }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Edit your profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update your medical information. Changes apply immediately.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        >
          {/* Personal Details */}
          <SectionCard title="Personal Details" icon={User}>
            <div className="mb-5">
              <PhotoField
                photo={photo}
                uploading={uploading}
                onChange={onPhotoChange}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" required error={errors.firstName?.message}>
                <Input
                  {...register("firstName", { required: "Required" })}
                />
              </Field>
              <Field label="Last name">
                <Input {...register("lastName")} />
              </Field>
              <Field label="Date of birth">
                <Input type="date" {...register("dob")} />
              </Field>
              <Field label="Blood group" required error={errors.bloodGroup?.message}>
                <Controller
                  control={control}
                  name="bloodGroup"
                  rules={{ required: "Required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                <Input type="number" {...register("weight")} placeholder="e.g. 72" />
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
          </SectionCard>

          {/* Medical Information */}
          <SectionCard title="Medical Information" icon={HeartPulse}>
            <div className="space-y-4">
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
                <Textarea rows={2} {...register("previousSurgeriesOrImplants")} />
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
          </SectionCard>

          {/* Emergency Contacts */}
          <SectionCard title="Emergency Contacts" icon={Phone}>
            <div className="space-y-6">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-xl border border-border/60 p-5">
                  <div className="mb-3 text-sm font-semibold">Contact {i + 1}</div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Name">
                      <Input {...register(`emergencyContacts.${i}.name`)} />
                    </Field>
                    <Field label="Phone">
                      <Input
                        type="tel"
                        {...register(`emergencyContacts.${i}.phone`)}
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
          </SectionCard>

          {/* Insurance */}
          <SectionCard title="Insurance" icon={Shield}>
            <div className="grid gap-4 sm:grid-cols-2">
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
          </SectionCard>

          {/* Vehicle & Location */}
          <SectionCard title="Vehicle &amp; Location" icon={Bike}>
            <div className="grid gap-4 sm:grid-cols-2">
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
          </SectionCard>

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="gap-1.5 shadow-elegant"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
