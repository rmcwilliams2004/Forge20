import React, { useState } from 'react';

interface AuthPageProps {
    onGoogleAuth: () => Promise<void>;
    onDemoLogin: (userName: string) => void;
    onSignup: (name: string, email: string) => void;
}

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      <path d="M1 1h22v22H1z" fill="none"/>
    </svg>
);


export const AuthPage = ({ onGoogleAuth, onDemoLogin, onSignup }: AuthPageProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isNameFocused, setIsNameFocused] = useState(false);
    
    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            await onGoogleAuth();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim() && name.trim()) {
            onSignup(name.trim(), email.trim());
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-cyan/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="flex items-center gap-3 mb-8 z-10">
                <svg className="w-14 h-14 text-brand-cyan drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
                <div>
                    <h1 className="text-5xl font-black text-brand-light tracking-wider leading-none">
                        Synapse<span className="text-brand-cyan">Forge</span> AI
                    </h1>
                    <p className="text-xs text-gray-500 uppercase font-black tracking-[0.3em] mt-1 ml-1">PLaaS Infrastructure v12.1</p>
                </div>
            </div>

            <div className="w-full max-w-sm bg-gray-900/40 backdrop-blur-2xl border border-gray-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-10 animate-fade-in z-10">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-brand-light tracking-tight text-center leading-none">
                        {isSignup ? 'Join the Forge' : 'Welcome back'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                        {isSignup 
                            ? 'Establish your identity and begin innovation.' 
                            : 'Access your sovereign engineering vault.'}
                    </p>
                </div>
                
                {isSignup ? (
                    <form onSubmit={handleSignupSubmit} className="space-y-6">
                        <div className="relative group">
                            <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${isNameFocused || name ? 'top-[-10px] text-[10px] bg-gray-900 px-2 text-brand-cyan font-black tracking-widest uppercase' : 'top-4 text-gray-500 text-sm'}`}>
                                Full Legal Name
                            </label>
                            <input 
                                type="text" 
                                className="w-full p-4 bg-transparent text-white rounded-xl border border-gray-700 focus:border-brand-cyan outline-none transition-all duration-300 ring-0 focus:ring-2 focus:ring-brand-cyan/20"
                                value={name}
                                onFocus={() => setIsNameFocused(true)}
                                onBlur={() => setIsNameFocused(false)}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative group">
                            <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${isEmailFocused || email ? 'top-[-10px] text-[10px] bg-gray-900 px-2 text-brand-cyan font-black tracking-widest uppercase' : 'top-4 text-gray-500 text-sm'}`}>
                                Work Email
                            </label>
                            <input 
                                type="email" 
                                className="w-full p-4 bg-transparent text-white rounded-xl border border-gray-700 focus:border-brand-cyan outline-none transition-all duration-300 ring-0 focus:ring-2 focus:ring-brand-cyan/20"
                                value={email}
                                onFocus={() => setIsEmailFocused(true)}
                                onBlur={() => setIsEmailFocused(false)}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-brand-cyan text-gray-900 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-cyan-400 transition-all duration-300 transform active:scale-95 shadow-xl shadow-cyan-900/30">
                            Create Account
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleAuth}
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-gray-700 rounded-xl shadow-sm text-md font-bold text-gray-800 bg-white hover:bg-gray-100 transition-all duration-300 active:scale-95 disabled:opacity-60"
                        >
                            {isLoading ? (
                                <>
                                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                                </>
                            ) : (
                                <>
                                <GoogleIcon />
                                Sign in with Google
                                </>
                            )}
                        </button>
                    </div>
                )}

                <div className="text-center mt-10 pt-6 border-t border-gray-800">
                    <button 
                        onClick={() => setIsSignup(!isSignup)} 
                        className="text-brand-cyan text-sm font-bold hover:text-cyan-300 transition-colors"
                    >
                        {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Join Now"}
                    </button>
                </div>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-800" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-3 bg-gray-900 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Simulated Access</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => onDemoLogin('Alex (Admin)')}
                        className="flex justify-center items-center py-3 px-2 border border-purple-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-purple-300 bg-purple-900/10 hover:bg-purple-900/20 transition-all active:scale-95"
                    >
                        Alex (Admin)
                    </button>
                     <button
                        onClick={() => onDemoLogin('Blake (Demo User)')}
                        className="flex justify-center items-center py-3 px-2 border border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-800/10 hover:bg-gray-800/20 transition-all active:scale-95"
                    >
                        Demo User
                    </button>
                </div>
            </div>
            
            <div className="mt-12 flex flex-col items-center gap-4 z-10">
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em] text-center max-w-sm leading-relaxed px-6">
                    Identity-verified IP sovereignty enforced via AES-256 encrypted ledger.
                </p>
                <div className="flex gap-6 grayscale opacity-30">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Google_Pay_Logo.svg" alt="Google Pay" className="h-4" />
                </div>
            </div>
        </div>
    );
};