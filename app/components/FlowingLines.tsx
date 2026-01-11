'use client';

import { useEffect, useRef } from 'react';

export default function FlowingLines() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener('resize', resize);

        const drawLine = (yOffset: number, amplitude: number, frequency: number, speed: number, alpha: number) => {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 1.5;

            for (let x = 0; x <= canvas.width; x += 3) {
                const y = canvas.height * 0.65 + yOffset +
                    Math.sin((x * frequency) + (time * speed)) * amplitude +
                    Math.sin((x * frequency * 0.5) + (time * speed * 0.7)) * (amplitude * 0.5);

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < 30; i++) {
                const yOffset = (i - 15) * 12;
                const amplitude = 25 + Math.sin(i * 0.3) * 12;
                const frequency = 0.003 + (i * 0.00015);
                const speed = 0.015 + (i * 0.0015);
                const alpha = 0.12 + (Math.sin(i * 0.5) * 0.08);

                drawLine(yOffset, amplitude, frequency, speed, alpha);
            }

            time += 1;
            animationId = requestAnimationFrame(animate);
        };

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
