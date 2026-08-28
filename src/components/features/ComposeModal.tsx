/**
 * ComposeModal — contextual composer with live topics from DB + GIF/sticker attachment.
 */
import { useState, useEffect, useRef } from 'react';
import { X, Mic2, Type, ArrowRight, Loader2, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import RecordingModal from './RecordingModal';
import { toast } from 'sonner';
import type { ConversationStarter } from '@/types';

type Mode = 'question' | 'statement' | 'open';
type Format = 'voice' | 'text';

interface Props {
  onClose: () => void;
  defaultMode?: Mode;
  contextConversation?: ConversationStarter;
  onPosted?: () => void;
}

const DEFAULT_TOPICS = ['Life', 'Relationships', 'Work', 'Money', 'Technology', 'Culture', 'Family', 'Society', 'Fun'];

export default function ComposeModal({ onClose, defaultMode = 'question', contextConversation, onPosted }: Props) {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [format, setFormat] = useState<Format>('text');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState('Life');
  const [position, setPosition] = useState<'agree' | 'unsure' | 'disagree' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showRecording, setShowRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [topics, setTopics] = useState<string[]>(DEFAULT_TOPICS);

  // Attachment state
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const attachInputRef = useRef<HTMLInputElement>(null);

  // Load topics from DB
  useEffect(() => {
    supabase.from('topics').select('label').order('sort_order').then(({ data }) => {
      if (data && data.length > 0) {
        setTopics(data.map((t: { label: string }) => t.label));
        setTopic(data[0].label);
      }
    });
  }, []);

  const isResponse = !!contextConversation;
  const isStarter = !isResponse && mode !== 'open';

  const sheetTitle =
    isResponse
      ? contextConversation.type === 'statement' ? 'Scrut your response' : 'Scrut your answer'
      : mode === 'question' ? 'Ask the crowd'
      : mode === 'statement' ? 'Make a statement'
      : 'Say it';

  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 4 * 1024 * 1024) { toast.error('Attachment must be under 4 MB'); return; }
    setAttachmentUploading(true);
    const ext = file.name.split('.').pop() ?? 'gif';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('scrut-attachments')
      .upload(path, file, { contentType: file.type, upsert: false });
    setAttachmentUploading(false);
    if (error) { toast.error(error.message); return; }
    const { data: { publicUrl } } = supabase.storage.from('scrut-attachments').getPublicUrl(data.path);
    setAttachmentUrl(publicUrl);
    // Clear input so same file can be re-selected if user removes and re-adds
    if (attachInputRef.current) attachInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!user) return toast.error('Sign in to post');
    if (format === 'text' && !body.trim()) return;
    if (format === 'voice' && !audioUrl) return toast.error('Record your take first');

    setSubmitting(true);

    const base = {
      user_id: user.id,
      type: format,
      text: format === 'text' ? body.trim() : null,
      audio_url: format === 'voice' ? audioUrl : null,
      audio_duration: format === 'voice' ? audioDuration : null,
      attachment_url: attachmentUrl ?? null,
    };

    if (isResponse && contextConversation) {
      const { error } = await supabase.from('scruts').insert({
        ...base,
        conversation_id: contextConversation.id,
        position: contextConversation.type === 'statement' ? position : null,
      });
      if (error) { toast.error(error.message); setSubmitting(false); return; }
    } else if (mode === 'open') {
      const { error } = await supabase.from('scruts').insert(base);
      if (error) { toast.error(error.message); setSubmitting(false); return; }
    } else {
      const { error } = await supabase.from('conversations').insert({
        user_id: user.id,
        type: mode,
        body: body.trim(),
        topic,
        is_platform: false,
      });
      if (error) { toast.error(error.message); setSubmitting(false); return; }
    }

    setSubmitting(false);
    setSubmitted(true);
    onPosted?.();
    setTimeout(onClose, 2000);
  };

  const placeholder =
    isResponse
      ? contextConversation?.type === 'statement' ? 'Share your stance…' : 'Give your answer…'
      : mode === 'question' ? 'What do you want to ask the world?'
      : mode === 'statement' ? 'Put something to the world…'
      : "What's on your mind?";

  const submitLabel =
    isResponse ? 'Post Scrut'
    : mode === 'question' ? 'Ask'
    : mode === 'statement' ? 'State'
    : 'Post';

  if (!user) {
    return (
      <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 pb-10 sm:pb-6 text-center">
          <div className="text-3xl mb-4">🎙</div>
          <h3 className="text-white font-semibold mb-2">Sign in to post</h3>
          <p className="text-white/40 text-sm mb-5">Join Scruttin to give your take and ask questions.</p>
          <button onClick={() => { onClose(); window.location.href = '/auth'; }}
            className="w-full py-3 rounded-2xl bg-white text-black font-semibold text-sm">Sign in</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative glass rounded-3xl p-8 text-center max-w-xs w-full">
          <div className="text-4xl mb-4">{isResponse ? '💬' : mode === 'question' ? '🎙' : mode === 'statement' ? '📣' : '💬'}</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            {isResponse ? 'Your take is out there.'
              : mode === 'question' ? 'Your question is in the crowd.'
              : mode === 'statement' ? "It's out there."
              : 'Said.'}
          </h3>
          {isResponse && contextConversation && (
            <p className="text-white/40 text-sm">
              Added to "{contextConversation.body.slice(0, 48)}{contextConversation.body.length > 48 ? '…' : ''}"
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* z-[400] — above BottomNav (z-10) and content, below report modal (z-[500]) */}
      <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-4" data-no-swipe>
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
        <div
          className="relative glass max-h-[calc(100dvh-0.5rem)] w-full overflow-y-auto overscroll-contain rounded-t-3xl sm:max-w-md sm:rounded-3xl"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-base">{sheetTitle}</h3>
                {!isResponse && mode === 'question' && (
                  <p className="text-white/30 text-[11px] mt-0.5">Goes to From the Crowd</p>
                )}
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            {/* Context pill */}
            {isResponse && contextConversation && (
              <div className="mb-4 flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8">
                <div className="shrink-0 w-0.5 self-stretch bg-white/20 rounded-full mt-0.5" style={{ minHeight: 20 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white/35 text-[10px] uppercase tracking-widest font-medium mb-0.5">
                    {contextConversation.is_platform ? 'Scruttin asks'
                      : contextConversation.type === 'statement' ? 'Statement'
                      : `${contextConversation.user.display_name} asks`}
                  </p>
                  <p className="text-white/70 text-[13px] font-serif leading-snug line-clamp-2 italic">
                    {contextConversation.type === 'statement'
                      ? `"${contextConversation.body}"`
                      : contextConversation.body}
                  </p>
                </div>
              </div>
            )}

            {/* Mode tabs */}
            {!isResponse && (
              <div className="flex gap-1 mb-4 p-1 bg-white/5 rounded-xl">
                {(['question', 'statement', 'open'] as Mode[]).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                      mode === m ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/60')}>
                    {m === 'question' ? 'Ask' : m === 'statement' ? 'State' : 'Open'}
                  </button>
                ))}
              </div>
            )}

            {/* Statement stance */}
            {isResponse && contextConversation?.type === 'statement' && (
              <div className="mb-4">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-medium">Your stance</p>
                <div className="flex gap-2">
                  {[{ value: 'agree', label: 'Agree' }, { value: 'unsure', label: 'Unsure' }, { value: 'disagree', label: 'Disagree' }].map(opt => (
                    <button key={opt.value}
                      onClick={() => setPosition(opt.value as 'agree' | 'unsure' | 'disagree')}
                      className={cn('flex-1 py-1.5 rounded-full border text-xs font-medium transition-all',
                        position === opt.value ? 'bg-white/15 border-white/30 text-white' : 'border-white/12 bg-white/5 text-white/50 hover:bg-white/10')}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Format toggle */}
            <div className="flex gap-2 mb-4">
              {(['text', 'voice'] as Format[]).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-all',
                    format === f ? 'border-white/25 bg-white/10 text-white' : 'border-white/8 bg-white/4 text-white/40 hover:bg-white/8 hover:text-white/70')}>
                  {f === 'voice' ? <><Mic2 size={12} /> Voice</> : <><Type size={12} /> Text</>}
                </button>
              ))}
            </div>

            {/* Text input + attachment */}
            {format === 'text' && (
              <>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  maxLength={300}
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-3 text-white placeholder-[rgba(255,255,255,0.25)] text-sm resize-none focus:outline-none focus:border-[rgba(255,255,255,0.25)] font-serif leading-relaxed"
                />
                <div className="flex items-center justify-between mt-1 mb-4">
                  <span className="text-white/25 text-[10px]">{body.length} / 300</span>
                  {/* Tiny attachment button — secondary, unobtrusive */}
                  <div className="flex items-center gap-2">
                    {attachmentUploading && (
                      <Loader2 size={11} className="text-white/25 animate-spin" />
                    )}
                    {attachmentUrl && (
                      <div className="flex items-center gap-1.5">
                        <img
                          src={attachmentUrl}
                          alt="attachment preview"
                          className="w-7 h-7 rounded-md object-cover opacity-70"
                        />
                        <button
                          type="button"
                          onClick={() => setAttachmentUrl(null)}
                          className="text-white/20 hover:text-white/50 text-[10px] transition-colors"
                          aria-label="Remove attachment"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {!attachmentUrl && !attachmentUploading && (
                      <label className="cursor-pointer flex items-center gap-1 text-white/20 hover:text-white/40 transition-colors" title="Attach a GIF or sticker">
                        <Paperclip size={12} />
                        <span className="text-[10px]">GIF</span>
                        <input
                          ref={attachInputRef}
                          type="file"
                          accept="image/gif,image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleAttachment}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Voice recording */}
            {format === 'voice' && (
              <div className="mb-4">
                {audioUrl ? (
                  <div className="space-y-2 p-3 bg-[rgba(255,255,255,0.05)] rounded-2xl border border-[rgba(255,255,255,0.1)]">
                    <audio src={audioUrl} controls className="w-full h-8" style={{ filter: 'invert(1) opacity(0.6)' }} />
                    <button onClick={() => { setAudioUrl(null); setAudioDuration(null); setShowRecording(true); }}
                      className="w-full py-2 text-white/40 hover:text-white text-xs transition-colors">Re-record</button>
                  </div>
                ) : (
                  <button onClick={() => setShowRecording(true)}
                    className="w-full py-3 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-white/60 hover:bg-[rgba(255,255,255,0.1)] text-sm flex items-center justify-center gap-2 transition-colors">
                    <Mic2 size={15} className="text-rose-400" />
                    Tap to record
                  </button>
                )}
              </div>
            )}

            {/* Topics */}
            {isStarter && topics.length > 0 && (
              <div className="mb-4">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">Topic</p>
                <div className="flex flex-wrap gap-1.5">
                  {topics.map(t => (
                    <button key={t} onClick={() => setTopic(t)}
                      className={cn('px-2.5 py-1 rounded-full text-xs transition-all',
                        topic === t ? 'bg-white/15 text-white border border-white/25' : 'bg-white/5 text-white/40 border border-white/8 hover:bg-white/10 hover:text-white/70')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || (format === 'text' ? !body.trim() : !audioUrl)}
              className={cn(
                'w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 mb-2',
                (format === 'text' ? body.trim() : audioUrl) && !submitting
                  ? 'bg-white text-black hover:bg-white/90 active:scale-[0.98]'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              )}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <>{submitLabel} <ArrowRight size={15} /></>}
            </button>
          </div>
        </div>
      </div>

      {showRecording && (
        <RecordingModal
          onRecorded={(url, dur) => { setAudioUrl(url); setAudioDuration(dur); setShowRecording(false); }}
          onCancel={() => setShowRecording(false)}
        />
      )}
    </>
  );
}
