import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  Cake,
  Camera,
  Gift,
  Heart,
  Music,
  Music2,
  Sparkles,
  Star,
  WandSparkles
} from "lucide-react";
import "./styles.css";

const friendName = "Yashi";

const softEase = [0.22, 1, 0.36, 1];
const gentleEase = [0.45, 0, 0.55, 1];
const smoothSpring = { type: "spring", stiffness: 180, damping: 28, mass: 0.85 };

const gallery = [
  {
    title: "Main character energy",
    caption: "Birthday post material, honestly.",
    image: "/photos/smile-solo.jpeg"
  },
  {
    title: "Holi wala chaos",
    caption: "Colors, laughs, and certified group-photo energy.",
    image: "/photos/holi-group.jpeg"
  },
  {
    title: "Jivdani trip",
    caption: "Random plan, successful memory.",
    image: "/photos/jivdani-trip.jpeg"
  },
  {
    title: "Festive mode",
    caption: "Calm photo, full festive vibes.",
    image: "/photos/krishna-moment.jpeg"
  }
];

const memoryLines = [
  {
    time: "After dinner",
    title: "Random nights at a friend's house",
    text: "Just sitting for a while, talking, laughing, and doing nothing special.",
    note: "Funny how normal evenings become memories."
  },
  {
    time: "Game night",
    title: "Uno and Ludo together",
    text: "Cards, dice, random confidence, and everyone pretending they were not competitive.",
    note: "Simple days that turned memorable."
  },
  {
    time: "Festival days",
    title: "Diwali lights and Holi colors",
    text: "Warm lights, colors, festival noise, and those small moments that feel nicer later.",
    note: "Not every memory needs a photo."
  },
  {
    time: "Jivdani",
    title: "One-day Jivdani trip",
    text: "A random one-day plan that became a good memory by the end of it.",
    note: "One random trip. One good memory."
  },
  {
    time: "Result day",
    title: "When you cleared your exam",
    text: "That smile was honestly the best. Hope itna hi happy tu roz rahe.",
    note: "Result day happiness was top tier."
  }
];

const particles = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 6,
  duration: 11 + Math.random() * 10,
  size: 8 + Math.random() * 14,
  symbol: index % 4 === 0 ? "♡" : index % 5 === 0 ? "✦" : "•"
}));

const finaleBursts = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  angle: (index / 24) * Math.PI * 2,
  distance: 70 + (index % 5) * 18,
  icon: index % 6 === 0 ? "🍫" : index % 3 === 0 ? "✦" : "✨",
  delay: (index % 6) * 0.025
}));

const finaleLights = Array.from({ length: 10 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 17) % 82)}%`,
  top: `${12 + ((index * 23) % 70)}%`,
  delay: index * 0.24
}));

function useAmbientMusic() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current;

    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return null;

    const context = new AudioEngine();
    const master = context.createGain();
    master.gain.value = 0.0;
    master.connect(context.destination);

    const delay = context.createDelay();
    const feedback = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1600;
    delay.delayTime.value = 0.28;
    feedback.gain.value = 0.18;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(filter);
    filter.connect(master);

    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 783.99];
    let step = 0;

    const playNote = () => {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();

      oscillator.type = step % 3 === 0 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(melody[step % melody.length], now);
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.13, now + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.78);

      oscillator.connect(noteGain);
      noteGain.connect(delay);
      noteGain.connect(filter);
      oscillator.start(now);
      oscillator.stop(now + 0.84);
      step += 1;
    };

    audioRef.current = { context, master, loopId: null, playNote };
    return audioRef.current;
  };

  const start = async () => {
    const audio = ensureAudio();
    if (!audio || audio.loopId) return;

    const { context, master, playNote } = audio;
    await context.resume();
    if (context.state !== "running") {
      throw new Error("Audio autoplay blocked");
    }

    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(0.34, now + 0.6);
    playNote();
    audio.loopId = window.setInterval(playNote, 560);
    setPlaying(true);
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const now = audio.context.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.linearRampToValueAtTime(0.0, now + 0.6);
    window.clearInterval(audio.loopId);
    audio.loopId = null;
    setPlaying(false);
  };

  useEffect(() => {
    let cancelled = false;

    const tryStart = () => {
      start().catch(() => {
        if (!cancelled) {
          window.addEventListener("pointerdown", tryStart, { once: true });
          window.addEventListener("keydown", tryStart, { once: true });
          window.addEventListener("touchstart", tryStart, { once: true });
        }
      });
    };

    const timer = window.setTimeout(tryStart, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", tryStart);
      window.removeEventListener("keydown", tryStart);
      window.removeEventListener("touchstart", tryStart);

      if (audioRef.current) {
        window.clearInterval(audioRef.current.loopId);
        audioRef.current.context.close();
      }
    };
  }, []);

  const toggle = async () => {
    if (audioRef.current?.loopId) {
      stop();
      return;
    }

    await start().catch(() => setPlaying(false));
  };

  return { playing, toggle };
}

function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute bottom-[-40px] text-rose-300/45"
          style={{
            left: particle.left,
            fontSize: particle.size
          }}
          animate={{
            y: ["0vh", "-112vh"],
            x: [0, particle.id % 2 ? 22 : -20, 0],
            opacity: [0, 0.68, 0],
            rotate: [0, particle.id % 2 ? 12 : -12]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: gentleEase
          }}
        >
          {particle.symbol}
        </motion.span>
      ))}
    </div>
  );
}

function MusicToggle({ playing, onToggle }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className="fixed right-4 top-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/45 text-rose-600 shadow-glass backdrop-blur-xl transition hover:scale-105 hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-rose-200 sm:right-8 sm:top-8"
      whileTap={{ scale: 0.94 }}
      transition={smoothSpring}
      aria-label={playing ? "Pause background music" : "Play background music"}
      title={playing ? "Pause soft music" : "Play soft music"}
    >
      {playing ? <Music2 size={21} /> : <Music size={21} />}
      <span className="sr-only">{playing ? "Pause music" : "Play music"}</span>
    </motion.button>
  );
}

function Hero({ onReveal }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <section className="relative min-h-screen overflow-hidden px-5 pb-20 pt-24 sm:px-8">
      <motion.div
        style={{ y }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(251,207,232,0.95),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(191,219,254,0.72),transparent_24%),radial-gradient(circle_at_60%_78%,rgba(254,240,138,0.52),transparent_24%)]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.74),rgba(255,247,237,0.44),rgba(240,249,255,0.62))]" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.86fr]">
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: softEase }}
          className="max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-sm font-semibold text-rose-600 shadow-glass backdrop-blur-xl">
            <Sparkles size={17} />
            A little cinematic birthday corner
          </div>
          <h1 className="font-display text-5xl leading-[1.02] text-slate-900 sm:text-7xl lg:text-8xl">
            Happy Birthday{" "}
            <span className="bg-gradient-to-r from-rose-500 via-fuchsia-500 to-sky-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-shimmer">
              {friendName}
            </span>{" "}
            🎉
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
            Bas ek chhota sa birthday page. Thoda fun, thodi memories, thoda birthday drama, and
            hopefully enough good vibes to make you smile for at least two minutes.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <motion.button
              type="button"
              onClick={onReveal}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-200"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={smoothSpring}
            >
              <Gift size={18} />
              Birthday note
            </motion.button>
            <a
              href="#gallery"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/50 px-6 py-3 text-sm font-bold text-slate-800 shadow-glass backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/75 focus:outline-none focus:ring-4 focus:ring-sky-100"
            >
              <Camera size={18} />
              View memories
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.18, duration: 1.05, ease: softEase }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-5 rounded-[2rem] bg-white/40 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/35 p-4 shadow-glass backdrop-blur-2xl">
            <img
              src="/photos/smile-solo.jpeg"
              alt="Smiling birthday portrait"
              className="h-[440px] w-full rounded-[1.5rem] bg-rose-50/60 object-contain"
            />
            <motion.div
              className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/70 bg-white/55 p-5 shadow-glass backdrop-blur-xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.6, repeat: Infinity, ease: gentleEase }}
            >
              <div className="flex items-center gap-3 text-slate-900">
                <Cake className="text-rose-500" size={24} />
                <p className="font-display text-2xl">Birthday mode: on.</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Good food, good mood, and zero unnecessary stress today.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SpecialNote({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 grid place-items-center bg-slate-950/35 px-5 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg rounded-[1.75rem] border border-white/75 bg-white/80 p-7 text-center shadow-glow backdrop-blur-2xl"
            initial={{ scale: 0.88, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 16, opacity: 0 }}
            transition={{ duration: 0.55, ease: softEase }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-rose-100 text-rose-500">
              <Sparkles fill="currentColor" size={24} />
            </div>
            <h2 className="font-display text-4xl text-slate-950">A tiny note</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Don&apos;t overthink this, bas birthday ke liye thoda effort maar diya. You are fun to be
              around, easy to talk to, and honestly a good friend to have. Hope this year gives you
              good days, good plans, and fewer annoying people.
            </p>
            <motion.button
              type="button"
              onClick={onClose}
              className="mt-7 rounded-full bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-rose-200"
              whileTap={{ scale: 0.96 }}
            >
              Keep this note
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WishCards() {
  const cards = [
    ["Warmth", "May you always find people and places that feel like sunshine."],
    ["Success", "May your hard work meet the right doors at exactly the right time."],
    ["Joy", "May the little things keep turning into your favorite memories."]
  ];

  return (
    <section className="relative z-10 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map(([title, text], index) => (
            <motion.article
              key={title}
              className="group rounded-3xl border border-white/70 bg-white/45 p-7 shadow-glass backdrop-blur-xl transition hover:bg-white/70"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.08, duration: 0.75, ease: softEase }}
              whileHover={{ y: -5, rotate: index === 1 ? 0 : index ? 0.6 : -0.6 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-100 to-sky-100 text-rose-500 transition group-hover:scale-110">
                {index === 0 ? <Heart size={22} /> : index === 1 ? <Star size={22} /> : <WandSparkles size={22} />}
              </div>
              <h3 className="font-display text-3xl text-slate-950">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section id="gallery" className="relative z-10 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-rose-500">Little snapshots</p>
          <h2 className="mt-3 font-display text-4xl text-slate-950 sm:text-6xl">A gallery of good energy</h2>
        </motion.div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {gallery.map((item, index) => (
            <motion.figure
              key={item.title}
              className="group bg-white p-3 shadow-glass"
              style={{ rotate: `${[-3, 2, -1, 3][index]}deg` }}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.08, duration: 0.78, ease: softEase }}
              whileHover={{ y: -6, rotate: 0, scale: 1.018 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="grid h-64 place-items-center overflow-hidden bg-rose-50">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-contain transition duration-1000 ease-out"
                />
              </div>
              <figcaption className="px-2 py-4">
                <h3 className="font-display text-2xl text-slate-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.caption}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section className="relative z-10 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="mx-auto mb-10 max-w-2xl text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-rose-400">Memory lane</p>
          <h2 className="mt-3 font-display text-4xl text-slate-950 sm:text-6xl">A few nice moments</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Nothing too detailed. Just a small note for the moments that were actually nice.
          </p>
        </motion.div>

        <motion.div
          className="relative mx-auto grid max-w-4xl gap-5 before:absolute before:bottom-12 before:left-6 before:top-8 before:w-px before:bg-gradient-to-b before:from-rose-200/20 before:via-rose-300/60 before:to-sky-200/20 sm:before:left-1/2"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.85, ease: softEase }}
        >
          {memoryLines.map((memory, index) => (
              <motion.article
                key={memory.title}
                className={`group relative ml-12 sm:ml-0 ${
                  index % 2 === 0 ? "sm:mr-[52%]" : "sm:ml-[52%]"
                }`}
                style={{ perspective: 1000 }}
                initial={{ opacity: 0, x: index % 2 === 0 ? -28 : 28, y: 18, rotate: index % 2 === 0 ? -0.8 : 0.8 }}
                whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: index * 0.08, duration: 0.82, ease: softEase }}
              >
                <div
                  className={`absolute top-8 grid h-5 w-5 place-items-center rounded-full border-4 border-white bg-rose-400 shadow-glow ${
                    index % 2 === 0
                      ? "left-[-2.35rem] sm:left-auto sm:right-[-2.15rem]"
                      : "left-[-2.35rem] sm:left-[-2.15rem]"
                  }`}
                />
                <motion.div
                  className="motion-smooth relative overflow-hidden rounded-[1.75rem] border border-white/75 bg-white/60 p-6 text-left shadow-glass backdrop-blur-xl sm:p-7"
                  whileHover={{ y: -5, rotateX: 1.2, rotateY: index % 2 === 0 ? -1.4 : 1.4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={smoothSpring}
                >
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-0"
                    initial={{ x: "-120%" }}
                    whileHover={{ x: "120%", opacity: [0, 0.4, 0] }}
                    transition={{ duration: 1.15, ease: gentleEase }}
                  />
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-200 via-amber-100 to-sky-100" />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-white/75 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-rose-500 shadow-sm">
                      {memory.time}
                    </span>
                    <motion.span
                      className="font-display text-3xl leading-none text-rose-200"
                      animate={{ opacity: [0.45, 0.82, 0.45], scale: [1, 1.04, 1] }}
                      transition={{ delay: index * 0.2, duration: 4.2, repeat: Infinity, ease: gentleEase }}
                    >
                      0{index + 1}
                    </motion.span>
                  </div>
                  <h3 className="mt-4 font-display text-3xl leading-tight text-slate-950">{memory.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{memory.text}</p>
                  <p className="mt-4 font-hand text-2xl leading-7 text-slate-500">{memory.note}</p>
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rose-100/50 blur-2xl transition group-hover:bg-amber-100/70" />
                  <div className="pointer-events-none absolute -bottom-12 left-12 h-24 w-24 rounded-full bg-sky-100/40 blur-2xl opacity-0 transition group-hover:opacity-100" />
                </motion.div>
              </motion.article>
            ))}
        </motion.div>
      </div>
    </section>
  );
}

function Finale() {
  const [opened, setOpened] = useState(false);

  return (
    <section className="relative z-10 overflow-hidden px-5 py-24 sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(251,191,36,0.16),transparent_28%),radial-gradient(circle_at_75%_10%,rgba(244,114,182,0.16),transparent_24%),radial-gradient(circle_at_50%_90%,rgba(186,230,253,0.22),transparent_28%)]" />
      {finaleLights.map((light) => (
        <motion.span
          key={light.id}
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.8)]"
          style={{ left: light.left, top: light.top }}
          animate={{ opacity: [0.15, 0.72, 0.18], scale: [0.8, 1.55, 0.9], y: [0, -7, 2] }}
          transition={{ delay: light.delay, duration: 4.4, repeat: Infinity, ease: gentleEase }}
        />
      ))}
      <motion.div
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/45 p-8 text-center shadow-glow backdrop-blur-2xl sm:p-14"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        animate={opened ? { boxShadow: "0 30px 120px rgba(251, 191, 36, 0.28)" } : {}}
        transition={{ duration: 0.85, ease: softEase }}
      >
        <p className="mx-auto max-w-3xl font-display text-4xl leading-tight text-slate-950 sm:text-6xl">
          Maybe we didn&apos;t create hundreds of memories,
          <br />
          but the few we had were genuinely nice ✨
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Hope this year brings you happiness, peace, and beautiful moments 🎂
        </p>

        <div className="relative mx-auto mt-10 grid max-w-xl place-items-center">
          <AnimatePresence>
            {opened && (
              <motion.div
                className="pointer-events-none absolute inset-0 grid place-items-center"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {finaleBursts.map((burst) => (
                  <motion.span
                    key={burst.id}
                    className="absolute text-xl drop-shadow-sm"
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
                    animate={{
                      x: Math.cos(burst.angle) * burst.distance,
                      y: Math.sin(burst.angle) * burst.distance,
                      opacity: [0, 1, 0],
                      scale: [0.4, 1.1, 0.75],
                      rotate: burst.id % 2 ? 18 : -18
                    }}
                    transition={{ delay: burst.delay, duration: 1.75, ease: softEase }}
                  >
                    {burst.icon}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={() => setOpened((value) => !value)}
            className="relative overflow-hidden rounded-full border border-white/80 bg-gradient-to-r from-white/80 via-rose-50/80 to-amber-50/80 px-6 py-4 text-sm font-black text-slate-800 shadow-glow backdrop-blur-xl transition focus:outline-none focus:ring-4 focus:ring-amber-100 sm:px-8"
            whileHover={{ y: -3, scale: 1.012 }}
            whileTap={{ scale: 0.96 }}
            transition={smoothSpring}
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              animate={opened ? { x: ["-120%", "120%"] } : { x: "-120%" }}
              transition={{ duration: 1.25, ease: gentleEase }}
            />
            <span className="relative">No awkward gifts this time. Just good memories ✨</span>
          </motion.button>

          <AnimatePresence>
            {opened && (
              <motion.p
                className="mt-5 font-hand text-4xl leading-tight text-rose-500"
                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.58, ease: softEase }}
              >
                Growth happened 😭🍫
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}

function App() {
  const [noteOpen, setNoteOpen] = useState(false);
  const { playing, toggle } = useAmbientMusic();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  const backgroundStyle = useMemo(
    () => ({
      background:
        "linear-gradient(135deg, #fff7ed 0%, #fdf2f8 34%, #eef2ff 68%, #ecfeff 100%)"
    }),
    []
  );

  return (
    <main className="relative min-h-screen overflow-hidden font-body text-slate-900" style={backgroundStyle}>
      <FloatingParticles />
      <MusicToggle playing={playing} onToggle={toggle} />
      <Hero onReveal={() => setNoteOpen(true)} />
      <WishCards />
      <Gallery />
      <Timeline />
      <Finale />
      <SpecialNote open={noteOpen} onClose={() => setNoteOpen(false)} />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
