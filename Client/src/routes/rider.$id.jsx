import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { LANGS, t } from "@/lib/i18n";
import { Heart, Phone, User, Loader2, Languages, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/rider/$id")({
  head: () => ({
    meta: [
      { title: "Emergency Medical ID — HelScan" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublicRiderPage,
});

// Never-translate keys
const NEVER_TRANSLATE = new Set([
  "bloodGroup",
  "dob",
  "height",
  "weight",
  "insurance",
  "vehicleRegistration",
]);

function pick(rider, key, lang) {
  if (lang === "en" || NEVER_TRANSLATE.has(key)) return rider[key];
  const tr = rider.translations?.[lang];
  if (tr && key in tr && tr[key] != null && tr[key] !== "") return tr[key];
  return rider[key];
}

function PublicRiderPage() {
  const { id } = Route.useParams();
  const [rider, setRider] = useState(null);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState("en");
  const [showCaution, setShowCaution] = useState(true);

  useEffect(() => {
    // 1. Fetch rider details
    apiGet(`/rider/${id}`)
      .then(setRider)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load"),
      );

    // 2. Query scanner geolocation and log the scan event (IP is captured on backend)
    const logScan = (latitude = null, longitude = null) => {
      apiPost(`/rider/${id}/scan`, { latitude, longitude })
        .then(() => console.log("Scan logged successfully"))
        .catch((err) => console.error("Error logging scan:", err));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          logScan(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation permission denied or error:", error);
          logScan(null, null);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      logScan(null, null);
    }
  }, [id]);

  const formatWhatsAppPhone = (phone) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      cleaned = "91" + cleaned;
    }
    return cleaned;
  };

  const triggerWhatsApp = (lat, lng) => {
    const firstContact = rider?.emergencyContacts?.find((c) => c?.phone);
    const rawPhone = firstContact?.phone;
    if (!rawPhone) {
      toast.error(
        "No emergency contact phone number configured for this rider.",
      );
      return;
    }
    const formattedPhone = formatWhatsAppPhone(rawPhone);
    let message = "";
    if (lat !== null && lng !== null) {
      message = `🚨 EMERGENCY: I scanned this rider's medical ID. They may be in an accident. My exact location is: https://www.google.com/maps?q=${lat},${lng}`;
    } else {
      message = `🚨 EMERGENCY: I scanned this rider's medical ID. They may be in an accident. Please call me back!`;
    }
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleSOS = () => {
    if (!navigator.geolocation) {
      triggerWhatsApp(null, null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        triggerWhatsApp(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        triggerWhatsApp(null, null);
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  };

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const hasTranslation = lang === "en" || !!rider.translations?.[lang];
  const fullName = `${rider.firstName ?? ""} ${rider.lastName ?? ""}`.trim();
  const g = (k) => pick(rider, k, lang);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Caution Modal */}
      {showCaution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 no-print animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8 animate-scale-in">
            {/* Close button (X) */}
            <button
              onClick={() => setShowCaution(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              aria-label="Close Warning"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                <span className="text-xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-destructive tracking-tight sm:text-2xl">
                Caution: Confidential Information
              </h2>
              <p className="text-sm text-foreground/90 leading-relaxed text-justify bg-secondary/35 p-4 rounded-xl border border-border/40">
                This information is crucial for the person's well-being. Please be advised that by scanning this Tag, your IP address has been logged and shared with the owner. This Emergency Medical ID contains sensitive information intended for use only in emergency situations. Any misuse or unauthorised access may result in legal consequences. The IP address record is a precautionary measure to ensure responsible use. Remember, this information is meant to save lives. Any misuse will not be tolerated. In case of emergency, please proceed responsibly and contact the relevant authorities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emergency banner */}
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-elegant">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Heart
              className="h-5 w-5 shrink-0 animate-pulse"
              fill="currentColor"
            />
            <span className="text-sm font-bold uppercase tracking-widest sm:text-base">
              {t("emergencyId", lang)}
            </span>
          </div>
          <div className="no-print flex items-center gap-1 rounded-full bg-white/15 p-0.5">
            <Languages className="ml-2 h-3.5 w-3.5 opacity-80" />
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-all " +
                  (lang === l.code
                    ? "bg-white text-primary"
                    : "text-primary-foreground/90 hover:bg-white/10")
                }
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        {!hasTranslation && (
          <div className="mb-4 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
            {t("translationsLoading", lang)}
          </div>
        )}

        {/* Identity card */}
        <div className="overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-card shadow-elegant">
          <div className="flex items-center gap-4 p-5 sm:p-6">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-primary/20 bg-secondary">
              {rider.photo ? (
                <img
                  src={rider.photo}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground">
                  <User className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {(g("firstName") ?? "") + " " + (g("lastName") ?? "")}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {t("bloodGroup", lang)}
                </span>
                <span className="text-3xl font-bold text-primary sm:text-4xl">
                  {rider.bloodGroup ?? "—"}
                </span>
              </div>
              {rider.dob && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {t("dob", lang)}: {rider.dob.split("T")[0]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SOS Button */}
        <div className="mt-6 no-print">
          <button
            onClick={handleSOS}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-red-600 hover:bg-red-700 px-6 py-4 text-center text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-100 cursor-pointer"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-red-500 opacity-25" />
            <span className="relative flex items-center gap-2">
              <span>🚨</span> Send Emergency SOS
            </span>
          </button>
        </div>

        {/* Sections */}
        <Section title={t("physical", lang)}>
          <KV
            label={t("height", lang)}
            value={rider.height ? `${rider.height} cm` : null}
          />
          <KV
            label={t("weight", lang)}
            value={rider.weight ? `${rider.weight} kg` : null}
          />
          <KV
            label={t("identificationMark", lang)}
            value={g("identificationMark")}
          />
        </Section>

        <Section title={t("medical", lang)}>
          <KV label={t("allergies", lang)} value={g("allergies")} emphasize />
          <KV
            label={t("conditions", lang)}
            value={g("medicalConditions")}
            emphasize
          />
          <KV label={t("medications", lang)} value={g("currentMedications")} />
          <KV
            label={t("surgeries", lang)}
            value={g("previousSurgeriesOrImplants")}
          />
          <KV
            label={t("organDonor", lang)}
            value={rider.organDonor ? t("yes", lang) : t("no", lang)}
          />

          <KV
            label={t("bloodDonor", lang)}
            value={rider.bloodDonorCard ? t("yes", lang) : t("no", lang)}
          />
        </Section>

        <Section title={t("emergencyContacts", lang)}>
          {rider.emergencyContacts?.filter((c) => c?.name || c?.phone)
            .length ? (
            <ul className="divide-y divide-border">
              {rider.emergencyContacts
                .filter((c) => c?.name || c?.phone)
                .map((c, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{c.name}</div>
                      {c.relation && (
                        <div className="text-xs text-muted-foreground">
                          {c.relation}
                        </div>
                      )}
                    </div>
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] active:scale-100"
                      >
                        <Phone className="h-4 w-4" />
                        {c.phone}
                      </a>
                    )}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </Section>

        <Section title={t("insurance", lang)}>
          <KV
            label={t("provider", lang)}
            value={rider.insurance?.providerName}
          />
          <KV
            label={t("policyNumber", lang)}
            value={rider.insurance?.policyNumber}
          />
        </Section>

        <Section title={t("vehicle", lang)}>
          <KV
            label={t("registration", lang)}
            value={rider.vehicleRegistration}
          />
          <KV label={t("model", lang)} value={g("vehicleModel")} />
          <KV label={t("homeCity", lang)} value={g("homeCity")} />
        </Section>

        <p className="mt-10 pb-8 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <span className="font-semibold text-foreground">HelScan</span>
        </p>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border bg-secondary/50 px-5 py-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function KV({ label, value, emphasize }) {
  if (!value) return null;
  return (
    <div className="flex flex-col justify-between gap-0.5 py-1.5 sm:flex-row sm:items-baseline sm:gap-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "text-sm sm:text-right " +
          (emphasize
            ? "font-semibold text-primary"
            : "font-medium text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
