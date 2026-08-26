import { useState } from 'react';
import { Settings2, X } from 'lucide-react';
import { usePreferences } from '@/stores/preferencesStore';
import { AMBIENT_CONFIGS } from '@/constants/ambients';
import { cn } from '@/lib/utils';

export default function AtmosphereControls() {
  const [open, setOpen] = useState(false);
  const { ambient, reducedMotion, setAmbient, setReducedMotion } = usePreferences();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-white/60 hover:text-white transition-all text-xs"
        aria-label="Atmosphere settings"
      >
        <Settings2 size={13} />
        <span className="hidden sm:inline">Atmosphere</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-6 pb-10 sm:pb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-base">Atmosphere</h3>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Background</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {AMBIENT_CONFIGS.map((cfg) => (
                <button
                  key={cfg.id}
                  onClick={() => setAmbient(cfg.id as any)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border transition-all duration-200 text-sm',
                    ambient === cfg.id
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-white/8 bg-white/5 text-white/50 hover:bg-white/8 hover:text-white/80'
                  )}
                >
                  <span className="text-xl leading-none">{cfg.emoji}</span>
                  <span className="text-[11px] font-medium">{cfg.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between py-3 border-t border-white/8">
              <div>
                <p className="text-white/80 text-sm font-medium">Reduce Motion</p>
                <p className="text-white/40 text-xs">Disables animations and text reveal</p>
              </div>
              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-all duration-300',
                  reducedMotion ? 'bg-white/70' : 'bg-white/15'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300',
                  reducedMotion ? 'left-[22px]' : 'left-0.5'
                )} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
