import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ variant?: "default" | "destructive"; title: string; description: string } | null>(null);

  const handleUpdate = async () => {
    setAlert(null);
    if (!password || password.length < 6) {
      setAlert({ variant: "destructive", title: "Senha fraca", description: "Use pelo menos 6 caracteres." });
      return;
    }
    if (password !== confirm) {
      setAlert({ variant: "destructive", title: "Senhas não conferem", description: "Digite a mesma senha nos dois campos." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setAlert({ variant: "destructive", title: "Erro", description: error.message });
        return;
      }
      setAlert({ variant: "default", title: "Senha atualizada", description: "Agora você já pode entrar com a nova senha." });
      setTimeout(() => navigate("/login", { replace: true }), 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>Defina uma nova senha para sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alert && (
            <Alert variant={alert.variant}>
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="p1">Nova senha</Label>
            <Input id="p1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="p2">Confirmar nova senha</Label>
            <Input id="p2" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </div>

          <Button className="w-full" onClick={handleUpdate} disabled={loading}>
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
