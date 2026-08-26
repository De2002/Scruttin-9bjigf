import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type Step = 'email' | 'otp' | 'onboarding';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium',
  'Belize','Benin','Bolivia','Bosnia','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso',
  'Burundi','Cambodia','Cameroon','Canada','Chile','China','Colombia','Congo','Costa Rica',
  'Croatia','Cuba','Cyprus','Czech Republic','Denmark','Ecuador','Egypt','El Salvador',
  'Estonia','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany',
  'Ghana','Greece','Guatemala','Guinea','Haiti','Honduras','Hungary','Iceland','India',
  'Indonesia','Iran','Iraq','Ireland','Israel','Italy','Ivory Coast','Jamaica','Japan',
  'Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Liberia',
  'Libya','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Mali','Malta',
  'Mauritania','Mauritius','Mexico','Moldova','Mongolia','Montenegro','Morocco','Mozambique',
  'Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria',
  'North Korea','Norway','Oman','Pakistan','Palestine','Panama','Paraguay','Peru',
  'Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia',
  'Senegal','Serbia','Sierra Leone','Singapore','Slovakia','Slovenia','Somalia',
  'South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Sweden',
  'Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Togo','Trinidad',
  'Tunisia','Turkey','Turkmenistan','UAE','Uganda','UK','Ukraine','United Kingdom',
  'Uruguay','USA','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      if (!user.onboarded) setStep('onboarding');
      else navigate('/stream', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const sendOtp = async () => {
    if (!email.trim()) return setError('Enter your email');
    setError('');
    setSubmitting(true);
    const { error: e } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setSubmitting(false);
    if (e) return setError(e.message);
    setStep('otp');
    setResendCooldown(60);
  };

  const verifyOtp = async () => {
    if (otp.length < 4) return setError('Enter the 4-digit code');
    setError('');
    setSubmitting(true);
    const { data, error: e } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp,
      type: 'email',
    });
    setSubmitting(false);
    if (e) return setError(e.message);
    if (!data.user) return setError('Verification failed');
    // After verifyOtp, AuthContext will update user. Check if onboarded.
    // If profile has display_name+country set → skip onboarding
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, country, onboarded')
      .eq('id', data.user.id)
      .single();
    if (profile?.onboarded) {
      navigate('/stream', { replace: true });
    } else {
      setStep('onboarding');
    }
  };

  const completeOnboarding = async () => {
    if (!displayName.trim()) return setError('Enter your display name');
    if (!country) return setError('Select your country');
    setError('');
    setSubmitting(true);
    const { data: { user: su } } = await supabase.auth.getUser();
    if (!su) return setError('Session expired');

    const { error: e } = await supabase
      .from('user_profiles')
      .update({
        display_name: displayName.trim(),
        date_of_birth: dob || null,
        country,
        onboarded: true,
      })
      .eq('id', su.id);

    setSubmitting(false);
    if (e) return setError(e.message);
    navigate('/stream', { replace: true });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a12]">
        <Loader2 size={24} className="text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0a12] px-6">
      {/* Ambient gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 60%)' }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <svg width="22" height="15" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="text-white/90">
            <path d="M1 3 Q4 1 7 3 Q10 5 13 3 Q16 1 19 3 Q21 4 23 3" />
            <path d="M1 8 Q4 6 7 8 Q10 10 13 8 Q16 6 19 8 Q21 9 23 8" />
            <path d="M1 13 Q4 11 7 13 Q10 15 13 13 Q16 11 19 13 Q21 14 23 13" />
          </svg>
          <span className="text-white font-bold text-[17px] tracking-tight">Scruttin</span>
        </div>

        {/* Step: Email */}
        {step === 'email' && (
          <div>
            <h1 className="text-white font-bold text-2xl mb-1.5">Join the conversation.</h1>
            <p className="text-white/40 text-sm mb-8 leading-relaxed">
              Enter your email and we'll send you a code to sign in.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="your@email.com"
                autoComplete="email"
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                className="w-full bg-white/6 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
              {error && <p className="text-rose-400 text-xs">{error}</p>}
              <button
                onClick={sendOtp}
                disabled={submitting || !email.trim()}
                className={cn(
                  'w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                  email.trim() && !submitting
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                )}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Continue <ArrowRight size={15} /></>}
              </button>
            </div>
            <button onClick={() => navigate('/')} className="mt-6 flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors">
              <ArrowLeft size={12} /> Back to home
            </button>
          </div>
        )}

        {/* Step: OTP */}
        {step === 'otp' && (
          <div>
            <button onClick={() => setStep('email')} className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs mb-8 transition-colors">
              <ArrowLeft size={12} /> Back
            </button>
            <h1 className="text-white font-bold text-2xl mb-1.5">Check your email.</h1>
            <p className="text-white/40 text-sm mb-2 leading-relaxed">
              We sent a 4-digit code to
            </p>
            <p className="text-white/70 text-sm font-medium mb-8">{email}</p>

            <div className="space-y-3">
              <input
                type="text"
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                placeholder="4-digit code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoComplete="one-time-code"
                onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                className="w-full bg-white/6 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 text-center tracking-[0.5em] font-mono text-xl transition-colors"
              />
              {error && <p className="text-rose-400 text-xs">{error}</p>}
              <button
                onClick={verifyOtp}
                disabled={submitting || otp.length < 4}
                className={cn(
                  'w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                  otp.length === 4 && !submitting
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                )}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Verify <ArrowRight size={15} /></>}
              </button>
              <button
                onClick={() => { setOtp(''); sendOtp(); }}
                disabled={resendCooldown > 0}
                className="w-full py-2 text-white/30 hover:text-white/60 text-xs transition-colors disabled:opacity-40"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Onboarding */}
        {step === 'onboarding' && (
          <div>
            <h1 className="text-white font-bold text-2xl mb-1.5">Almost there.</h1>
            <p className="text-white/40 text-sm mb-8 leading-relaxed">
              Tell us a little about yourself.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-[10px] uppercase tracking-widest font-medium block mb-1.5">Display Name *</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => { setDisplayName(e.target.value); setError(''); }}
                  placeholder="How should people know you?"
                  className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="text-white/40 text-[10px] uppercase tracking-widest font-medium block mb-1.5">Country *</label>
                <select
                  value={country}
                  onChange={e => { setCountry(e.target.value); setError(''); }}
                  className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors appearance-none"
                  style={{ color: country ? 'white' : 'rgba(255,255,255,0.25)' }}
                >
                  <option value="" disabled style={{ background: '#0a0a12' }}>Where are you from?</option>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c} style={{ background: '#0a0a12', color: 'white' }}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-[10px] uppercase tracking-widest font-medium block mb-1.5">Date of Birth <span className="normal-case text-white/20">(optional)</span></label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              {error && <p className="text-rose-400 text-xs">{error}</p>}
              <button
                onClick={completeOnboarding}
                disabled={submitting || !displayName.trim() || !country}
                className={cn(
                  'w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-2',
                  displayName.trim() && country && !submitting
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                )}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Enter the stream <ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
