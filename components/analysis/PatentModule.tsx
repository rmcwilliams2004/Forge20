import React, { useState, useEffect } from 'react';
import { AnalysisResult, IngestedDocument, IndependentClaim, User, InnovationCertificate, SubscriptionStatus, ProtectionTypePref, FoundryState, NoveltyPoint } from '../../types';
import { Section } from './Section';
import { usePatentGenerator } from '../../hooks/usePatentGenerator';
import { generateInnovationCertificatePDF } from '../../services/pdfService';
import { Modal } from '../Modal';

interface PatentModuleProps {
    result: AnalysisResult;
    patentGenerator: ReturnType<typeof usePatentGenerator>;
    isViewer: boolean;
    knowledgeBase?: IngestedDocument[];
    authenticatedUser: User;
    onUpdateUser: (user: User) => void;
    project: any;
    foundryState?: FoundryState;
}

/**
 * A specialized component to render a patent claim with visual highlighting for its formal parts.
 */
const FormalClaimDisplay: React.FC<{ claim: IndependentClaim; index: number }> = ({ claim, index }) => {
    const transitionalPhrases = ['comprising', 'consisting of', 'consisting essentially of'];
    let preamble = "";
    let transition = "";
    let body = claim.text;

    for (const phrase of transitionalPhrases) {
        const regex = new RegExp(`\\b${phrase}\\b`, 'i');
        const match = claim.text.match(regex);
        if (match && match.index !== undefined) {
            preamble = claim.text.substring(0, match.index).trim();
            transition = match[0];
            body = claim.text.substring(match.index + phrase.length).trim();
            break;
        }
    }

    const bodyParts = body.split(/(wherein\b)/gi);

    return (
        <div className="relative group">
            <div className="bg-gray-900/60 p-8 rounded-2xl border border-gray-700/50 group-hover:border-indigo-500/50 transition-all shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="px-3 py-1 bg-indigo-600 rounded-lg shadow-xl shadow-indigo-900/40">
                        <span className="text-xs font-black text-white uppercase tracking-tighter">Claim 0{index + 1}</span>
                    </div>
                    <div className="h-px flex-1 bg-gray-800"></div>
                    <div className="flex gap-2">
                        <span className="text-[9px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">Independent</span>
                        <span className="text-[9px] font-black text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/20 uppercase tracking-widest">Formal Structure</span>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="p-6 bg-black/40 rounded-xl border border-gray-800/50 font-serif leading-relaxed text-gray-200">
                        {transition ? (
                            <div className="space-y-2">
                                <p className="mb-2 uppercase text-[10px] font-black text-gray-500 tracking-widest">Preamble</p>
                                <span className="text-indigo-400 font-bold text-lg leading-snug">{preamble}</span>
                                
                                <div className="py-1">
                                    <span className="text-brand-cyan font-black uppercase text-xs tracking-[0.2em]">{transition}</span>
                                </div>

                                <div className="space-y-2">
                                    <p className="mb-1 uppercase text-[10px] font-black text-gray-500 tracking-widest">Body</p>
                                    {bodyParts.map((part, i) => {
                                        const isToken = part.toLowerCase() === 'wherein';
                                        if (isToken) return null;
                                        const prevPartToken = bodyParts[i-1]?.toLowerCase() === 'wherein';
                                        return (
                                            <div key={i} className={`${prevPartToken ? 'pl-6 border-l border-indigo-500/30 ml-1' : ''}`}>
                                                {prevPartToken && <span className="text-brand-cyan font-bold italic mr-2">wherein</span>}
                                                <span className={`${prevPartToken ? 'text-gray-300 italic' : ''}`}>{part.trim()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <span className="text-gray-200 italic">{claim.text}</span>
                        )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-800/80">
                        <h6 className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full shadow-[0_0_10px_#06b6d4] animate-pulse"></span>
                            Inventive Step Rationale (PHOSITA Barrier)
                        </h6>
                        <div className="p-5 bg-brand-cyan/5 rounded-xl border border-brand-cyan/10 relative overflow-hidden">
                            <p className="text-sm text-gray-300 leading-relaxed font-medium relative z-10">
                                {claim.rationale}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="absolute -bottom-12 left-12 w-px h-12 bg-gradient-to-b from-gray-700 to-transparent"></div>
        </div>
    );
};

/**
 * Renders a structured Novelty Point card.
 */
const NoveltyPointDisplay: React.FC<{ point: NoveltyPoint; index: number }> = ({ point, index }) => (
    <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 hover:border-brand-cyan/40 transition-all group">
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan font-black border border-brand-cyan/20 group-hover:bg-brand-cyan group-hover:text-gray-900 transition-colors">
                {index + 1}
            </div>
            <div className="flex-1 space-y-4">
                <div>
                    <h6 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Technical Differentiator</h6>
                    <p className="text-lg font-bold text-white leading-tight group-hover:text-brand-cyan transition-colors">{point.text}</p>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-gray-700/30">
                    <h6 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Novelty Rationale</h6>
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{point.rationale}"</p>
                </div>
            </div>
        </div>
    </div>
);

export const PatentModule: React.FC<PatentModuleProps> = ({ result, patentGenerator, isViewer, knowledgeBase = [], authenticatedUser, onUpdateUser, project, foundryState }) => {
    const { patent, isGenerating, draftPatent } = patentGenerator;
    const [isSecuring, setIsSecuring] = useState(false);
    const [showCertSuccess, setShowCertSuccess] = useState(false);
    const [protectionType, setProtectionType] = useState<ProtectionTypePref>(authenticatedUser.default_protection_pref || 'AI_RECOMMENDED');

    const attributionOwner = authenticatedUser.use_company_attribution ? (authenticatedUser.company_name || authenticatedUser.name) : (authenticatedUser.legal_identity || authenticatedUser.name);

    const handleSecureInnovation = async () => {
        if (authenticatedUser.subscriptionStatus === SubscriptionStatus.FREE) {
            alert("Innovation Certificates are a premium Professional feature.");
            return;
        }

        setIsSecuring(true);
        const dummyHash = foundryState?.designHash || Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        const cert: InnovationCertificate = {
            id: `SYN-${Date.now().toString().slice(-8)}`,
            projectId: project.id,
            versionId: project.history[0]?.versionId || 'v1',
            timestamp: new Date().toISOString(),
            hash: dummyHash,
            legalOwner: attributionOwner,
            innovationType: patent?.protection_type as any || (protectionType === 'AI_RECOMMENDED' ? 'HARDWARE' : protectionType as any)
        };

        setTimeout(() => {
            generateInnovationCertificatePDF(cert, project);
            setIsSecuring(false);
            setShowCertSuccess(true);
            onUpdateUser({
                ...authenticatedUser,
                certificatesGenerated: (authenticatedUser.certificatesGenerated || 0) + 1
            });
        }, 2000);
    };

    const isDesignLocked = foundryState?.isLocked || false;

    return (
        <Section id="patent_application" title="IP & Patent Drafting">
            <div className="space-y-10">
                {!patent && !isGenerating && (
                    <div className="bg-indigo-900/10 border border-indigo-500/20 p-12 rounded-2xl backdrop-blur-md shadow-inner">
                        {!isDesignLocked ? (
                            <div className="text-center space-y-6">
                                <div className="p-5 bg-yellow-500/10 rounded-full w-fit mx-auto border border-yellow-500/30">
                                    <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">Design Forge: Uncommitted</h4>
                                <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                                    The Patent Synthesis engine requires a stable geometric snapshot. 
                                    Please <span className="text-brand-cyan font-bold">Lock Geometry</span> in the Foundry HUD to commit the physical configuration to the IP Ledger.
                                </p>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="flex justify-center mb-6">
                                     <div className="p-5 bg-indigo-500/10 rounded-full ring-1 ring-indigo-500/30">
                                        <svg className="w-14 h-14 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                     </div>
                                </div>
                                <h4 className="text-3xl font-black text-white mb-4 tracking-tighter text-center uppercase italic">Intellectual Property Synthesis</h4>
                                <div className="flex justify-center gap-3 mb-10">
                                    <span className="px-3 py-1 bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded-full text-[10px] font-black uppercase tracking-widest">Locked: {foundryState?.designHash?.slice(0,8)}</span>
                                    <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">Jurisdiction: {foundryState?.jurisdiction}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 max-w-4xl mx-auto">
                                    <div className="space-y-4">
                                        <label className="block text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Preferred Protection Strategy</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {(['AI_RECOMMENDED', 'PATENT', 'COPYRIGHT', 'TRADEMARK'] as ProtectionTypePref[]).map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setProtectionType(type)}
                                                    className={`px-4 py-2 text-left text-sm rounded-lg border transition-all ${protectionType === type ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-indigo-500'}`}
                                                >
                                                    <div className="font-bold">{type.replace('_', ' ')}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">PLaaS Attribution Preview</label>
                                        <div className="p-6 bg-black/40 border border-indigo-500/20 rounded-xl space-y-4">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Legal Owner of Record:</p>
                                                <p className="text-xl font-serif italic text-indigo-300">"{attributionOwner}"</p>
                                            </div>
                                            <p className="text-[9px] text-indigo-400/60 leading-relaxed italic">
                                                Claims will be calibrated for the {foundryState?.jurisdiction} legal framework.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={() => draftPatent(result, authenticatedUser, protectionType, foundryState?.jurisdiction || 'USPTO', foundryState?.designHash || '', knowledgeBase)}
                                        disabled={isViewer}
                                        className="w-full md:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-4"
                                    >
                                        Synthesize Formal IP Specification
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isGenerating && (
                    <div className="bg-gray-800/40 p-20 rounded-3xl border border-indigo-500/20 text-center animate-pulse relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer"></div>
                        <div className="flex justify-center mb-8">
                            <svg className="animate-spin h-14 w-14 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <p className="text-indigo-400 font-black text-2xl uppercase tracking-[0.3em]">Synthesizing Legal Claims...</p>
                        <p className="text-sm text-gray-500 mt-6 font-mono max-w-md mx-auto">Evaluating novelty vectors against PHOSITA synergy requirements for {foundryState?.jurisdiction} certification...</p>
                    </div>
                )}

                {patent && (
                    <div className="space-y-14 animate-fade-in">
                        <div className="bg-gray-800/60 p-10 rounded-3xl border-l-8 border-indigo-500 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 text-right">
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-4 py-1 rounded-md border border-indigo-500/20 uppercase tracking-[0.25em]">Draft: IP-SYN-{Date.now().toString().slice(-6)}</span>
                                    <div className="text-[10px] font-black text-brand-cyan bg-cyan-900/40 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest mt-1">
                                        Jurisdiction: {patent.jurisdiction}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="max-w-4xl">
                                <h5 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">Innovation Title</h5>
                                <h4 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-10 uppercase italic">{patent.title}</h4>
                                <p className="text-lg text-gray-300 italic leading-relaxed font-serif p-8 bg-gray-900/40 rounded-2xl border border-gray-700/50 shadow-inner">
                                    {patent.abstract}
                                </p>
                            </div>
                        </div>

                        {/* NOVELTY POINTS SECTION */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h5 className="font-black text-xs text-brand-cyan uppercase tracking-[0.3em] whitespace-nowrap">Technical Novelty & Differentiation</h5>
                                <div className="h-px w-full bg-cyan-900/30"></div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {patent.novelty_points.map((point, i) => (
                                    <NoveltyPointDisplay key={i} point={point} index={i} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className="flex items-center gap-4">
                                <h5 className="font-black text-xs text-indigo-400 uppercase tracking-[0.3em] whitespace-nowrap">Formal Legal Claim Set ({foundryState?.jurisdiction})</h5>
                                <div className="h-px w-full bg-indigo-900/50"></div>
                            </div>
                            
                            <div className="space-y-16">
                                {patent.independent_claims.map((claim, i) => (
                                    <FormalClaimDisplay key={i} claim={claim} index={i} />
                                ))}
                            </div>
                        </div>

                        <div className="pt-10 border-t border-gray-800 flex flex-wrap justify-between items-center gap-6">
                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse"></span>
                                Fingerprint Layer: {patent.legal_hash}
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={handleSecureInnovation}
                                    disabled={isSecuring}
                                    className={`px-10 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-2xl flex items-center gap-3 bg-brand-cyan text-white hover:bg-cyan-500 shadow-cyan-900/30`}
                                >
                                    {isSecuring ? 'Securing...' : 'Finalize & Secure Certificate'}
                                </button>
                                <button 
                                    onClick={() => patentGenerator.clearPatent()}
                                    className="px-6 py-3 text-xs font-bold text-gray-500 hover:text-white transition bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600"
                                >
                                    Refine Strategy
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <Modal
                isOpen={showCertSuccess}
                onClose={() => setShowCertSuccess(false)}
                title="Innovation Secured Successfully"
                confirmText="Done"
                onConfirm={() => setShowCertSuccess(false)}
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-400 border border-green-500/50 shadow-xl shadow-green-900/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </div>
                    <h5 className="text-lg font-bold text-white">Authorship Recorded</h5>
                    <p className="text-sm text-gray-400">
                        A unique Innovation Certificate has been generated for your record.
                    </p>
                </div>
            </Modal>
        </Section>
    );
};