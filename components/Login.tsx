"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowRight, Cross, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    const ok = await login(username);
    setLoading(false);
    if (ok) {
      navigate("/dashboard");
    } else {
      setLoginError("Identifiant introuvable. Vérifiez votre identifiant et réessayez.");
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-primary relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-white/5 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-white/5 blur-[100px] rounded-full" />

      <div className="w-full max-w-md bg-card p-10 rounded-xl border border-border shadow-lg relative z-10">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="size-14 bg-primary rounded-xl flex items-center justify-center">
            <Cross className="size-7 text-primary-foreground" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Suite de Stérilisation</h1>
            <p className="text-xs text-muted-foreground">Modoock Health • Accès Sécurisé</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Identifiant</label>
              <input
                type="text"
                placeholder="Amina Benali"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setLoginError(""); }}
                className="w-full h-10 bg-muted border border-input rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-10 bg-muted border border-input rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {loginError ? (
            <div className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <AlertCircle className="size-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive font-medium">{loginError}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-warning-muted rounded-lg border border-warning/20">
              <ShieldAlert className="size-4 text-warning shrink-0" />
              <p className="text-xs text-warning font-medium">Session limitée à 8h • Zone Contrôlée</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="interactive-primary w-full h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">Vérification...</span>
            ) : (
              <>S&apos;authentifier <ArrowRight className="size-4" /></>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-muted-foreground">
          Modoock Health Digital Solutions © 2026
        </p>
      </div>
    </div>
  );
}
