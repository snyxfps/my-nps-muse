import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

const REMEMBER_EMAIL_KEY = "auth_remember_email";
const SAVED_EMAIL_KEY = "auth_saved_email";

type AlertState = {
  variant?: "default" | "destructive";
  title: string;
  description: string;
  code?: string;
} | null;

function normalizeSupabaseError(err: any): { title: string; description: string; code?: string } {
  const msg = String(err?.message || "");

  if (msg.toLowerCase().includes("invalid login credentials")) {
    return { title: "Falha no login", description: "E-mail ou senha incorretos." };
  }

  if (msg.toLowerCase().includes("email not confirmed") || msg.toLowerCase().includes("not confirmed")) {
    return {
      title: "Confirme seu e-mail para entrar",
      description:
        "Enviamos um link de confirmação para o seu e-mail. Abra a caixa de entrada (e o spam) e clique no link para ativar sua conta.",
      code: "email_not_confirmed",
    };
  }

  if (msg.toLowerCase().includes("user already registered")) {
    return { title: "Conta já existe", description: "Esse e-mail já está cadastrado. Tente entrar." };
  }

  return { title: "Erro", description: msg || "Ocorreu um erro inesperado." };
}

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState<"signin" | "signup">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [rememberEmail, setRememberEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [alert, setAlert] = useState<AlertState>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  // Carregar email lembrado
  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_EMAIL_KEY) === "1";
    const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY) || "";
    setRememberEmail(remembered);
    if (remembered && savedEmail) setEmail(savedEmail);
  }, []);

  // Persistir email lembrado
  useEffect(() => {
    if (rememberEmail) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, "1");
      localStorage.setItem(SAVED_EMAIL_KEY, email);
    } else {
      localStorage.setItem(REMEMBER_EMAIL_KEY, "0");
      localStorage.removeItem(SAVED_EMAIL_KEY);
    }
  }, [rememberEmail, email]);

  const canSubmitSignin = useMemo(() => email.trim() && password.trim(), [email, password]);
  const canSubmitSignup = useMemo(
    () => email.trim() && password.trim() && confirmPassword.trim() && password === confirmPassword,
    [email, password, confirmPassword]
  );

  const handleSignIn = async () => {
    setAlert(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const e = normalizeSupabaseError(error);
        setAlert({
          variant: e.code ? "default" : "destructive",
          title: e.title,
          description: e.description,
          code: e.code,
        });
        return;
      }
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setAlert(null);
    setSignupSuccess(false);

    if (password !== confirmPassword) {
      setAlert({
        variant: "destructive",
        title: "Senhas não conferem",
        description: "Digite a mesma senha nos dois campos.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });

      if (error) {
        const e = normalizeSupabaseError(error);
        setAlert({ variant: "destructive", title: e.title, description: e.description, code: e.code });
        return;
      }

      setSignupSuccess(true);
      setAlert({
        variant: "default",
        title: "Conta criada! Falta só confirmar o e-mail",
        description:
          "Enviamos um e-mail de confirmação. Depois de confirmar, volte aqui e faça login normalmente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setAlert(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: window.location.origin },
      });

      if (error) {
        const e = normalizeSupabaseError(error);
        setAlert({ variant: "destructive", title: "Não foi possível reenviar", description: e.description });
        return;
      }

      setAlert({
        variant: "default",
        title: "E-mail reenviado",
        description: "Reenviamos o link de confirmação. Verifique a caixa de entrada e o spam.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setAlert(null);
    setLoading(true);
    try {
      const emailToUse = (resetEmail || email).trim();
      if (!emailToUse) {
        setAlert({
          variant: "destructive",
          title: "Informe um e-mail",
          description: "Digite o e-mail para enviar o link de redefinição.",
        });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        const e = normalizeSupabaseError(error);
        setAlert({ variant: "destructive", title: "Falha ao enviar e-mail", description: e.description });
        return;
      }

      setAlert({
        variant: "default",
        title: "Link enviado",
        description: "Enviamos um link de redefinição de senha. Verifique seu e-mail (e spam).",
      });
      setShowReset(false);
      setResetEmail("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* grade sutil */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />

      {/* glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-[-10%] h-[520px] w-[520px] rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-48 right-[-10%] h-[620px] w-[620px] rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2">
          {/* HERO */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">NPS Dashboard</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900">
              Decisões melhores com feedback real.
            </h1>

            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
              Centralize NPS, comentários e tendências em um painel bonito, rápido e confiável — ideal para times de produto e atendimento.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Métricas mensais e comparativos automáticos
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Comentários classificados para ação rápida
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Acesso seguro com autenticação por e-mail
              </li>
            </ul>

            <div className="mt-10 flex items-center gap-4 text-sm text-slate-600">
              <div className="rounded-xl border bg-white/60 px-4 py-3 shadow-sm backdrop-blur">
                <div className="font-semibold text-slate-900">⚡ Rápido</div>
                <div>Vite + React Query</div>
              </div>
              <div className="rounded-xl border bg-white/60 px-4 py-3 shadow-sm backdrop-blur">
                <div className="font-semibold text-slate-900">🔒 Seguro</div>
                <div>Supabase Auth</div>
              </div>
              <div className="rounded-xl border bg-white/60 px-4 py-3 shadow-sm backdrop-blur">
                <div className="font-semibold text-slate-900">📈 Pronto</div>
                <div>Dashboard NPS</div>
              </div>
            </div>
          </div>

          {/* LOGIN CARD */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <Card className="shadow-xl border bg-white/70 backdrop-blur-md">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Acessar</CardTitle>
                  <CardDescription>Entre com sua conta ou crie uma nova.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {alert && (
                    <Alert variant={alert.variant}>
                      <AlertTitle>{alert.title}</AlertTitle>
                      <AlertDescription className="space-y-3">
                        <div>{alert.description}</div>

                        {alert.code === "email_not_confirmed" && (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={handleResendConfirmation}
                              disabled={loading || !email.trim()}
                            >
                              Reenviar confirmação
                            </Button>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Tabs
                    value={tab}
                    onValueChange={(v) => {
                      setTab(v as any);
                      setAlert(null);
                      setShowReset(false);
                      setSignupSuccess(false);
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Entrar</TabsTrigger>
                      <TabsTrigger value="signup">Criar conta</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 space-y-3">
                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            className="pl-9"
                            placeholder="voce@empresa.com"
                          />
                        </div>
                      </div>

                      {/* Senha */}
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={tab === "signin" ? "current-password" : "new-password"}
                            className="pl-9 pr-10"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* ENTRAR */}
                      <TabsContent value="signin" className="m-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                            <Checkbox checked={rememberEmail} onCheckedChange={(v) => setRememberEmail(Boolean(v))} />
                            Lembrar meu e-mail
                          </label>

                          <Button type="button" variant="link" className="px-0" onClick={() => setShowReset((s) => !s)}>
                            Esqueci minha senha
                          </Button>
                        </div>

                        {showReset && (
                          <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                            <Label htmlFor="resetEmail">E-mail para redefinição</Label>
                            <Input
                              id="resetEmail"
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder="voce@empresa.com"
                            />
                            <div className="flex gap-2">
                              <Button type="button" onClick={handleResetPassword} disabled={loading}>
                                Enviar link
                              </Button>
                              <Button type="button" variant="secondary" onClick={() => setShowReset(false)} disabled={loading}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}

                        <Button type="button" className="w-full shadow-md" onClick={handleSignIn} disabled={loading || !canSubmitSignin}>
                          <span className="flex items-center justify-center gap-2">
                            {loading ? "Entrando..." : "Entrar"}
                            {!loading && <ArrowRight className="h-4 w-4" />}
                          </span>
                        </Button>
                      </TabsContent>

                      {/* CRIAR CONTA */}
                      <TabsContent value="signup" className="m-0 space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmar senha</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              autoComplete="new-password"
                              className="pr-10"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>

                          {confirmPassword.length > 0 && password !== confirmPassword && (
                            <p className="text-xs text-destructive">As senhas precisam ser iguais.</p>
                          )}
                        </div>

                        <Button type="button" className="w-full shadow-md" onClick={handleSignUp} disabled={loading || !canSubmitSignup}>
                          {loading ? "Criando..." : "Criar conta"}
                        </Button>

                        {signupSuccess && (
                          <div className="text-sm text-muted-foreground">
                            Não achou o e-mail? Verifique o spam ou{" "}
                            <button
                              className="underline"
                              onClick={handleResendConfirmation}
                              disabled={loading || !email.trim()}
                            >
                              reenviar confirmação
                            </button>
                            .
                          </div>
                        )}
                      </TabsContent>
                    </div>
                  </Tabs>

                  <div className="pt-2 text-center text-xs text-muted-foreground">
                    Ao continuar, você concorda com as políticas de uso da aplicação.
                  </div>
                </CardContent>
              </Card>

              {/* Rodapé pequeno para mobile/branding */}
              <div className="mt-4 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} NPS Dashboard • Todos os direitos reservados
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
