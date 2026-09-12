import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, CheckCircle2, Copy } from 'lucide-react';

export function RemoteModal({ isOpen, onClose, pin }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {/* Luz ambiental esmeralda */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Smartphone size={32} />
          </div>

          <h3 className="text-2xl font-black text-white mb-2">Controlar desde Celular</h3>
          <p className="text-sm text-slate-400 mb-6">
            Abre la app en tu celular en la misma red o navegador para lanzar partidos a tu televisor al instante.
          </p>

          {/* Código PIN Grande */}
          <div 
            onClick={copyCode}
            className="bg-black/60 border border-white/10 hover:border-emerald-500/50 cursor-pointer rounded-2xl p-4 mb-6 transition-all"
          >
            <span className="text-xs uppercase font-extrabold text-slate-400 tracking-widest block mb-1">
              TU CÓDIGO DE VINCULACIÓN
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-black tracking-widest text-emerald-400 font-mono">
                {pin}
              </span>
              <Copy size={18} className="text-slate-500 hover:text-white" />
            </div>
            {copied && <span className="text-xs text-emerald-400 font-bold block mt-1">¡Copiado!</span>}
          </div>

          <div className="text-xs text-slate-300 bg-white/5 border border-white/10 p-3 rounded-xl mb-6 text-left flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Toca cualquier partido en tu teléfono y la tele arrancará la transmisión de forma sincronizada.
            </span>
          </div>

          <button
            type="button"
            className="btn-luxury-primary w-full py-3"
            onClick={onClose}
          >
            Entendido, Volver a la TV
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
