import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, DatabaseZap, FileSearch } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Button from '../components/ui/Button';

function FloatingMesh() {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime / 3) * 0.25;
    meshRef.current.rotation.y += 0.01;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.2;
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.35} wireframe />
      </mesh>
      <mesh scale={0.7} rotation={[0.6, 0.4, 0]}>
        <boxGeometry args={[1.4, 1.8, 0.14]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.25} metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}

export default function Landing() {
  const headline = 'Retrieve. Understand. Act.';
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setTyped(headline.slice(0, index));
      if (index >= headline.length) {
        window.clearInterval(intervalId);
      }
    }, 85);

    return () => window.clearInterval(intervalId);
  }, []);

  const features = useMemo(
    () => [
      {
        icon: FileSearch,
        title: 'Context-rich retrieval',
        description: 'Search indexed PDFs, scans, and text corpora through one latency-aware workspace.',
      },
      {
        icon: BrainCircuit,
        title: 'Decision-ready synthesis',
        description: 'Grounded answers arrive with citations, model visibility, and session memory.',
      },
      {
        icon: DatabaseZap,
        title: 'Operational observability',
        description: 'Track ingestion health, storage growth, and model usage without leaving the platform.',
      },
    ],
    [],
  );

  return (
    <motion.div
      className="aurora-hero min-h-screen"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="font-display text-2xl font-semibold text-white">DocuMind</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.36em] text-cyan/70">Dark Neural Platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Button as={Link} to="/login" variant="secondary">
            Sign In
          </Button>
          <Button as={Link} to="/register">
            Get Started
          </Button>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-12 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="relative z-10">
          <p className="font-mono text-xs uppercase tracking-[0.45em] text-cyan/70">AI Document Intelligence</p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-tight text-white md:text-7xl">
            {typed}
            <span className="ml-1 inline-block h-[1em] w-[2px] animate-pulse bg-cyan align-middle" />
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Replace fragmented document review with a neural operations desk built for secure ingestion, grounded retrieval, and action-ready chat.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button as={Link} to="/register">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button as={Link} to="/login" variant="secondary">
              Sign In
            </Button>
          </div>
        </div>

        <div className="glass-panel neural-outline relative h-[420px] rounded-[36px] p-6">
          <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.15),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_40%)]" />
          <Canvas camera={{ position: [0, 0, 4.5], fov: 55 }}>
            <ambientLight intensity={1.1} />
            <pointLight position={[3, 3, 4]} intensity={25} color="#00E5FF" />
            <pointLight position={[-4, -3, 2]} intensity={18} color="#7C3AED" />
            <FloatingMesh />
          </Canvas>
          <div className="absolute bottom-6 left-6 right-6 rounded-[24px] border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cyan/70">Live Pipeline</p>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
              <span>Document ingestion mesh</span>
              <span>Grounded by indexed evidence</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="glass-card neural-outline rounded-[28px] p-6"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/20 bg-cyan/10">
                  <Icon className="h-5 w-5 text-cyan" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
