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
    loaderDuration: 1000,
    animationDuration: 2, // seconds - time for text to cross screen
    translateDistance: 280, // 120vw - just off screen
  },
  desktop: {
    loaderDuration: 1000,
    animationDuration: 2, // seconds - maintains same speed as before
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
      className="h-screen flex flex-col items-center justify-center p-8 sm:p-16"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.5}}
    >
      {/* Center content wrapper */}
      <div className="flex flex-col items-center">
        {/* Logo - at top with padding */}
        <motion.h1
          className="text-2xl font-bold mb-12 uppercase text-[#1a1a1a]"
          style={{fontFamily: 'Georgia, serif'}}
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.4, delay: 0}}
        >
          Rani Mode
        </motion.h1>
        {/* Typewriter Tagline */}
        <motion.p
          className="font-serif text-[clamp(1.25rem,4vw,2rem)] font-medium italic leading-relaxed text-[#722F37] max-w-4xl text-center"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.4, delay: 0.2}}
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

        {/* Coming Soon Badge - above tagline */}
        <motion.div
          className="mt-6"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.5, delay: 4}}
        >
          <p className="text-sm font-medium tracking-[0.25em] uppercase text-[#722F37]">
            Coming Soon
          </p>
        </motion.div>

        {/* Signup Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="mt-10 w-full max-w-[480px]"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 4.2}}
        >
          <div className="flex flex-col sm:flex-row sm:items-stretch w-full gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === 'loading' || status === 'success'}
              className="w-full sm:flex-1 sm:min-w-0 px-5 py-4 text-base leading-none border border-[#722F37] sm:border-r-0 rounded-none bg-white/50 text-[#1a1a1a] placeholder:text-[#1a1a1a]/50 outline-none focus:bg-white/80 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full sm:w-auto sm:shrink-0 px-6 py-4 text-sm font-medium tracking-wider uppercase whitespace-nowrap bg-[#722F37] text-[#F5F0E8] border border-[#722F37] rounded-none cursor-pointer transition-all duration-300 hover:bg-[#5a252b] hover:border-[#5a252b] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
            </button>
          </div>

          {status === 'error' && (
            <motion.p
              className="mt-4 text-sm text-center text-red-700"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
            >
              {message}
            </motion.p>
          )}
        </motion.form>

        {/* Success Box */}
        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              className="mt-6 w-full max-w-[480px] border border-[#722F37] bg-white p-6"
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.4}}
            >
              <div className="flex flex-col items-center text-center">
                {/* Animated Checkmark */}
                <motion.svg
                  className="w-12 h-12 mb-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  initial={{scale: 0}}
                  animate={{scale: 1}}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                >
                  <motion.circle
                    cx="12"
                    cy="12"
                    r="11"
                    fill="#722F37"
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    transition={{duration: 0.3, delay: 0.2}}
                  />
                  <motion.path
                    d="M8 12l2.5 2.5L16 9"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{pathLength: 0}}
                    animate={{pathLength: 1}}
                    transition={{duration: 0.3, delay: 0.5}}
                  />
                </motion.svg>

                {/* Success Message */}
                <motion.p
                  className="text-lg font-medium text-[#1a1a1a] mb-3"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{delay: 0.5}}
                >
                  You're on the list!
                </motion.p>

                {/* Double Opt-in Message */}
                <motion.p
                  className="text-sm text-[#1a1a1a]/70 leading-relaxed"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{delay: 0.8}}
                >
                  Please check your inbox and confirm your subscription to
                  complete the sign-up process.
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
