import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  ShieldPlus,
  QrCode,
  Languages,
  Phone,
  Zap,
  HeartPulse,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HelScan — A QR sticker that could save your life" },
      {
        name: "description",
        content:
          "HelScan is a medical ID for riders. Stick a QR on your helmet — first responders instantly see your blood group, allergies, and emergency contacts.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, token } = useAuth();
  const riderId = user?.riderId ?? null;
  const authChecked = true;

  // Hero CTA logic:
  // - Not logged in → signup + login
  // - Logged in, has profile → "View my profile" only
  // - Logged in, no profile → nothing (they'll be redirected from /inputform anyway,
  //   but we still show a "Create profile" CTA for brand-new accounts)
  const heroCTAs = !authChecked ? null : !token ? (
    <>
      <Link to="/signup">
        <Button size="lg" className="h-12 gap-2 px-6 shadow-glow">
          Create your profile <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      <Link to="/login">
        <Button size="lg" variant="outline" className="h-12 px-6">
          I already have an account
        </Button>
      </Link>
    </>
  ) : riderId ? (
    <Link to="/edit/$id" params={{ id: String(riderId) }}>
      <Button size="lg" className="h-12 gap-2 px-6 shadow-glow">
        Edit profile <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  ) : (
    <Link to="/inputform">
      <Button size="lg" className="h-12 gap-2 px-6 shadow-glow">
        Create your profile <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  );

  const bottomCTA = !authChecked ? null : !token ? (
    <Link to="/signup">
      <Button size="lg" variant="secondary" className="h-12 gap-2 px-6">
        Get your HelScan <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  ) : riderId ? (
    <Link to="/edit/$id" params={{ id: String(riderId) }}>
      <Button size="lg" variant="secondary" className="h-12 gap-2 px-6">
        Edit profile <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  ) : (
    <Link to="/inputform">
      <Button size="lg" variant="secondary" className="h-12 gap-2 px-6">
        Create your profile <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  );

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Now protecting riders across India
            </div>

            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              A QR sticker that could{" "}
              <span className="text-gradient-primary">save your life.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              HelScan turns your helmet into an emergency medical ID. First
              responders scan a QR code and instantly see blood group,
              allergies, and who to call — in the language they read.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {heroCTAs}
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Free forever · Takes 90 seconds · No app install required
            </p>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto mt-16 max-w-3xl">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-primary opacity-20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-card shadow-elegant">
              <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
                <div className="p-8 sm:p-10">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                    <HeartPulse className="h-4 w-4" /> Emergency Medical ID
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-primary" />
                    <div>
                      <div className="text-lg font-semibold">Hamza Ali Mazari</div>
                      <div className="text-sm text-muted-foreground">
                        Lyari · Age 31
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        Blood
                      </div>
                      <div className="text-2xl font-bold text-primary">B+</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        Allergies
                      </div>
                      <div className="font-medium">Rehman Dakait,Major Iqbal</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        In case of emergency
                      </div>
                      <div className="font-medium">
                        Jameel Jamali · +91 98•• ••20
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center border-t border-border/60 bg-background/60 p-8 sm:border-l sm:border-t-0">
                  <div className="grid gap-3 text-center">
                    <div className="mx-auto grid h-40 w-40 place-items-center rounded-2xl border border-border bg-background p-3">
                      <QrCode
                        className="h-full w-full text-foreground"
                        strokeWidth={1.25}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Scan · anywhere · any phone
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for the worst 30 seconds of your day.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every second counts after a crash. HelScan gives responders exactly
            what they need — no app, no login, no guessing.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-gradient-card p-6 transition-all hover:shadow-elegant hover:-translate-y-0.5"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border/60 bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps. One sticker.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-2xl border border-border/60 bg-background p-6"
              >
                <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Step {i + 1}
                </div>
                <div className="mt-3 text-lg font-semibold">{s.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-primary p-10 text-center text-primary-foreground shadow-glow sm:p-16">
          <Sparkles className="mx-auto h-8 w-8 opacity-80" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Every ride deserves a safety net.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Create your medical ID in 90 seconds and download a print-ready
            sticker for your helmet.
          </p>
          <div className="mt-8">{bottomCTA}</div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldPlus className="h-4 w-4 text-primary" />
            <span>HelScan · Built for riders</span>
          </div>
          <div>
            Built with ❤️ in Bengaluru by{" "}
            <a
              href="https://www.linkedin.com/in/yashwanth910/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline transition-colors"
            >
              Yashwanth G
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Zap,
    title: "Instant, no-install access",
    body: "A responder scans the QR — the profile opens in any browser. No download, no login, no delay.",
  },
  {
    icon: Languages,
    title: "Multilingual by default",
    body: "Auto-translates to English, हिन्दी, and ಕನ್ನಡ. Blood group and phone numbers stay universal.",
  },
  {
    icon: Phone,
    title: "One-tap emergency contacts",
    body: "Numbers become tap-to-call links. Responders reach your family in seconds, not minutes.",
  },
  {
    icon: HeartPulse,
    title: "Life-critical fields first",
    body: "Blood group, allergies, and conditions are surfaced at the top — the way a paramedic actually reads it.",
  },
  {
    icon: QrCode,
    title: "Print-ready helmet sticker",
    body: "Download a weather-resistant PDF sticker sized for any helmet. Print it, peel it, ride.",
  },
  {
    icon: ShieldPlus,
    title: "Yours, always private",
    body: "You control what appears. Update anytime — the QR code never has to change.",
  },
];

const steps = [
  {
    title: "Fill your profile",
    body: "Blood group, allergies, medications, emergency contacts, insurance, vehicle. 90 seconds, one form.",
  },
  {
    title: "Get your QR",
    body: "We generate a unique QR that links to your medical ID. Download the print-ready sticker.",
  },
  {
    title: "Stick it on your helmet",
    body: "Now every ride comes with a safety net. Update your info anytime — the QR stays the same.",
  },
];
