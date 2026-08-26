import { useState } from 'react';
import type { Scrut } from '@/types';
import { cn, timeAgo } from '@/lib/utils';
import UserAvatar from './UserAvatar';
import TextReveal from './TextReveal';
import VoiceScrutCard from './VoiceScrutCard';
import ResonatesButton from './ResonatesButton';
import ReportModal from './ReportModal';
import { Flag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  scrut: Scrut;
  showPosition?: boolean;
  onRevealComplete?: () => void;
  className?: string;
  /** Called when the user taps the avatar on a TEXT scrut */
  onAvatarClick?: (scrut: Scrut) => void;
  /** Wire autoplay voice from stream preference */
  autoPlayVoice?: boolean;
}

const positionLabel: Record<string, string> = {
  agree: 'Agrees', unsure: 'Unsure', disagree: 'Disagrees',
};
const positionColor: Record<string, string> = {
  agree: 'text-emerald-400', unsure: 'text-amber-400', disagree: 'text-rose-400',
};

const COUNTRY_ISO: Record<string, string> = {
  Nigeria: 'ng', Brazil: 'br', UK: 'gb', 'United Kingdom': 'gb', Ghana: 'gh', Japan: 'jp',
  Italy: 'it', India: 'in', Mexico: 'mx', Morocco: 'ma', Germany: 'de', USA: 'us',
  'United States': 'us', China: 'cn', France: 'fr', Spain: 'es', Canada: 'ca',
  Australia: 'au', Argentina: 'ar', 'South Africa': 'za', Kenya: 'ke', Egypt: 'eg',
  Turkey: 'tr', Indonesia: 'id', Pakistan: 'pk', Bangladesh: 'bd', Philippines: 'ph',
  Vietnam: 'vn', Iran: 'ir', Thailand: 'th', Ethiopia: 'et', Tanzania: 'tz',
  Colombia: 'co', Chile: 'cl', Peru: 'pe', Venezuela: 've', Ecuador: 'ec', Bolivia: 'bo',
  Sweden: 'se', Norway: 'no', Denmark: 'dk', Finland: 'fi', Netherlands: 'nl',
  Belgium: 'be', Switzerland: 'ch', Austria: 'at', Poland: 'pl', Portugal: 'pt',
  Greece: 'gr', Ukraine: 'ua', Russia: 'ru', 'South Korea': 'kr', 'Saudi Arabia': 'sa',
  Iraq: 'iq', Syria: 'sy', Jordan: 'jo', Lebanon: 'lb', Israel: 'il', UAE: 'ae',
  'United Arab Emirates': 'ae', Qatar: 'qa', Kuwait: 'kw', Oman: 'om', Yemen: 'ye',
  Uganda: 'ug', Rwanda: 'rw', 'Ivory Coast': 'ci', Senegal: 'sn', Cameroon: 'cm',
};

function getMapUrl(country: string | undefined): string | null {
  if (!country) return null;
  const iso = COUNTRY_ISO[country];
  return iso ? `https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${iso}/256.png` : null;
}

function wordCount(text: string | null | undefined): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

export default function ScrutCard({ scrut, showPosition, onRevealComplete, className, onAvatarClick, autoPlayVoice = false }: Props) {
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const mapUrl = getMapUrl(scrut.user.country);

  // ── Voice only ──────────────────────────────────────────────────────────
  if (scrut.type === 'voice') {
    return (
      <div className={cn('scrut-enter', className)}>
        <VoiceScrutCard
          duration={scrut.audio_duration ?? 30}
          user={scrut.user}
          scrutId={scrut.id}
          audioUrl={scrut.audio_url}
          autoPlay={autoPlayVoice}
          showUser
        />
        <div className="flex items-center justify-between mt-4">
          <ResonatesButton
            scrutId={scrut.id}
            initialCount={scrut.resonate_count ?? 0}
            initialResonated={scrut.resonated_by_me ?? false}
          />
          <div className="flex items-center gap-2">
            <span className="text-white/25 text-[11px]">{timeAgo(scrut.created_at)}</span>
            {user && (
              <button onClick={() => setReportOpen(true)} className="text-white/20 hover:text-rose-400/70 p-1 rounded-lg transition-colors">
                <Flag size={11} />
              </button>
            )}
          </div>
        </div>
        {reportOpen && <ReportModal scrutId={scrut.id} onClose={() => setReportOpen(false)} />}
      </div>
    );
  }

  // ── Text ────────────────────────────────────────────────────────────────
  const wc = wordCount(scrut.text);
  const isShort = wc < 30;
  const avatarPx = isShort ? 56 : 40;
  const floatWidth = avatarPx + 10;

  return (
    <div className={cn('scrut-enter', className)}>
      <div className="overflow-hidden relative">
        {mapUrl && (
          <img src={mapUrl} alt="" aria-hidden
            className="absolute inset-0 m-auto pointer-events-none select-none"
            style={{ width: isShort ? 110 : 140, height: isShort ? 110 : 140, objectFit: 'contain', opacity: 0.055, filter: 'invert(1) blur(0.4px)', zIndex: 0 }}
          />
        )}

        {/* Floating avatar — tap opens profile sheet */}
        <div className="float-left mr-3 mb-2 flex flex-col items-center relative" style={{ width: floatWidth, zIndex: 1 }}>
          <button
            type="button"
            aria-label={`View ${scrut.user.display_name ?? 'user'} profile`}
            onClick={(e) => { e.stopPropagation(); onAvatarClick?.(scrut); }}
            className="cursor-pointer rounded-xl transition-opacity hover:opacity-80 active:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <UserAvatar user={scrut.user} size={isShort ? 'xl' : 'md'} shape="square" />
          </button>
          <p className="text-white/65 font-medium text-center mt-1.5 leading-tight w-full truncate px-0.5" style={{ fontSize: isShort ? 11 : 10 }}>
            {scrut.user.display_name?.split(' ')[0] ?? '?'}
          </p>
          {scrut.user.country && (
            <p className="text-white/30 text-center leading-none mt-0.5" style={{ fontSize: 9 }}>
              {scrut.user.country}
            </p>
          )}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {showPosition && scrut.position && (
            <p className={cn('text-xs font-medium mb-1.5', positionColor[scrut.position])}>
              {positionLabel[scrut.position]}
            </p>
          )}
          {scrut.text && (
            <TextReveal
              text={scrut.text}
              onComplete={onRevealComplete}
              className="text-white/85 leading-[1.65] font-serif"
              style={{ fontSize: isShort ? 17 : 15 }}
            />
          )}
        </div>
      </div>

      <div className="clear-both mt-4 flex items-center justify-between">
        <ResonatesButton
          scrutId={scrut.id}
          initialCount={scrut.resonate_count ?? 0}
          initialResonated={scrut.resonated_by_me ?? false}
        />
        <div className="flex items-center gap-2">
          <span className="text-white/25 text-[11px]">{timeAgo(scrut.created_at)}</span>
          {user && (
            <button onClick={() => setReportOpen(true)} className="text-white/20 hover:text-rose-400/70 p-1 rounded-lg transition-colors">
              <Flag size={11} />
            </button>
          )}
        </div>
      </div>
      {reportOpen && <ReportModal scrutId={scrut.id} onClose={() => setReportOpen(false)} />}
    </div>
  );
}
