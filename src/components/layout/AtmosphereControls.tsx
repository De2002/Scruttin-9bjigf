/**
 * AtmosphereControls — top-bar icon set:
 * - Atmosphere picker (opens sheet)
 * - Music toggle with playing rings
 *
 * Used in stream/dive/open/me pages header.
 */
import { useState, useEffect } from 'react';
import { Settings2, X, Music2 } from 'lucide-react';
import { usePreferences } from '@/stores/preferencesStore';
import { AMBIENT_CONFIGS, COLOR_BACKGROUNDS } from '@/constants/ambients';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface CustomAtmosphere { id: string; label: string; emoji: string; }

export default function AtmosphereControls() {
  const [open, setOpen] = useState(false);
  const { ambient, reducedMotion, setAmbient, setReducedMotion, musicEnabled, setMusicEnabled } = usePreferences();
  const [customAtmospheres, setCustomAtmospheres] = useState<CustomAtmosphere[]>([]);

  useEffect(() => {
    supabase.from('atmosphere_clips').select('id, label, emoji').eq('is_active', true)
      .then(({ data }) => setCustomAtmospheres(data ?? []));
  }, []);

  const allAtmospheres = [
    ...AMBIENT_CONFIGS,
    ...COLOR_BACKGROUNDS,
    ...customAtmospheres.map(a => ({ id: a.id, label: a.label, emoji: a.emoji, videoUrl: '', overlayOpacity: 0.65, overlayColor: '10,10,10', accentColor: '#fff' })),
  ];

  return (
    <div className="flex items-center gap-1">
      {/* Music toggle */}
      <button
        onClick={() => setMusicEnabled(!musicEnabled)}
        className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-full transition-all',
          musicEnabled ? 'text-white/70' : 'text-white/25 hover:text-white/50'
        )}
        title={musicEnabled ? 'Music on — tap to mute' : 'Music off — tap to enable'}
        aria-label={musicEnabled ? 'Mute music' : 'Enable music'}
      >
        <Music2 size={15} />
        {musicEnabled && (
          <>
            <span className="absolute inset-0 rounded-full border border-white/20 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
            <span className="absolute inset-[-4px] rounded-full border border-white/10 animate-ping pointer-events-none" style={{ animationDuration: '2.8s' }} />
          </>
        )}
      </button>

      {/* Atmosphere settings */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 glass px-2.5 py-1.5 rounded-full text-white/60 hover:text-white transition-all text-xs"
        aria-label="Atmosphere settings"
      >
        <Settings2 size={13} />
        <span className="hidden sm:inline">Atmosphere</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="atmosphere-title"
            className="relative glass max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:max-w-sm sm:rounded-3xl sm:p-6 p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 id="atmosphere-title" className="text-white font-semibold text-base">Atmosphere</h3>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Background</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {allAtmospheres.map((cfg) => (
                <button
                  key={cfg.id}
                  onClick={() => { setAmbient(cfg.id as never); setOpen(false); }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border transition-all duration-200 text-sm',
                    ambient === cfg.id
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-white/8 bg-white/5 text-white/50 hover:bg-white/8 hover:text-white/80'
                  )}
                >
                  {cfg.id.startsWith('color-') ? (
                    <span className="h-10 w-full rounded-xl border border-white/10" style={{ backgroundColor: `rgb(${cfg.overlayColor})` }} aria-hidden="true" />
                  ) : (
                    <span className="text-xl leading-none">{cfg.emoji}</span>
                  )}
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
    </div>
  );
}
