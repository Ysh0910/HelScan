import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";
import { ShieldPlus, Loader2, Mail, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — HelScan" },
      {
        name: "description",
        content: "Request a password reset link for your HelScan account.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await apiPost("/auth/forgot-password", values);
      setSuccess(true);
      toast.success("Reset link sent if email is registered");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to request reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-hero">
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-elegant">
            <ShieldPlus
              className="h-6 w-6 text-primary-foreground"
              strokeWidth={2.5}
            />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We will email you instructions to reset your password.
          </p>
        </div>

        {success ? (
          <div className="mt-10 rounded-2xl border border-border/60 bg-card p-6 text-center shadow-elegant animate-fade-in space-y-4">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              If an account is associated with that email, you will receive a reset link shortly.
            </p>
            <p className="text-xs text-muted-foreground/80 mt-3 bg-secondary/50 p-3 rounded-xl border border-border/40">
              💡 Check your spam folder also, and if the email is found there, please unmark it as not spam.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Log in
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-10 space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-elegant"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email",
                  }
                })}
              />

              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Log in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
