import React, { useState, useEffect, useCallback } from 'react';
import { backendApiService } from '../../services/backendApiService';
import { 
  ShieldCheck, 
  BookOpen, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Search, 
  ExternalLink, 
  Layers, 
  Box, 
  FileText, 
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PreFlightRagPanelProps {
  prompt: string;
  onAdoptComponent?: (component: any) => void;
  onInjectConstraints?: (constraintsText: string) => void;
  onProceedGenerative?: () => void;
  isEngaging?: boolean;
}

export const PreFlightRagPanel: React.FC<PreFlightRagPanelProps> = ({
  prompt,
  onAdoptComponent,
  onInjectConstraints,
  onProceedGenerative,
  isEngaging = false
}) => {
  const [queryData, setQueryData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'components' | 'standards' | 'equipment'>('components');
  const [adoptedComponentId, setAdoptedComponentId] = useState<string | null>(null);
  const [injectedStandards, setInjectedStandards] = useState<Set<string>>(new Set());

  // Perform debounced RAG search whenever prompt changes
  const performSearch = useCallback(async (queryText: string) => {
    if (!queryText || queryText.trim().length < 4) {
      setQueryData(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await backendApiService.queryEngineeringVault({
        query: queryText.trim(),
        top_k: 6,
        alpha: 0.6
      });
      setQueryData(res);
      // Default to components tab if matches exist, else standards
      if (res.matched_components?.length > 0) {
        setActiveTab('components');
      } else if (res.matched_standards?.length > 0) {
        setActiveTab('standards');
      }
    } catch (err) {
      console.error("RAG Query Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(prompt);
    }, 450);
    return () => clearTimeout(timer);
  }, [prompt, performSearch]);

  if (!prompt || prompt.trim().length < 4) {
    return null;
  }

  const componentsCount = queryData?.matched_components?.length || 0;
  const standardsCount = queryData?.matched_standards?.length || 0;
  const equipmentCount = queryData?.matched_equipment?.length || 0;
  const totalMatches = componentsCount + standardsCount + equipmentCount;

  return (
    <div className="mb-4 rounded-2xl border border-sky-500/30 bg-slate-950/80 backdrop-blur-xl shadow-2xl overflow-hidden transition-all animate-fade-in">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 bg-gradient-to-r from-sky-950/60 via-slate-900/80 to-indigo-950/60 border-b border-sky-500/20 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Engineering Intelligence Layer (RAG Vault)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                pgvector Hybrid Search
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isLoading ? (
                <span className="flex items-center gap-1.5 text-sky-400">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Querying validated components &amp; ISO/ASTM standards...
                </span>
              ) : (
                <span>
                  {totalMatches > 0 
                    ? `${totalMatches} verified asset${totalMatches > 1 ? 's' : ''} surfaced (${queryData?.latency_ms || 32}ms)`
                    : 'Surfacing existing certified components before generative models engage.'}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalMatches > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {componentsCount} Components
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                {standardsCount} Standards
              </span>
            </div>
          )}
          <button className="text-slate-400 hover:text-white p-1">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && queryData && (
        <div className="p-4 space-y-4">
          {/* Synthesis Recommendation Banner */}
          {queryData.synthesis?.summary && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
              queryData.synthesis?.has_existing_component
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-sky-950/40 border-sky-500/30 text-sky-200'
            }`}>
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-400 block mb-0.5">
                  Pre-Flight Guidance Recommendation:
                </span>
                <p>{queryData.synthesis.summary}</p>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('components')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'components'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Validated Components ({componentsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('standards')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'standards'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Governing Standards ({standardsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'equipment'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Hardware &amp; Equipment Resources ({equipmentCount})</span>
            </button>
          </div>

          {/* Tab 1: Validated Components */}
          {activeTab === 'components' && (
            <div className="space-y-3">
              {componentsCount === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-mono">
                  No existing identical component found. Proceed with constrained generative reverse engineering.
                </div>
              ) : (
                queryData.matched_components.map((comp: any, idx: number) => {
                  const isAdopted = adoptedComponentId === comp.reference_code;
                  return (
                    <div 
                      key={idx}
                      className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {comp.reference_code}
                          </span>
                          <h5 className="text-xs font-bold text-white">{comp.title}</h5>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
                            {comp.metadata?.qualification || 'QUALIFIED'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{comp.content}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500 pt-1">
                          <span>Material: <strong className="text-slate-300">{comp.material}</strong></span>
                          <span>Envelope: <strong className="text-slate-300">{comp.metadata?.bounding_box_mm?.x}×{comp.metadata?.bounding_box_mm?.y}×{comp.metadata?.bounding_box_mm?.z} mm</strong></span>
                          <span>Inventory: <strong className="text-emerald-400">{comp.metadata?.stock_qty} in stock</strong></span>
                          <span>Unit Cost: <strong className="text-slate-300">${comp.metadata?.unit_cost_usd}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setAdoptedComponentId(comp.reference_code);
                            onAdoptComponent?.(comp);
                          }}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                            isAdopted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                          }`}
                        >
                          {isAdopted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                          <span>{isAdopted ? 'Component Adopted' : 'Adopt Component'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Standards & Regulatory Rules */}
          {activeTab === 'standards' && (
            <div className="space-y-3">
              {standardsCount === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-mono">
                  No standard specifications surfaced for this query.
                </div>
              ) : (
                queryData.matched_standards.map((std: any, idx: number) => {
                  const isInjected = injectedStandards.has(std.reference_code);
                  return (
                    <div 
                      key={idx}
                      className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-start justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {std.reference_code}
                          </span>
                          <h5 className="text-xs font-bold text-white">{std.title}</h5>
                          <span className="text-[9px] text-slate-500 font-mono">
                            Safety Factor: {std.metadata?.safety_factor}x
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{std.content}</p>
                        
                        {/* Parameter Limit Pills */}
                        {std.metadata?.parameter_limits && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {Object.entries(std.metadata.parameter_limits).map(([key, val]: any) => (
                              <span key={key} className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-950 border border-slate-700 text-slate-300">
                                {key.replace(/_/g, ' ')}: <strong className="text-indigo-400">{val}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setInjectedStandards(prev => new Set(prev).add(std.reference_code));
                            const constraintText = `Adhere to ${std.reference_code}: ${std.content}. Parameter limits: ${JSON.stringify(std.metadata?.parameter_limits || {})}`;
                            onInjectConstraints?.(constraintText);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            isInjected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
                          }`}
                        >
                          {isInjected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
                          <span>{isInjected ? 'Constraints Injected' : 'Inject Limits'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 3: Hardware & Equipment Resources */}
          {activeTab === 'equipment' && (
            <div className="space-y-3">
              {equipmentCount === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-mono">
                  No matching fabrication work centers found.
                </div>
              ) : (
                queryData.matched_equipment.map((eq: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {eq.reference_code}
                      </span>
                      <h5 className="font-bold text-white">{eq.title}</h5>
                    </div>
                    <p className="text-slate-400 text-xs">{eq.content}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
