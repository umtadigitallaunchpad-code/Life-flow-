import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX } from 'lucide-react';

const HeartCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const toggleSound = () => {
    if (!soundEnabled) {
      initAudio();
    }
    setSoundEnabled(!soundEnabled);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.15); // Matte black fog

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // LIGHTING (realistic medical look)
    const light1 = new THREE.DirectionalLight(0xffcccc, 2);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.AmbientLight(0x550000);
    scene.add(light2);

    // PROCEDURAL HEART MESH (Icosahedron as base)
    const geometry = new THREE.IcosahedronGeometry(1.2, 64); // High detail

    // SHADERS
    const vertexShader = `
      uniform float time;
      uniform float pulse;
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vPosition = position;
        vNormal = normal;

        // Procedural Heart Shape Deformation
        vec3 p = position;
        // Flatten z slightly
        p.z *= 0.6;
        // Indent the top
        p.y -= abs(p.x) * 0.5;
        // Taper the bottom
        if(p.y < 0.0) {
           p.x *= (1.0 + p.y * 0.5);
           p.z *= (1.0 + p.y * 0.5);
           p.y *= 1.2;
        }

        // Radial expansion (simulate contraction)
        // pulse represents the contraction phase (0 = relaxed, 1 = fully contracted)
        // A real heart twists and squeezes. We'll simulate this by indenting the sides and slightly twisting.
        float contraction = pulse * 0.15;
        vec3 transformed = p + normal * contraction;

        // Add some noise/texture displacement
        float noise = sin(p.x * 10.0 + time) * cos(p.y * 10.0 + time) * 0.02;
        transformed += normal * noise;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float time;
      uniform float pulse;
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        // Deep red base
        vec3 baseColor = vec3(0.5, 0.0, 0.05);

        // lighting
        vec3 lightDirection = normalize(vec3(5.0, 5.0, 5.0));
        float diffuse = max(dot(vNormal, lightDirection), 0.0);
        
        // Animated flow (artery-like movement)
        float flow = sin(vPosition.y * 10.0 - time * 5.0);

        // Highlight pulse
        float glow = pulse * 0.8;

        // Edge rim lighting
        float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
        rim = smoothstep(0.6, 1.0, rim);
        vec3 rimColor = vec3(0.8, 0.0, 0.1) * rim;

        vec3 color = (baseColor + vec3(flow * 0.1, 0.0, 0.0)) * (diffuse + 0.3) + glow * vec3(0.4, 0.0, 0.0) + rimColor;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pulse: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      wireframe: false
    });

    const heart = new THREE.Mesh(geometry, material);
    
    // Add floating blood particles inside
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount * 3; i++) {
       posArray[i] = (Math.random() - 0.5) * 5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xff0000,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particlesMesh);
    scene.add(heart);

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    
    let lastPhase = 0;
    // Keep a stable ref to sound tracking to avoid closure stale state
    const soundState = {
      enabled: false,
      hasPlayedBeat: false
    };

    const playThud = (ctx: AudioContext, time: number, freq: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.2, time + duration);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    };

    const checkHeartbeatSound = (t: number) => {
      const bps = 1.2; // 72 BPM
      const phase = (t * bps) % 1.0;
      
      // Detect when phase wraps around 1.0 back to 0
      if (phase < lastPhase) {
        soundState.hasPlayedBeat = false;
      }
      
      // Play sound near the start of the cycle
      if (phase > 0.05 && !soundState.hasPlayedBeat && soundState.enabled && audioCtxRef.current) {
        soundState.hasPlayedBeat = true;
        const ctx = audioCtxRef.current;
        if (ctx.state === 'running') {
          const now = ctx.currentTime;
          // Lub (Start of Systole - AV valves close)
          playThud(ctx, now, 70, 0.15, 0.5);
          // Dub (Start of Diastole - Semilunar valves close)
          playThud(ctx, now + 0.22, 90, 0.15, 0.3);
        }
      }

      lastPhase = phase;
    };

    const renderLoop = () => {
      requestAnimationFrame(renderLoop);

      const t = clock.getElapsedTime();
      
      // React state is tracked via ref-like object
      const currentState = document.getElementById('sound-enabled')?.getAttribute('data-enabled') === 'true';
      soundState.enabled = currentState;
      
      checkHeartbeatSound(t);

      // Real Cardiac Cycle (systole/diastole)
      const bps = 1.2; // ~72 BPM
      const phase = (t * bps) % 1.0;
      
      // Systole (contraction phase) - sharp peak
      const systole = Math.exp(-Math.pow((phase - 0.1) / 0.04, 2));
      
      // Diastole (relaxation phase, with a slight dicrotic notch/bump)
      const diastole = 0.4 * Math.exp(-Math.pow((phase - 0.32) / 0.06, 2));
      
      const heartbeat = systole + diastole;
      
      material.uniforms.time.value = t;
      material.uniforms.pulse.value = heartbeat;
      
      // Add slight twisting during contraction
      heart.rotation.y = t * 0.1 + heartbeat * 0.1;
      heart.rotation.z = Math.sin(t * 0.5) * 0.05 + heartbeat * 0.05;

      particlesMesh.rotation.y = t * 0.05;
      const positions = particlesMesh.geometry.attributes.position.array as Float32Array;
      for(let i=1; i<particleCount*3; i+=3) {
         // Accererate blood flow during systole
         positions[i] += 0.01 + heartbeat * 0.03;
         if (positions[i] > 2.5) {
            positions[i] = -2.5;
         }
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    renderLoop();

    // RESIZE HANDLER
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <>
      <div id="sound-enabled" data-enabled={soundEnabled} className="hidden" />
      <div 
        ref={mountRef} 
        className="absolute top-0 left-0 w-full h-full -z-10 bg-background overflow-hidden pointer-events-none"
      />
      <button 
        onClick={toggleSound}
        className="absolute bottom-6 right-6 z-50 p-3 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-md hover:bg-white/10 transition-colors shadow-lg"
        title="Toggle Heartbeat Sound"
      >
        {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
    </>
  );
};

export default HeartCanvas;
