import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/api/auth";
import { Button } from "@/components/ui/button";
import {  Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LogIn, Shield } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login successful");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
      setIsLoading(false);
    },
  });

  function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    mutation.mutate(values);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 animate-scale-in">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
          <CardDescription className="text-base">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="admin@example.com" 
                        {...field}
                        className="h-11 bg-background/50 border-border/50 focus-visible:ring-primary/50 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field}
                        className="h-11 bg-background/50 border-border/50 focus-visible:ring-primary/50 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-11 gradient-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover-lift transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Protected by enterprise-grade security
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

