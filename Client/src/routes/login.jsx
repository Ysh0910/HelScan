import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, API_URL } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { ShieldPlus, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — HelScan" },
      {
        name: "description",
        content: "Log in to manage your HelScan medical ID.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await apiPost("/auth/login", values);
      setAuth(res.token, res.user);
      toast.success("Welcome back");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
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
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to update your medical ID.
          </p>
        </div>

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
              {...register("email", { required: "Email is required" })}
            />

            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password", { required: "Password is required" })}
            />

            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full" disabled>
            Continue with Google
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
