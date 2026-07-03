import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { apiGet, downloadQrUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  CheckCircle2,
  Download,
  Home,
  Loader2,
  Pencil,
  Phone,
  User,
} from "lucide-react";

export const Route = createFileRoute("/result/$id")({
  head: () => ({
    meta: [
      { title: "Your HelScan is ready" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const { id } = Route.useParams();
  const [rider, setRider] = useState(null);
  const [error, setError] = useState(null);
  const qrTarget = `${typeof window !== "undefined" ? window.location.origin : ""}/rider/${id}`;

  useEffect(() => {
    apiGet(`/rider/${id}`, true)
      .then(setRider)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load"),
      );
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-destructive">{error}</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm text-primary underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="grid min-h-[calc(100vh-4rem)] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const fullName = `${rider.firstName ?? ""} ${rider.lastName ?? ""}`.trim();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-hero">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your HelScan is ready
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Download the sticker, print it, and stick it inside your helmet.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border/60 bg-gradient-card shadow-elegant">
          <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
                  {rider.photo ? (
                    <img
                      src={rider.photo}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-muted-foreground">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Rider
                  </div>
                  <div className="text-2xl font-semibold">
                    {fullName || "—"}
                  </div>
                  <div className="mt-1 text-3xl font-bold text-primary">
                    {rider.bloodGroup ?? "—"}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                {(rider.vehicleRegistration || rider.vehicleModel) && (
                  <Row label="Vehicle">
                    {[rider.vehicleModel, rider.vehicleRegistration]
                      .filter(Boolean)
                      .join(" · ")}
                  </Row>
                )}
                {rider.insurance?.providerName && (
                  <Row label="Insurance">
                    {rider.insurance.providerName}
                    {rider.insurance.policyNumber
                      ? ` · ${rider.insurance.policyNumber}`
                      : ""}
                  </Row>
                )}
                {rider.emergencyContacts?.filter((c) => c?.name || c?.phone)
                  .length ? (
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      Emergency contacts
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {rider.emergencyContacts
                        .filter((c) => c?.name || c?.phone)
                        .map((c, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between gap-2"
                          >
                            <span>
                              {c.name}
                              {c.relation ? ` (${c.relation})` : ""}
                            </span>
                            {c.phone && (
                              <a
                                href={`tel:${c.phone}`}
                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                              >
                                <Phone className="h-3.5 w-3.5" /> {c.phone}
                              </a>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-t border-border/60 bg-background/60 p-8 sm:border-l sm:border-t-0">
              <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                <QRCodeCanvas
                  value={qrTarget}
                  size={200}
                  level="H"
                  includeMargin={false}
                  fgColor="#111111"
                />
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Scans to your public medical ID
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={downloadQrUrl(id)} target="_blank" rel="noreferrer">
            <Button size="lg" className="gap-2 shadow-elegant">
              <Download className="h-4 w-4" /> Download PDF sticker
            </Button>
          </a>
          {getToken() && (
            <Link to="/edit/$id" params={{ id }}>
              <Button size="lg" variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" /> Edit profile
              </Button>
            </Link>
          )}
          <Link to="/">
            <Button size="lg" variant="outline" className="gap-2">
              <Home className="h-4 w-4" /> Back to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-medium">{children}</div>
    </div>
  );
}
