
import React from 'react';
import { IconBookOpen, IconRotateCcw } from './Icons';

interface HeaderProps {
    onReset: () => void;
    showReset: boolean;
}

const Header: React.FC<HeaderProps> = ({ onReset, showReset }) => {
    return (
        <header className="w-full flex justify-between items-center pb-4 border-b-2 border-slate-200">
            <div className="flex items-center gap-3">
                <div className="bg-sky-500 p-3 rounded-full">
                    <IconBookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">DocuAudio</h1>
                    <p className="text-sm sm:text-base text-slate-500">Your document reader assistant</p>
                </div>
            </div>
            {showReset && (
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                    aria-label="Start Over"
                >
                    <IconRotateCcw className="w-5 h-5" />
                    <span className="hidden sm:inline">Start Over</span>
                </button>
            )}
        </header>
    );
};

export default Header;
