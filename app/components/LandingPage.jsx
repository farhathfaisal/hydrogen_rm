import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';

/**
 * NOTE: All UI going forward uses Tailwind classes unless specified otherwise.
 * Custom colors used:
 * - Background: #F5F0E8 (creamy beige)
 * - Accent: #722F37 (dark burgundy)
 * - Text: #1a1a1a
 *
 * Animation Sequence:
 * Phase 1: Loader with "Rani Mode" in circular spinner
 * Phase 2: Split text - RANI goes left→right, MODE goes right→left (50vh each)
 * Phase 3: Final content with typewriter effect
 */

// Hook to detect mobile vs desktop
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Animation config for mobile and desktop
// Speed is calculated as: (translateDistance * 2) / duration
// Desktop: 240vw / 3.6s = 66.7vw/s (same visual speed as before)
const PHASE_CONFIG = {
  mobile: {
    loaderDuration: 2000,
    animationDuration: 2.5, // seconds - time for text to cross screen
    translateDistance: 280, // 120vw - just off screen
  },
  desktop: {
    loaderDuration: 2000,
    animationDuration: 3, // seconds - maintains same speed as before
    translateDistance: 100, // 120vw - just off screen
  },
};

export function LandingPage() {
  const [phase, setPhase] = useState(1);
  const isMobile = useIsMobile();
  const config = isMobile ? PHASE_CONFIG.mobile : PHASE_CONFIG.desktop;

  useEffect(() => {
    // Phase 1 → Phase 2 after loader duration
    const timer1 = setTimeout(() => setPhase(2), config.loaderDuration);

    return () => {
      clearTimeout(timer1);
    };
  }, [config.loaderDuration]);

  // Called by SplitTextPhase when animation completes
  const handlePhase2Complete = () => {
    setPhase(3);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F0E8] text-[#1a1a1a] overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 1 && <LoaderPhase key="loader" />}
        {phase === 2 && (
          <SplitTextPhase
            key="split"
            config={config}
            onComplete={handlePhase2Complete}
          />
        )}
        {phase === 3 && <HeroSection key="hero" />}
      </AnimatePresence>
    </div>
  );
}

/**
 * Phase 1: Circular text loader - "Rani Mode" repeating in a circle, rotating
 */
function LoaderPhase() {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-[#F5F0E8]"
      exit={{opacity: 0}}
      transition={{duration: 0.3}}
    >
      <motion.img
        src="/rani-mode-loader.svg"
        alt="Loading"
        width={200}
        height={200}
        animate={{rotate: 360}}
        transition={{duration: 8, repeat: Infinity, ease: 'linear'}}
      />
    </motion.div>
  );
}

/**
 * Phase 2: Split text animation
 * RANI: starts off-screen RIGHT, slides LEFT, exits LEFT
 * MODE: starts off-screen LEFT, slides RIGHT, exits RIGHT
 * Transitions to phase 3 immediately when animation completes
 */
function SplitTextPhase({config, onComplete}) {
  const duration = config.animationDuration;
  const distance = config.translateDistance;

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-[#F5F0E8] py-[10px] gap-[10px]"
      exit={{opacity: 0}}
      transition={{duration: 0.3}}
    >
      {/* RANI - starts RIGHT, moves LEFT, exits LEFT */}
      <div className="flex-1 flex items-center overflow-hidden">
        <motion.span
          className="font-black tracking-tighter leading-[0.85] text-[#1a1a1a] uppercase whitespace-nowrap"
          style={{fontSize: 'calc(50vh - 15px)'}}
          initial={{x: `${distance}vw`}}
          animate={{x: `-${distance}vw`}}
          transition={{
            duration,
          }}
          onAnimationComplete={onComplete}
        >
          Rani
        </motion.span>
      </div>

      {/* MODE - starts LEFT, moves RIGHT, exits RIGHT */}
      <div className="flex-1 flex items-center justify-end overflow-hidden">
        <motion.span
          className="font-black tracking-tighter leading-[0.85] text-[#1a1a1a] uppercase whitespace-nowrap"
          style={{fontSize: 'calc(50vh - 15px)'}}
          initial={{x: `-${distance}vw`}}
          animate={{x: `${distance}vw`}}
          transition={{
            duration,
          }}
        >
          Mode
        </motion.span>
      </div>
    </motion.div>
  );
}

/**
 * Phase 3: Final hero content with typewriter effect
 */
function HeroSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you for joining us.');
        setEmail('');
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const tagline =
    "We're creating a new style of coat, purposefully designed to complement your cultural clothes and keep you warm and stylish.";

  return (
    <motion.section
      className="min-h-screen flex flex-col justify-center items-center text-center p-8"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.5}}
    >
      {/* Logo */}
      <motion.h1
        className="text-2xl font-black tracking-widest uppercase text-[#1a1a1a] mb-8"
        initial={{opacity: 0, y: -20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5, delay: 0.2}}
      >
        Rani Mode
      </motion.h1>

      {/* Typewriter Tagline */}
      <motion.p
        className="font-serif text-[clamp(1.25rem,4vw,2rem)] font-semibold italic leading-relaxed text-[#722F37] max-w-4xl text-center"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 0.3, delay: 0.4}}
      >
        {tagline.split('').map((char, index) => (
          <motion.span
            key={index}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{
              duration: 0.03,
              delay: 0.5 + index * 0.03,
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.p>

      {/* Signup Form */}
      {/* <motion.form
        onSubmit={handleSubmit}
        className="mt-10 w-full max-w-[480px]"
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5, delay: 3.5}}
      >
        <div className="flex items-stretch w-full">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 min-w-0 px-5 py-4 text-base leading-none border border-[#722F37] border-r-0 rounded-none bg-white/50 text-[#1a1a1a] placeholder:text-[#1a1a1a]/50 outline-none focus:bg-white/80 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="shrink-0 px-6 py-4 text-sm font-medium tracking-wider uppercase whitespace-nowrap bg-[#722F37] text-[#F5F0E8] border border-[#722F37] rounded-none cursor-pointer transition-all duration-300 hover:bg-[#5a252b] hover:border-[#5a252b] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
          </button>
        </div>

        {message && (
          <motion.p
            className={`mt-4 text-sm text-center ${status === 'success' ? 'text-[#722F37]' : 'text-red-700'}`}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
          >
            {message}
          </motion.p>
        )}
      </motion.form> */}

      {/* Coming Soon Badge */}
      <motion.div
        className="mt-12"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 0.5, delay: 3.8}}
      >
        <p className="text-sm font-medium tracking-[0.25em] uppercase text-[#722F37]">
          Coming Soon
        </p>
      </motion.div>
    </motion.section>
  );
}
