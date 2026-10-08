import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Menu, 
  X, 
  Play, 
  Pause, 
  Plus, 
  Minus,
  Mic
} from 'lucide-react';

// FadeInUp Scroll Reveal Wrapper
export const FadeInUp: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ 
  children, 
  className = '', 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const { current } = domRef;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Custom modern Untitled UI style stroke-based SVG Logo for Plety
const PletyLogo: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M7 6H19C22.866 6 26 9.13401 26 13C26 16.866 22.866 20 19 20H7V6Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 20V26"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 13H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Marquee Brand SVGs
const BrandLogos = [
  {
    name: 'Springfield',
    svg: (
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )
  },
  {
    name: 'Orbitc',
    svg: (
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="9" ry="3" transform="rotate(30 12 12)" />
      </svg>
    )
  },
  {
    name: 'Cloud',
    svg: (
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
      </svg>
    )
  },
  {
    name: 'Amster',
    svg: (
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 22 22 22 12 2" />
      </svg>
    )
  },
  {
    name: 'Nexus',
    svg: (
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    )
  }
];

// FAQ Data
const FAQData = [
  {
    question: "How quickly can I integrate Plety into my existing stack?",
    answer: "Plety provides drop-in SDKs for React, Python, Node.js, and REST APIs. Most engineering teams are fully deployed within 15 minutes using our automated API keys and zero-config client packages."
  },
  {
    question: "What makes Plety's AI model different from generic LLMs?",
    answer: "Our proprietary spatial and multimodal engines are fine-tuned specifically on real-world vector telemetry, geospatial coordinate systems, satellite imagery streams, and high-frequency time-series datasets."
  },
  {
    question: "Is my data secure and isolated when using Plety?",
    answer: "Yes. All customer data is encrypted in transit with TLS 1.3 and at rest with AES-256. We offer isolated VPCs, SOC2 Type II compliance, and strict zero data retention policies for Enterprise plans."
  },
  {
    question: "Does Plety support real-time audio and speech transcription?",
    answer: "Absolutely. Our AI transcription pipeline supports live WebSocket streams, multi-speaker diarization, and automatic summarization with sub-200ms streaming latency."
  },
  {
    question: "Can I export or query generated insights programmatically?",
    answer: "Yes! You can export outputs to GeoJSON, CSV, Parquet, or query directly via GraphQL, Python SDK, or automated webhook event subscriptions."
  }
];

export const PletyLanding: React.FC<{ onLaunchApp?: () => void }> = ({ onLaunchApp }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);

  // Handle Navbar Background Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-white selection:text-black">
      
      {/* 1. NAVIGATION BAR (Sticky & Responsive) */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/80 backdrop-blur-md border-b border-white/10 shadow-2xl py-4' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20 group-hover:border-white/40 transition-colors text-white">
              <PletyLogo className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-mono">Plety</span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <a 
              href="#about" 
              onClick={(e) => handleNavClick(e, 'about')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              About
            </a>
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a 
              href="#faq" 
              onClick={(e) => handleNavClick(e, 'faq')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              FAQ
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleNavClick(e, 'contact')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLaunchApp}
              className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-5 py-2.5 rounded-full border border-white/10 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
            >
              Get started
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 transition-all">
            <div className="flex flex-col gap-4">
              <a 
                href="#about" 
                onClick={(e) => handleNavClick(e, 'about')}
                className="text-base font-medium text-gray-300 hover:text-white py-2 border-b border-white/5"
              >
                About
              </a>
              <a 
                href="#features" 
                onClick={(e) => handleNavClick(e, 'features')}
                className="text-base font-medium text-gray-300 hover:text-white py-2 border-b border-white/5"
              >
                Features
              </a>
              <a 
                href="#faq" 
                onClick={(e) => handleNavClick(e, 'faq')}
                className="text-base font-medium text-gray-300 hover:text-white py-2 border-b border-white/5"
              >
                FAQ
              </a>
              <a 
                href="#contact" 
                onClick={(e) => handleNavClick(e, 'contact')}
                className="text-base font-medium text-gray-300 hover:text-white py-2 border-b border-white/5"
              >
                Contact
              </a>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onLaunchApp) onLaunchApp();
                }}
                className="mt-2 w-full bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-5 py-3 rounded-full border border-white/10 text-center flex items-center justify-center gap-2"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION (id="about") */}
      <section id="about" className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 relative z-0 overflow-hidden bg-black">
        
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 -z-10 object-cover w-full h-full opacity-90 pointer-events-none"
        >
          <source src="https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center relative z-10">
          
          <FadeInUp delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 text-xs font-medium text-gray-300 hover:border-white/20 transition-all cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Announcing API 2.0</span>
            </div>
          </FadeInUp>

          <FadeInUp delay={200}>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-6 text-center max-w-4xl leading-[1.1]">
              Build <span className="font-serif italic text-amber-100/90 font-normal">intelligent</span> spatial apps with unprecedented speed
            </h1>
          </FadeInUp>

          <FadeInUp delay={300}>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl text-center mb-10 leading-relaxed font-light">
              Plety combines real-time WebGL spatial rendering with conversational AI and voice streaming to supercharge engineering decisions.
            </p>
          </FadeInUp>

          <FadeInUp delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <button 
                onClick={onLaunchApp}
                className="w-full sm:w-auto bg-[#1F1F22] hover:bg-[#2A2A2D] text-white px-8 py-3.5 rounded-full border border-white/10 text-base font-medium shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Get started
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onLaunchApp}
                className="w-full sm:w-auto text-gray-300 hover:text-white px-8 py-3.5 text-base font-medium transition-all duration-300 flex items-center justify-center gap-2 text-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
              >
                Book a demo
              </button>
            </div>
          </FadeInUp>

          {/* Infinite Marquee Section */}
          <FadeInUp delay={500} className="w-full">
            <div className="w-full border-t border-white/10 pt-10">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-6 text-center">
                Trusted by engineering teams at forward-thinking companies
              </p>
              
              {/* Marquee Container with Mask Gradient */}
              <div className="w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
                <div className="animate-marquee flex items-center gap-16 py-2">
                  {/* Duplicated list for seamless looping */}
                  {[...BrandLogos, ...BrandLogos, ...BrandLogos, ...BrandLogos].map((brand, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0">
                      {brand.svg}
                      <span className="text-xs font-semibold tracking-wider font-mono uppercase">{brand.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInUp>

        </div>
      </section>

      {/* 3. FEATURE SECTION 1: AI CHAT (id="features") */}
      <section id="features" className="py-24 bg-black border-t border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column Text */}
            <FadeInUp delay={100}>
              <div className="flex flex-col">
                <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 rounded-full w-fit mb-4 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI chat</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight mb-6 leading-tight">
                  Conversational AI built for <span className="font-serif italic text-amber-200/90 font-normal">complex</span> data models
                </h2>

                <p className="text-gray-400 text-lg mb-8 leading-relaxed font-light">
                  Query vector layers, inspect geospatial bounds, and run automated telemetry analytics using natural language prompts directly within your workspace.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white/10 border border-white/20 text-white mt-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-base">Instant Knowledge Access</h4>
                      <p className="text-gray-400 text-sm">Query millions of spatial telemetry records and metadata in milliseconds.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white/10 border border-white/20 text-white mt-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-base">Context-Aware Memory</h4>
                      <p className="text-gray-400 text-sm">Remembers active coordinate reference systems and custom spatial projections.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white/10 border border-white/20 text-white mt-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-base">Multi-modal Code Export</h4>
                      <p className="text-gray-400 text-sm">Generate Python, SQL, and GeoJSON outputs with single-click copy.</p>
                    </div>
                  </div>
                </div>

              </div>
            </FadeInUp>

            {/* Right Column Video Preview */}
            <FadeInUp delay={300}>
              <div className="rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl bg-[#0A0A0C] p-2 group">
                
                {/* Background Video */}
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-[450px] object-cover rounded-2xl"
                >
                  <source src="https://cdn.sceneai.art/Hero%20Section%20Video/1bcc8fa3-37f6-4c53-8591-0347e4c7f8ac.mp4" type="video/mp4" />
                </video>

                {/* Floating Glassmorphism Chat Card Overlay */}
                <div className="bg-black/70 backdrop-blur-xl border border-white/10 p-5 rounded-2xl absolute bottom-6 left-6 right-6 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono text-gray-300">Plety Assistant • Active</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">GPT-4o Spatial</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-white/10 text-gray-200 p-2.5 rounded-xl rounded-tl-none max-w-[85%] font-mono">
                      "Find all anomaly zones within UTM Zone 18N having altitude loss &gt; 12%"
                    </div>
                    <div className="bg-amber-400/10 text-amber-200 border border-amber-400/20 p-2.5 rounded-xl rounded-tr-none ml-auto max-w-[85%] font-mono">
                      ⚡ Detected 3 spatial clusters (342 objects). Generating GeoJSON export...
                    </div>
                  </div>
                </div>

              </div>
            </FadeInUp>

          </div>

        </div>
      </section>

      {/* 4. FEATURE SECTION 2: AI TRANSCRIPTION (id="features") */}
      <section className="py-24 bg-black border-t border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column Video Preview */}
            <FadeInUp delay={200} className="order-2 md:order-1">
              <div className="rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl bg-[#0A0A0C] p-2 group">
                
                {/* Background Video */}
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-[450px] object-cover rounded-2xl"
                >
                  <source src="https://cdn.sceneai.art/Hero%20Section%20Video/736fd4a0-70ac-4f44-9633-55769ead6aca.mp4" type="video/mp4" />
                </video>

                {/* Floating Transcription Card Overlay */}
                <div className="bg-black/70 backdrop-blur-xl border border-white/10 p-5 rounded-2xl absolute bottom-6 left-6 right-6 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-8 h-8 rounded-full bg-emerald-400 text-black flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <div>
                        <div className="text-xs font-medium text-white">Live Voice Stream</div>
                        <div className="text-[10px] text-gray-400 font-mono">Sub-200ms latency</div>
                      </div>
                    </div>

                    {/* Audio Wave Visualizer */}
                    <div className="flex items-center gap-1">
                      {[40, 70, 30, 90, 50, 80, 40, 60, 30, 80].map((h, i) => (
                        <div 
                          key={i} 
                          style={{ height: isPlayingAudio ? `${h}%` : '20%' }}
                          className="w-1 bg-emerald-400/80 rounded-full transition-all duration-300 h-4" 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-gray-300 font-mono leading-relaxed">
                    <span className="text-emerald-400 font-semibold">[00:14 - Speaker 1]:</span> "Initiating spatial mesh synchronization across nodes alpha and gamma."
                  </div>
                </div>

              </div>
            </FadeInUp>

            {/* Right Column Text */}
            <FadeInUp delay={100} className="order-1 md:order-2">
              <div className="flex flex-col">
                <div className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3.5 py-1 rounded-full w-fit mb-4 font-medium flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  <span>AI transcription</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight mb-6 leading-tight">
                  Transform speech into <span className="font-serif italic text-emerald-200/90 font-normal">actionable</span> structured insights
                </h2>

                <p className="text-gray-400 text-lg mb-8 leading-relaxed font-light">
                  Convert audio streams and voice notes into synchronized spatial annotations with automatic speaker diarization and semantic tagging.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white/10 border border-white/20 text-white mt-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-base">99.4% Domain Accuracy</h4>
                      <p className="text-gray-400 text-sm">Fine-tuned models trained on technical jargon, coordinate systems, and engineering terms.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white/10 border border-white/20 text-white mt-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-base">Multi-Speaker Diarization</h4>
                      <p className="text-gray-400 text-sm">Automatically identifies, labels, and timestamps individual team voices seamlessly.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white/10 border border-white/20 text-white mt-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-base">Real-Time Streaming Pipeline</h4>
                      <p className="text-gray-400 text-sm">Streams transcriptions via WebSockets with minimal battery and network overhead.</p>
                    </div>
                  </div>
                </div>

              </div>
            </FadeInUp>

          </div>

        </div>
      </section>

      {/* 5. FAQ SECTION (id="faq") */}
      <section id="faq" className="py-24 bg-black border-t border-white/10 relative">
        <div className="max-w-3xl mx-auto px-6">
          
          <FadeInUp delay={100} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-white tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-lg font-light">
              Everything you need to know about the Plety spatial AI platform.
            </p>
          </FadeInUp>

          {/* Accordion Container */}
          <div className="space-y-4">
            {FAQData.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <FadeInUp key={index} delay={150 + index * 50}>
                  <div 
                    className={`border rounded-xl bg-transparent transition-all duration-200 overflow-hidden ${
                      isOpen ? 'border-white/30 bg-white/[0.02]' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                    >
                      <span className="text-lg font-medium text-white">{item.question}</span>
                      <div className={`p-1.5 rounded-full border border-white/10 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-white/10 text-white' : 'text-gray-400'}`}>
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Smooth CSS grid-template-rows expansion */}
                    <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                      <div className="overflow-hidden">
                        <p className="px-6 pb-6 text-gray-400 text-base leading-relaxed font-light border-t border-white/5 pt-4">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeInUp>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. FOOTER SECTION (id="contact") */}
      <footer id="contact" className="bg-black border-t border-white/10 pt-20 pb-12 relative overflow-hidden">
        
        {/* Ambient Glow / Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/[0.03] to-transparent pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          
          {/* Top CTA Banner */}
          <FadeInUp delay={100} className="mb-20">
            <div className="rounded-3xl bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/10 p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
              <div className="max-w-2xl mx-auto flex flex-col items-center">
                <h2 className="text-3xl md:text-5xl font-light text-white tracking-tight mb-4">
                  Ready to get started?
                </h2>
                <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed font-light">
                  Join thousands of developers and spatial analysts building high-performance interactive applications with Plety.
                </p>
                <button 
                  onClick={onLaunchApp}
                  className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white px-8 py-3.5 rounded-full border border-white/20 text-base font-medium shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  Get started
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </FadeInUp>

          {/* 4-Column Link Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16 border-b border-white/10 pb-16">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 font-mono">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-white transition-colors">Overview</a></li>
                <li><a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-white transition-colors">AI Chat Engine</a></li>
                <li><a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-white transition-colors">AI Transcription</a></li>
                <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-white transition-colors">API v2.0</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 font-mono">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 font-mono">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-white transition-colors">SDK Reference</a></li>
                <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 font-mono">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <PletyLogo className="w-5 h-5 text-gray-400" />
              <span className="font-mono text-gray-400 font-bold">Plety</span>
            </div>

            {/* EXACT REQUIRED COPYRIGHT TEXT */}
            <div className="text-center sm:text-right">
              © 2026 Plety. All rights reserved • by <span className="text-gray-300 hover:text-white font-medium transition-colors">Re-text</span> • Made in <span className="text-gray-300 hover:text-white font-medium transition-colors">Gemini</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
