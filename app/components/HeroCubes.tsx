'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface CubeProps {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
}

function Cube({ position, rotation, scale }: CubeProps) {
    return (
        <RoundedBox
            args={[1, 1, 1]}
            radius={0.06}
            smoothness={4}
            position={position}
            rotation={rotation}
            scale={scale}
        >
            <meshPhysicalMaterial
                color="#0ea5e9"
                emissive="#0369a1"
                emissiveIntensity={0.4}
                roughness={0.05}
                metalness={0.2}
                transmission={0.6}
                thickness={1.5}
                clearcoat={1}
                clearcoatRoughness={0}
                ior={1.45}
                envMapIntensity={1.5}
            />
        </RoundedBox>
    );
}

function CubeCluster() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.12;
        }
    });

    const cubes = useMemo(() => {
        const cubeData: CubeProps[] = [];

        // Core 3x3x3 structure with gaps
        const corePositions: [number, number, number][] = [
            // Bottom layer
            [-1, -1, -1], [0, -1, -1], [1, -1, -1],
            [-1, -1, 0], [0, -1, 0], [1, -1, 0],
            [-1, -1, 1], [0, -1, 1], [1, -1, 1],
            // Middle layer
            [-1, 0, -1], [0, 0, -1], [1, 0, -1],
            [-1, 0, 0], [1, 0, 0],
            [-1, 0, 1], [0, 0, 1], [1, 0, 1],
            // Top layer
            [-1, 1, -1], [0, 1, -1], [1, 1, -1],
            [-1, 1, 0], [0, 1, 0], [1, 1, 0],
            [-1, 1, 1], [0, 1, 1], [1, 1, 1],

            // Extended cubes for the scattered effect
            [2, 0, 0], [2, 1, 0], [2, -1, 0],
            [2, 0, -1], [2, 1, 1],
            [-2, 0, 0], [-2, 1, 0],
            [0, 2, 0], [1, 2, 0], [-1, 2, 0],
            [0, 2, 1], [1, 2, -1],
            [0, -2, 0], [1, -2, 0],
            [2, 2, 0], [-1, 2, 1],
            [1, 0, 2], [0, 1, 2],
            [1, 0, -2], [0, 1, -2],
        ];

        corePositions.forEach((pos) => {
            cubeData.push({
                position: [
                    pos[0] * 1.15 + (Math.random() - 0.5) * 0.15,
                    pos[1] * 1.15 + (Math.random() - 0.5) * 0.15,
                    pos[2] * 1.15 + (Math.random() - 0.5) * 0.15
                ],
                rotation: [
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2
                ],
                scale: 0.9 + Math.random() * 0.15
            });
        });

        return cubeData;
    }, []);

    return (
        <group ref={groupRef} rotation={[0.4, -0.4, 0.1]} scale={1.8}>
            {cubes.map((cube, i) => (
                <Cube key={i} {...cube} />
            ))}
        </group>
    );
}

export default function HeroCubes() {
    return (
        <div className="w-full h-full">
            <Canvas
                camera={{ position: [0, 0, 14], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <Environment preset="city" />
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
                <directionalLight position={[-5, 5, 10]} intensity={1} color="#38bdf8" />
                <pointLight position={[5, -5, 5]} intensity={0.8} color="#0ea5e9" />

                <CubeCluster />
            </Canvas>
        </div>
    );
}
