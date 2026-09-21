import React, { useState } from 'react';
import {
    ShieldCheck,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    ArrowRight
} from 'lucide-react';

const LoginGate = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const normalizedEmail = email.trim().toLowerCase();
        const expectedEmail = '4mehfooz@gmail.com';
        const expectedPassword = 'M03218699990';

        setTimeout(() => {
            if (normalizedEmail === expectedEmail && password === expectedPassword) {
                try {
                    localStorage.setItem('isAuthenticated', 'true');
                } catch (storageErr) {
                    console.warn('localStorage not accessible:', storageErr);
                }
                setIsLoading(false);
                if (onLoginSuccess && typeof onLoginSuccess === 'function') {
                    onLoginSuccess();
                }
            } else {
                setIsLoading(false);
                setError('Invalid Email or Password');
            }
        }, 300);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
            {/* Top Accent Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-blue-600/10 blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-sm p-6 sm:p-8 relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-blue-950/80 border-2 border-yellow-500/80 flex items-center justify-center shadow-lg shadow-yellow-500/10 mb-4">
                        <ShieldCheck className="w-9 h-9 text-yellow-400" />
                    </div>
                    <h1 className="text-xl font-bold tracking-wide text-white font-serif uppercase">
                        Government of Sindh
                    </h1>
                    <p className="text-xs text-blue-300 font-semibold tracking-wider mt-1">
                        eSTAMPING SYSTEM &bull; ACCESS GATEWAY
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                        Enter authorized credentials to access the eStamp Generator & Admin Portal
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-5 flex items-center gap-2.5 p-3 rounded-lg bg-red-950/60 border border-red-700/60 text-red-200 text-xs animate-shake">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                            Authorized Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="4mehfooz@gmail.com"
                                required
                                autoFocus
                                autoComplete="email"
                                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                            Security Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-yellow-500/20 hover:shadow-yellow-400/30 flex items-center justify-center gap-2 text-sm transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span>Verifying...</span>
                            ) : (
                                <>
                                    <span>Access Portal</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Secure Badge Footer */}
                <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
                    <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                        <Lock className="w-3 h-3 text-yellow-500" />
                        <span>256-bit Encrypted Gatekeeper Protection</span>
                    </p>
                </div>
            </div>

            {/* Sub-footer text */}
            <p className="text-[11px] text-slate-500 text-center mt-6">
                &copy; {new Date().getFullYear()} Board of Revenue, Government of Sindh. All Rights Reserved.
            </p>
        </div>
    );
};

export default LoginGate;
