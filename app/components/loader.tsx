'use client';

import { SetStateAction, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ILoader {
    setIsLoading: React.Dispatch<SetStateAction<boolean>>;
};

export default function Loader({setIsLoading}: ILoader) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Sabrina is tuning her guitar... 🎸');

    const statuses = [
        'Sabrina is tuning her guitar... 🎸',
        'Adding a little sparkle... ✨',
        'That\'s that me espresso... ☕',
        'Final touch of pink glitter... 💖',
        'Ready to chat! 💋'
    ];

    useEffect(() => {
        const duration = 3000;
        const stepTime = 30;
        const totalSteps = Math.ceil(duration / stepTime);
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            const newProgress = Math.min(100, Math.floor((currentStep / totalSteps) * 100));
            setProgress(newProgress);

            const statusIndex = Math.min(
                Math.floor((newProgress / 100) * statuses.length),
                statuses.length - 1
            );
            setStatus(statuses[statusIndex]);

            if (currentStep >= totalSteps) {
                clearInterval(interval);
                setTimeout(() => {
                    setIsLoading(false);
                }, 300);
            }
        }, stepTime);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="min-h-screen bg-linear-to-br from-pink-100 via-blue-100 to-purple-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            <div className="absolute top-10 left-10 w-40 h-40 bg-pink-300/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 left-1/4 w-28 h-28 bg-purple-300/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-md">

                <div className="relative mb-8">
                    <img
                        src="/sabrina.png"
                        alt="Sabrina Carpenter"
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                    />
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-ping" />
                    <div className="absolute inset-0 rounded-full animate-pulse bg-pink-400/20"></div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-pink-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                    {status}
                </h2>

                <div className="w-full flex flex-col items-center max-w-xs mt-6">
                    <div className="w-60 bg-white/50 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="h-full bg-linear-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 font-medium">
                        {Math.round(progress)}%
                    </p>
                </div>

                <p className="text-gray-500 text-sm mt-8">
                    Made with 💖 for real ones
                </p>
            </div>
        </div>
    );
}
