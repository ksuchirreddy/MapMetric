import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 1. Procedural Animated 3D Terrain Mesh
const ProceduralTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  const { geometry, originalZ } = useMemo(() => {
    const width = 60;
    const height = 60;
    const segments = 50;
    const geo = new THREE.PlaneGeometry(width, height, segments, segments);
    const pos = geo.attributes.position;
    const zArray = new Float32Array(pos.count);

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) * 0.1;
      const v = pos.getY(i) * 0.1;
      const z = Math.sin(u) * Math.cos(v) * 1.5 + Math.sin(u * 2 + v * 2) * 0.5;
      pos.setZ(i, z);
      zArray[i] = z;
    }

    geo.computeVertexNormals();
    return { geometry: geo, originalZ: zArray };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) * 0.1;
      const v = pos.getY(i) * 0.1;
      const z = originalZ[i] + Math.sin(t * 1.5 + u) * 0.4 + Math.cos(t * 1.2 + v) * 0.3;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2.5, 0, 0]}
      position={[0, -7, -10]}
    >
      <meshStandardMaterial
        color="#0F172A"
        wireframe
        emissive="#065F46"
        emissiveIntensity={0.6}
        transparent
        opacity={0.35}
      />
    </mesh>
  );
};

// 2. Flowing 3D Data Streams
const DataStream = () => {
  const curvePoints = useMemo(() => {
    return [
      new THREE.Vector3(-15, -4, -10),
      new THREE.Vector3(-8, 2, -5),
      new THREE.Vector3(0, -2, 0),
      new THREE.Vector3(8, 4, -5),
      new THREE.Vector3(15, -3, -10),
    ];
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(curvePoints), [curvePoints]);
  const splineMesh = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(100));
    const mat = new THREE.LineBasicMaterial({ color: '#38BDF8', transparent: true, opacity: 0.4 });
    return new THREE.Line(geo, mat);
  }, [curve]);

  const packetRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (packetRef.current) {
      const progress = (state.clock.getElapsedTime() * 0.25) % 1;
      const pt = curve.getPoint(progress);
      packetRef.current.position.copy(pt);
    }
  });

  return (
    <group>
      <primitive object={splineMesh} />
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#38BDF8" />
      </mesh>
    </group>
  );
};

// 3. Floating Parallax Stars & Spatial Dust Particles
const StarDust = () => {
  const count = 1200;
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const color1 = new THREE.Color('#10B981');
    const color2 = new THREE.Color('#3B82F6');
    const color3 = new THREE.Color('#06B6D4');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const mix = Math.random();
      const chosen = mix < 0.4 ? color1 : mix < 0.8 ? color2 : color3;
      col[i * 3] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }

    return { positions: pos, colors: col };
  }, []);

  const particlesRef = useRef<THREE.Points>(null!);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// 4. Smooth Parallax Camera Mouse Tracking Controller
const CameraParallaxController = () => {
  useFrame((state) => {
    const mouseX = state.mouse.x * 1.5;
    const mouseY = state.mouse.y * 1.5;

    state.camera.position.x += (mouseX - state.camera.position.x) * 0.05;
    state.camera.position.y += (-mouseY - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};

export const SpaceEnvironment: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <fogExp2 attach="fog" color="#060911" density={0.035} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#10B981" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color="#3B82F6" />

        <CameraParallaxController />
        <ProceduralTerrain />
        <DataStream />
        <StarDust />
      </Canvas>
    </div>
  );
};
