import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login, getMe } from "../services/authService";
import { useAuthStore } from "@/store/useAuthStore";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/core/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";

const loginSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Formato de correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginView = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const loginRes = await login(values);
      if (!loginRes.success) {
        throw new Error(loginRes.error || "Credenciales incorrectas");
      }

      const meRes = await getMe();
      if (!meRes.success) {
        throw new Error(meRes.error || "Error al obtener datos del usuario");
      }

      return meRes.data;
    },
    onSuccess: (userData) => {
      setUser(userData);
      toast.success("Inicio de sesión exitoso");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Correo electrónico o contraseña incorrectos");
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm max-h-screen">
          <CardHeader className="space-y-1 pb-2 pt-6">
            <img
              src="/logo-bf.png"
              alt="Logo Benjamín Franklin"
              className="w-full h-auto max-w-[280px] mx-auto block m-0 p-0"
            />
            <CardTitle className="text-2xl font-semibold text-center text-slate-800 dark:text-slate-100 pt-2">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center text-slate-500 dark:text-slate-400">
              Ingresa tus credenciales para acceder al sistema
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
                      <FormLabel className="text-slate-700 dark:text-slate-300">Correo Electrónico</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <FormControl>
                          <Input
                            placeholder="admin@ejemplo.com"
                            className="pl-10 h-11"
                            {...field}
                            disabled={loginMutation.isPending}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">Contraseña</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 h-11"
                            {...field}
                            disabled={loginMutation.isPending}
                          />
                        </FormControl>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-slate-600 focus:outline-none"
                            disabled={loginMutation.isPending}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-[#005088] hover:bg-[#003d69] text-white transition-colors"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Benjamín Franklin CRM. Todos los derechos reservados.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginView;
