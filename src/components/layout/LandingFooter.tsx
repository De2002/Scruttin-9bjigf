import { useState } from 'react';
import { Mail, ExternalLink, ShieldCheck, FileText, Info, BookOpen, Check, Copy, Twitter, Music } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export type PolicySection = 'about' | 'guidelines' | 'terms' | 'privacy';

interface PolicyContent {
  title: string;
  subtitle: string;
  icon: typeof Info;
  content: React.ReactNode;
}

const POLICIES: Record<PolicySection, PolicyContent> = {
  about: {
    title: 'About Scruttin',
    subtitle: 'A quiet sanctuary for authentic self-recordings and genuine human perspectives.',
    icon: Info,
    content: (
      <div className="space-y-4 text-sm text-[#45433E] leading-relaxed">
        <p>
          <strong>Scruttin</strong> was built on a simple premise: social feeds became stages for polished performance, algorithms rewarded outrage, and the real voices of everyday people became drowned out in optimized noise.
        </p>
        <p>
          Instead of professional crews with cameras, Scruttin is powered by real individuals worldwide. Anyone can sign up, explore evocative community questions, and record themselves directly from wherever they are—sharing raw audio dispatches and candid written reflections called <em>ruts</em>.
        </p>
        <div className="p-3.5 rounded-lg bg-[#F5F4EE] border border-[#E8E5DC] space-y-1.5 text-xs text-[#52504A]">
          <div className="font-semibold text-[#191918] font-mono uppercase tracking-wider text-[11px]">
            The Once-in-a-Lifetime Philosophy
          </div>
          <p>
            In the Stream, once an audio or written rut passes, you cannot bookmark, replay, or hoard it. You listen with full presence, just as you would when hearing someone speak their mind in the moment.
          </p>
        </div>
        <p>
          Have questions or want to pose a question to the community? Reach out directly to our founder at{' '}
          <a
            href="mailto:founder@scruttin.com"
            className="text-[#191918] underline underline-offset-2 font-medium hover:text-black"
          >
            founder@scruttin.com
          </a>.
        </p>
      </div>
    ),
  },
  guidelines: {
    title: 'Content Guidelines',
    subtitle: 'Standards for civility, personal authenticity, and respectful speech.',
    icon: BookOpen,
    content: (
      <div className="space-y-4 text-sm text-[#45433E] leading-relaxed">
        <p>
          Scruttin values raw honesty, introspection, and vulnerability. Because members record and post their own thoughts, all contributors agree to our core tenets:
        </p>
        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-md bg-[#FAF9F5] border border-[#EAE7E0]">
            <span className="font-semibold text-[#191918] block mb-0.5">1. Speak for Yourself</span>
            <span>Record your own honest voice and write your own thoughts. Do not post unauthorized recordings of others or private third-party conversations.</span>
          </div>
          <div className="p-3 rounded-md bg-[#FAF9F5] border border-[#EAE7E0]">
            <span className="font-semibold text-[#191918] block mb-0.5">2. No AI Speech or Synthetic Slop</span>
            <span>Every rut must be spoken or penned by an authentic human being. Synthetic voice cloning or AI-generated ruts are strictly removed.</span>
          </div>
          <div className="p-3 rounded-md bg-[#FAF9F5] border border-[#EAE7E0]">
            <span className="font-semibold text-[#191918] block mb-0.5">3. Zero Tolerance for Harassment & Hate</span>
            <span>Speech that incites violence, dehumanizes individuals, bullies members, or promotes bigotry is banned without warning.</span>
          </div>
          <div className="p-3 rounded-md bg-[#FAF9F5] border border-[#EAE7E0]">
            <span className="font-semibold text-[#191918] block mb-0.5">4. Privacy & Anonymity</span>
            <span>Never disclose private phone numbers, home addresses, or doxxing material of yourself or others in your recordings.</span>
          </div>
        </div>
        <p className="text-xs text-[#7A7870]">
          To report an infringement or content concern, email{' '}
          <a href="mailto:founder@scruttin.com" className="text-[#191918] underline">
            founder@scruttin.com
          </a>.
        </p>
      </div>
    ),
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Last updated: September 2026',
    icon: FileText,
    content: (
      <div className="space-y-4 text-sm text-[#45433E] leading-relaxed">
        <p>
          By accessing or using <strong>Scruttin</strong>, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
        </p>
        <div className="space-y-2 text-xs">
          <h4 className="font-semibold text-[#191918] uppercase tracking-wider font-mono text-[11px]">1. Platform Nature</h4>
          <p>
            Scruttin provides an ambient audio and text platform where registered members record and publish their personal reflections, responses to prompts, and perspectives. All user submissions remain the intellectual property of their creators, with a license granted to Scruttin for broadcast on the Stream and Tagged archives.
          </p>

          <h4 className="font-semibold text-[#191918] uppercase tracking-wider font-mono text-[11px] pt-2">2. Self-Recorded Submissions</h4>
          <p>
            You represent that any audio or written rut you submit is recorded or authored by you, or that you have full rights and permissions to publish it. You agree not to upload non-consensual recordings of third parties.
          </p>

          <h4 className="font-semibold text-[#191918] uppercase tracking-wider font-mono text-[11px] pt-2">3. Creator Profile & Support</h4>
          <p>
            Creators may link external portfolios, country locations, and peer support links. Scruttin takes zero cut of voluntary creator tips.
          </p>

          <h4 className="font-semibold text-[#191918] uppercase tracking-wider font-mono text-[11px] pt-2">4. In-the-Moment Experience</h4>
          <p>
            Stream ruts are broadcast ephemerally. While audio is processed securely in the cloud, Scruttin does not guarantee permanent public storage of unpinned stream content.
          </p>

          <h4 className="font-semibold text-[#191918] uppercase tracking-wider font-mono text-[11px] pt-2">5. Disclaimers</h4>
          <p>
            Scruttin is provided "as is" without warranty. Views expressed by users in their recorded ruts are their own and do not reflect the platform's endorsement.
          </p>
        </div>
      </div>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Respecting your anonymity and personal information.',
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-sm text-[#45433E] leading-relaxed">
        <p>
          Your privacy is fundamental to authentic conversation. Scruttin is intentionally designed without tracking beacons, invasive ad pixels, or data broker integrations.
        </p>
        <div className="space-y-2 text-xs">
          <h4 className="font-semibold text-[#191918] uppercase tracking-wider font-mono text-[11px]">1. Information We Collect</h4>
          <p>
            When you register, we collect your email address and display handle. When you record or submit a rut, we store the audio file or text body along with your chosen country location.
          </p>

          <h4 className="font-semibold text-[#191918] uppercase tracking-wider font-mono text-[11px] pt-2">2. Microphone Permissions</h4>
          <p>
            Microphone access is requested exclusively when you choose to record an audio rut within your browser or mobile device. Audio is never captured in the background.
          </p>

          <h4 className="font-semibold text-[#191918] uppercase tracking-wider font-mono text-[11px] pt-2">3. How We Use Information</h4>
          <p>
            To deliver the audio listening stream, attribute your contributions to your profile, prevent spam, and maintain platform security. We never sell your personal data or voice recordings to third parties.
          </p>

          <h4 className="font-semibold text-[#191918] uppercase tracking-wider font-mono text-[11px] pt-2">4. Data Retention & Deletion</h4>
          <p>
            You may request complete deletion of your account and submitted ruts at any time by contacting{' '}
            <a href="mailto:founder@scruttin.com" className="text-[#191918] underline font-medium">
              founder@scruttin.com
            </a>.
          </p>
        </div>
      </div>
    ),
  },
};

export default function LandingFooter() {
  const [activeModal, setActiveModal] = useState<PolicySection | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText('founder@scruttin.com');
      setCopiedEmail(true);
      toast.success('Email copied to clipboard (founder@scruttin.com)');
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      window.location.href = 'mailto:founder@scruttin.com';
    }
  };

  const currentPolicy = activeModal ? POLICIES[activeModal] : null;

  return (
    <>
      <footer className="border-t border-[#EAE7DF] bg-[#FAF9F5] text-[#191918] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 pb-8 sm:pb-10 border-b border-[#EAE7DF]">
            {/* Brand & Mission */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#191918] text-[#FAF9F5] flex items-center justify-center font-serif font-bold text-xs shadow-sm">
                  S
                </div>
                <span className="font-serif font-semibold text-base tracking-tight text-[#191918]">
                  Scruttin
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#7A7870] px-2 py-0.5 rounded bg-[#EFECE4]">
                  Voices Worldwide
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#636159] font-light leading-relaxed max-w-sm">
                A quiet sanctuary for authentic speech. People sign up, pick timeless questions, and record their own honest audio dispatches from wherever they are. Less showing. More saying.
              </p>

              {/* Direct Founder Email Link & Copy Action */}
              <div className="pt-1 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[#7A7870] font-mono">Founder:</span>
                <a
                  href="mailto:founder@scruttin.com"
                  id="footer-email-link"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#191918] hover:text-black underline underline-offset-4 decoration-[#D0CDC4] hover:decoration-[#191918] transition-all"
                >
                  <Mail size={12} className="text-[#7A7870]" />
                  <span>founder@scruttin.com</span>
                </a>
                <button
                  type="button"
                  id="footer-copy-email-btn"
                  onClick={handleCopyEmail}
                  title="Copy email to clipboard"
                  className="p-1 rounded text-[#7A7870] hover:text-[#191918] hover:bg-[#EFECE4] transition-colors"
                  aria-label="Copy founder email"
                >
                  {copiedEmail ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Quick Links / Editorial & Legal */}
            <div className="md:col-span-4 grid grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#7A7870] mb-3">
                  Company
                </h3>
                <ul className="space-y-2.5 text-xs text-[#52504A]">
                  <li>
                    <button
                      type="button"
                      id="footer-link-about"
                      onClick={() => setActiveModal('about')}
                      className="hover:text-[#191918] transition-colors text-left"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      id="footer-link-guidelines"
                      onClick={() => setActiveModal('guidelines')}
                      className="hover:text-[#191918] transition-colors text-left"
                    >
                      Content Guidelines
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#7A7870] mb-3">
                  Legal
                </h3>
                <ul className="space-y-2.5 text-xs text-[#52504A]">
                  <li>
                    <button
                      type="button"
                      id="footer-link-terms"
                      onClick={() => setActiveModal('terms')}
                      className="hover:text-[#191918] transition-colors text-left"
                    >
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      id="footer-link-privacy"
                      onClick={() => setActiveModal('privacy')}
                      className="hover:text-[#191918] transition-colors text-left"
                    >
                      Privacy Policy
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Social Media Channels */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#7A7870] mb-3">
                Connect
              </h3>
              <div className="flex flex-col gap-2">
                {/* TikTok Handle */}
                <a
                  href="https://www.tiktok.com/@scruttin"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="footer-tiktok-link"
                  className="inline-flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#E2DFD6] hover:border-[#191918] text-xs text-[#383733] hover:text-[#191918] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Music size={13} className="text-[#7A7870] group-hover:text-[#191918] transition-colors" />
                    <span>TikTok</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-[#7A7870] group-hover:text-[#191918]">
                    <span>@scruttin</span>
                    <ExternalLink size={10} className="opacity-60 group-hover:opacity-100" />
                  </span>
                </a>

                {/* X Handle */}
                <a
                  href="https://x.com/scruttin"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="footer-x-link"
                  className="inline-flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#E2DFD6] hover:border-[#191918] text-xs text-[#383733] hover:text-[#191918] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Twitter size={13} className="text-[#7A7870] group-hover:text-[#191918] transition-colors" />
                    <span>X</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-[#7A7870] group-hover:text-[#191918]">
                    <span>@scruttin</span>
                    <ExternalLink size={10} className="opacity-60 group-hover:opacity-100" />
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A7870] font-mono">
            <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
              <span>&copy; {new Date().getFullYear()} Scruttin.</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Authentic, self-recorded perspectives worldwide.</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-[#52504A]">Once-in-a-lifetime listening</span>
              <span className="text-[#7A7870]">&middot;</span>
              <span className="text-emerald-700">Live worldwide</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy & About Modal Dialog */}
      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-[#FAF9F5] border border-[#E2DFD6] text-[#191918] sm:rounded-2xl p-6 sm:p-8 shadow-xl">
          {currentPolicy && (
            <>
              <DialogHeader className="space-y-1.5 text-left border-b border-[#EAE7DF] pb-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#7A7870]">
                  <currentPolicy.icon size={14} className="text-[#191918]" />
                  <span>Scruttin Documentation</span>
                </div>
                <DialogTitle className="font-serif font-normal text-2xl text-[#141413]">
                  {currentPolicy.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#636159]">
                  {currentPolicy.subtitle}
                </DialogDescription>
              </DialogHeader>

              {/* Navigation Switcher inside Modal */}
              <div className="flex items-center gap-1.5 py-2 border-b border-[#EAE7DF] overflow-x-auto no-scrollbar">
                {(Object.keys(POLICIES) as PolicySection[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveModal(key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
                      activeModal === key
                        ? 'bg-[#191918] text-white font-medium'
                        : 'text-[#636159] hover:bg-[#EFECE4] hover:text-[#191918]'
                    }`}
                  >
                    {POLICIES[key].title.replace('Scruttin ', '')}
                  </button>
                ))}
              </div>

              {/* Modal Content */}
              <div className="pt-3">
                {currentPolicy.content}
              </div>

              <div className="mt-6 pt-4 border-t border-[#EAE7DF] flex items-center justify-between text-xs text-[#7A7870]">
                <span>Contact: founder@scruttin.com</span>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-1.5 rounded-full bg-[#191918] text-white font-medium hover:bg-black transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
