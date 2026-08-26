import { useEffect, useRef, useState } from 'react';
import { Globe, ExternalLink, X } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import type { Scrut } from '@/types';

interface Props {
  scrut: Scrut;
  onClose: () => void;
}

/** Same ISO map used in ScrutCard */
const COUNTRY_ISO: Record<string, string> = {
  Nigeria:'ng', Brazil:'br', UK:'gb', 'United Kingdom':'gb', Ghana:'gh', Japan:'jp',
  Italy:'it', India:'in', Mexico:'mx', Morocco:'ma', Germany:'de', USA:'us',
  'United States':'us', China:'cn', France:'fr', Spain:'es', Canada:'ca',
  Australia:'au', Argentina:'ar', 'South Africa':'za', Kenya:'ke', Egypt:'eg',
  Turkey:'tr', Indonesia:'id', Pakistan:'pk', Bangladesh:'bd', Philippines:'ph',
  Vietnam:'vn', Iran:'ir', Thailand:'th', Ethiopia:'et', Tanzania:'tz',
  Colombia:'co', Chile:'cl', Peru:'pe', Venezuela:'ve', Ecuador:'ec', Bolivia:'bo',
  Sweden:'se', Norway:'no', Denmark:'dk', Finland:'fi', Netherlands:'nl',
  Belgium:'be', Switzerland:'ch', Austria:'at', Poland:'pl', Portugal:'pt',
  Greece:'gr', Ukraine:'ua', Russia:'ru', 'South Korea':'kr', 'Saudi Arabia':'sa',
  Iraq:'iq', Syria:'sy', Jordan:'jo', Lebanon:'lb', Israel:'il', UAE:'ae',
  'United Arab Emirates':'ae', Qatar:'qa', Kuwait:'kw', Oman:'om', Yemen:'ye',
};

function getMapUrl(country: string | undefined) {
  if (!country) return null;
  const iso = COUNTRY_ISO[country];
  return iso ? `https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${iso}/256.png` : null;
}

function ensureHttps(url: string) {
  return url.startsWith('http') ? url : `https://${url}`;
}

export default function ScrutDetailSheet({ scrut, onClose }: Props) {
  const { user } = scrut;
  const mapUrl = getMapUrl(user.country);

  // Sheet drag-to-dismiss
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const [dragDy, setDragDy] = useState(0);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // mount → trigger slide-in
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const triggerClose = () => {
    setClosing(true);
    setTimeout(onClose, 340);
  };

  // Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) setDragDy(dy);
  };
  const onTouchEnd = () => {
    isDragging.current = false;
    if (dragDy > 80) {
      triggerClose();
    } else {
      setDragDy(0);
    }
  };

  // Mouse drag (desktop)
  const onMouseDown = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    isDragging.current = true;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dy = e.clientY - dragStartY.current;
    if (dy > 0) setDragDy(dy);
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (dragDy > 80) {
      triggerClose();
    } else {
      setDragDy(0);
    }
  };

  const initials = user.display_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const sheetY = closing ? '100%' : !mounted ? '100%' : `${dragDy}px`;

  return (
    /* Backdrop */
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-end',
        'transition-all duration-300',
        mounted && !closing ? 'bg-black/55' : 'bg-black/0'
      )}
      onClick={(e) => { if (e.target === e.currentTarget) triggerClose(); }}
    >
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="pointer-events-auto relative w-full max-w-lg mx-auto max-h-[calc(100dvh-0.5rem)] overflow-y-auto overscroll-contain"
        style={{
          transform: `translateY(${sheetY})`,
          transition: isDragging.current ? 'none' : 'transform 0.38s cubic-bezier(0.16,1,0.3,1)',
          willChange: 'transform',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {/* Sheet body */}
        <div
          className="relative rounded-t-3xl overflow-hidden"
          style={{
            background: 'rgba(14, 14, 22, 0.97)',
            backdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Country map — large watermark fills the top area */}
          {mapUrl && (
            <img
              src={mapUrl}
              alt=""
              aria-hidden
              className="absolute pointer-events-none select-none"
              style={{
                width: 320,
                height: 320,
                objectFit: 'contain',
                opacity: 0.045,
                filter: 'invert(1)',
                top: -40,
                right: -40,
                zIndex: 0,
              }}
            />
          )}

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 relative z-10 cursor-grab active:cursor-grabbing">
            <div className="w-9 h-1 rounded-full bg-white/15" />
          </div>

          {/* Close button */}
          <button
            onClick={triggerClose}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-white/30 hover:text-white/70 hover:bg-white/8 transition-all"
          >
            <X size={15} />
          </button>

          {/* Content */}
          <div className="relative z-10 px-6 pt-4 pb-8">
            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-16 h-16 rounded-full object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/70 font-semibold text-xl">
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-white font-semibold text-[18px] leading-tight truncate">
                  {user.display_name}
                </h2>
                {(user.city || user.country) && (
                  <p className="flex items-center gap-1.5 text-white/40 text-[13px] mt-1">
                    <Globe size={11} strokeWidth={1.5} />
                    {user.city ? `${user.city}, ${user.country}` : user.country}
                  </p>
                )}
              </div>
            </div>

            {/* Thin rule */}
            <div className="border-t border-white/7 mb-5" />

            {/* Bio */}
            {user.bio && (
              <p className="text-white/68 text-[15px] font-serif leading-[1.7] mb-5">
                {user.bio}
              </p>
            )}

            {/* Scrut timestamp */}
            <p className="text-white/25 text-[11px] tracking-wide mb-5 uppercase font-medium">
              Scrut from {timeAgo(scrut.created_at)}
            </p>

            {/* Links */}
            {(user.website || user.twitter || user.instagram) && (
              <div className="flex flex-wrap gap-2">
                {user.website && (
                  <a
                    href={ensureHttps(user.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5
                               text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/8
                               text-xs font-medium transition-all"
                  >
                    <ExternalLink size={11} />
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {user.twitter && (
                  <a
                    href={`https://x.com/${user.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5
                               text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/8
                               text-xs font-medium transition-all"
                  >
                    {/* X / Twitter icon */}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.84L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    @{user.twitter}
                  </a>
                )}
                {user.instagram && (
                  <a
                    href={`https://instagram.com/${user.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5
                               text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/8
                               text-xs font-medium transition-all"
                  >
                    {/* Instagram icon */}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                    </svg>
                    @{user.instagram}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
