'use client';

import { useRef } from 'react';

interface Props {
    onComplete: () => void;
    onSkip: () => void;
}

export default function IntroVideo({
    onComplete,
    onSkip,
}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <div
            className="fixed inset-0 z-50 bg-black"
            onClick={onSkip}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onEnded={onComplete}
            >
                <source src="/videos/multiverse-intro.mp4" />
            </video>

            <button
                className="absolute top-6 right-6 px-4 py-2 bg-black/60 backdrop-blur text-white rounded"
                onClick={(e) => {
                    e.stopPropagation();
                    onSkip();
                }}
            >
                Skip
            </button>
        </div>
    );
}