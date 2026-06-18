"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowRight } from "lucide-react";

export function Login() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0b4867] relative overflow-hidden font-app">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-[#1378ac]/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-[#11b5a2]/20 blur-[100px] rounded-full" />
      
      <div className="w-full max-w-md bg-white p-12 rounded-[3rem] shadow-2xl relative z-10 border border-white/20 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="h-20 w-20 bg-[#1378ac] rounded-3xl flex items-center justify-center text-white text-4xl shadow-xl shadow-[#1378ac]/30">
            🛡️
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-[#0b4867] tracking-tight">Suite de Stérilisation</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Accès Sécurisé • V2.5.0</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate("/dashboard"); }}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Identifiant</label>
              <input 
                type="text" 
                placeholder="amina.benali" 
                className="w-full bg-slate-50 border-2 border-[#d5e2ea] rounded-2xl p-4 text-xs font-black text-[#0b4867] focus:border-[#1378ac] outline-none transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Mot de passe</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-slate-50 border-2 border-[#d5e2ea] rounded-2xl p-4 text-xs font-black text-[#0b4867] focus:border-[#1378ac] outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100 mb-2">
            <ShieldAlert className="w-4 h-4 text-orange-500 shrink-0" />
            <p className="text-[9px] font-bold text-orange-600 uppercase tracking-wider">Session limitée à 8h • Zone Contrôlée</p>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-[#1378ac] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-lg shadow-[#1378ac]/20 hover:bg-[#0b4867] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            S'authentifier
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center mt-10 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          Modoock Health Digital Solutions © 2026
        </p>
      </div>
    </div>
  );
}
