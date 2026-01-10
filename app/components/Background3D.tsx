'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

function Stars(props: React.ComponentProps<typeof Points>) {
    const ref = useRef<React.ComponentRef<typeof Points>>(null);
    const [sphere] = useState<Float32Array>(() => {
        const positions = new Float32Array(5000);
        const result = random.inSphere(positions, { radius: 1.5 }) as Float32Array;
        // Verify no NaN values
        for (let i = 0; i < result.length; i++) {
            if (isNaN(result[i])) result[i] = 0;
        }
        return result;
    });

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#ffa0e0"
                    size={0.005}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
}

export default function Background3D() {
    return (
        <div className="fixed inset-0 -z-10 bg-black">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Stars />
            </Canvas>
        </div>
    );
}
