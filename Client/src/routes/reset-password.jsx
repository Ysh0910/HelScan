import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";
import { ShieldPlus, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => ({
    token: search.token || "",
    email: search.email || "",
  }),
  head: () => ({
    meta: [
      { title: "Reset Password — HelScan" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token, email } = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const password = watch("password");

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await apiPost("/auth/reset-password", {
        email: email,
        token: token,
        password: values.password,
      });
      setSuccess(true);
      toast.success("Password reset successfully");
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = !token || !email;

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
            Choose new password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below to reset your account.
          </p>
        </div>

        {isInvalid ? (
          <div className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center shadow-elegant space-y-4">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-destructive">Invalid or Incomplete Link</h3>
            <p className="text-sm text-muted-foreground">
              This reset link seems to be missing information or is corrupt. Please request a new link.
            </p>
            <div className="pt-2">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Request new link
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="mt-10 rounded-2xl border border-border/60 bg-card p-6 text-center shadow-elegant space-y-4">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">Password Reset Success!</h3>
            <p className="text-sm text-muted-foreground">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Go to Log in now
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-10 space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-elegant"
          >
            <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg border border-border/30">
              Resetting password for: <span className="font-medium text-foreground">{email}</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 8, message: "At least 8 characters" }
                })}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword", { 
                  required: "Confirm password is required",
                  validate: (v) => v === password || "Passwords do not match"
                })}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
