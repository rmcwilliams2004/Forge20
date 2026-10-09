
import React, { useEffect, useRef, useState } from 'react';
import { AnalysisResult, Project, ProjectVersion, ComputeEvent, CadData, SimulationResult } from '../../types';
import { ProjectTimelineDashboard } from './ProjectTimelineDashboard';
import { History, BarChart3, Layers, Sparkles } from 'lucide-react';

declare const Plotly: any;

interface ProjectDashboardProps {
  result: AnalysisResult;
  project?: Project | null;
  activeVersion?: ProjectVersion | null;
  computeEvents?: ComputeEvent[];
  onRevertVersion?: (versionIndex: number) => void;
  onAddComputeEvent?: (event: ComputeEvent) => void;
  cadData?: CadData | null;
  simulationResult?: SimulationResult | null;
}

const parseNumericValue = (str: string): number => {
  if (!str) return 0;
  // Handle scientific notation and common delimiters
  const cleanStr = str.replace(/,/g, '');
  const match = cleanStr.match(/[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/);
  return match ? parseFloat(match[0]) : 0;
};

const getRiskValue = (level: 'Low' | 'Medium' | 'High'): number => {
  switch (level) {
    case 'High': return 3;
    case 'Medium': return 2;
    case 'Low': default: return 1;
  }
};

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ 
  result,
  project,
  activeVersion,
  computeEvents,
  onRevertVersion,
  onAddComputeEvent,
  cadData,
  simulationResult
}) => {
  const [dashboardTab, setDashboardTab] = useState<'timeline' | 'all' | 'matrices'>('all');
  const costChartRef = useRef<HTMLDivElement>(null);
  const materialChartRef = useRef<HTMLDivElement>(null);
  const riskChartRef = useRef<HTMLDivElement>(null);
  const materialBarChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result || typeof Plotly === 'undefined') return;
    if (dashboardTab === 'timeline') return;

    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#e2e8f0' : '#1f2937';
    const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

    // 1. Cost Distribution (Donut)
    const breakdown = result.preliminaryCostEstimate?.breakdown || [];
    const costLabels = breakdown.map(item => item.item);
    const costValues = breakdown.map(item => parseNumericValue(item.cost_estimate));

    if (costChartRef.current) {
      Plotly.newPlot(costChartRef.current, [{
        values: costValues,
        labels: costLabels,
        type: 'pie',
        hole: 0.6,
        marker: {
          colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e']
        },
        textinfo: 'label+percent',
        hoverinfo: 'label+value',
        automargin: true
      }], {
        title: { text: 'Cost Distribution', font: { color: textColor, size: 16, weight: 'bold' } },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        showlegend: false,
        height: 300,
        margin: { l: 20, r: 20, t: 40, b: 20 }
      }, { responsive: true, displayModeBar: false });
    }

    // 2. Material Performance (Radar)
    const materials = (result.material_suggestions || []).slice(0, 4);
    const materialData = materials.map(mat => ({
      type: 'scatterpolar',
      r: [
        parseNumericValue(mat.properties.tensile_strength),
        parseNumericValue(mat.properties.density) * 10,
        parseNumericValue(mat.properties.melting_point) / 10,
        parseNumericValue(mat.properties.conductivity) || 10
      ],
      theta: ['Strength', 'Density (x10)', 'Temp Res (/10)', 'Conductivity'],
      fill: 'toself',
      name: mat.name
    }));

    if (materialChartRef.current) {
      Plotly.newPlot(materialChartRef.current, materialData, {
        polar: {
          radialaxis: { visible: true, range: [0, 500], color: textColor, gridcolor: gridColor },
          angularaxis: { color: textColor, gridcolor: gridColor },
          bgcolor: isDarkMode ? '#1e293b' : '#f8fafc'
        },
        title: { text: 'Material Performance Matrix', font: { color: textColor, size: 16, weight: 'bold' } },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        showlegend: true,
        legend: { font: { color: textColor }, orientation: 'h', y: -0.3 },
        height: 350,
        margin: { l: 40, r: 40, t: 60, b: 80 }
      }, { responsive: true, displayModeBar: false });
    }

    // 3. Risk Matrix (Bubble)
    const risks = result.complianceAndSafety?.safety_risks || [];
    if (riskChartRef.current) {
      Plotly.newPlot(riskChartRef.current, [{
        x: risks.map(r => getRiskValue(r.likelihood)),
        y: risks.map(r => getRiskValue(r.impact)),
        text: risks.map(r => r.risk),
        mode: 'markers+text',
        type: 'scatter',
        textposition: 'top center',
        marker: {
          size: 24,
          color: risks.map(r => getRiskValue(r.impact) * getRiskValue(r.likelihood)),
          colorscale: [[0, '#22c55e'], [0.5, '#eab308'], [1, '#ef4444']],
          line: { color: isDarkMode ? '#0f172a' : '#ffffff', width: 2 }
        }
      }], {
        title: { text: 'Critical Risk Assessment', font: { color: textColor, size: 16, weight: 'bold' } },
        xaxis: { 
          title: 'Likelihood (1-3)', 
          range: [0.5, 3.5], 
          tickvals: [1, 2, 3], 
          gridcolor: gridColor, 
          color: textColor 
        },
        yaxis: { 
          title: 'Impact (1-3)', 
          range: [0.5, 3.5], 
          tickvals: [1, 2, 3], 
          gridcolor: gridColor, 
          color: textColor 
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        height: 300,
        margin: { l: 60, r: 20, t: 40, b: 60 }
      }, { responsive: true, displayModeBar: false });
    }

    // 4. Material Comparison (Bar Chart)
    const sortedMaterials = [...(result.material_suggestions || [])].sort((a, b) => 
        parseNumericValue(b.properties.tensile_strength) - parseNumericValue(a.properties.tensile_strength)
    ).slice(0, 5);

    if (materialBarChartRef.current) {
      Plotly.newPlot(materialBarChartRef.current, [{
          x: sortedMaterials.map(m => m.name),
          y: sortedMaterials.map(m => parseNumericValue(m.properties.tensile_strength)),
          type: 'bar',
          marker: {
              color: '#06b6d4'
          }
      }], {
          title: { text: 'Strength Comparison (MPa)', font: { color: textColor, size: 16, weight: 'bold' } },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: textColor },
          xaxis: { gridcolor: 'transparent', color: textColor },
          yaxis: { gridcolor: gridColor, color: textColor },
          height: 300,
          margin: { l: 60, r: 20, t: 40, b: 60 }
      }, { responsive: true, displayModeBar: false });
    }

  }, [result, dashboardTab]);

  return (
    <div className="space-y-6 mb-10">
      {/* Dashboard Section Focus Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-slate-800/80 rounded-xl text-xs font-bold">
          <button
            onClick={() => setDashboardTab('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              dashboardTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-brand-cyan shadow-sm font-black'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Comprehensive View
          </button>
          <button
            onClick={() => setDashboardTab('timeline')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              dashboardTab === 'timeline'
                ? 'bg-white dark:bg-slate-900 text-brand-cyan shadow-sm font-black'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Project Timeline & Milestones
          </button>
          <button
            onClick={() => setDashboardTab('matrices')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              dashboardTab === 'matrices'
                ? 'bg-white dark:bg-slate-900 text-brand-cyan shadow-sm font-black'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics Matrices
          </button>
        </div>

        <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span>Active Technical Head: <strong className="text-gray-800 dark:text-white">{project?.name || result.product_name}</strong></span>
        </div>
      </div>

      {/* Executive Visual Summary */}
      {(dashboardTab === 'all' || dashboardTab === 'matrices') && (
        <div className="bg-gradient-to-r from-brand-cyan/20 to-indigo-500/10 border border-brand-cyan/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm transition-all animate-fade-in">
          <div className="w-20 h-20 bg-brand-cyan/20 rounded-3xl flex items-center justify-center text-brand-cyan border border-brand-cyan/30 shadow-lg shadow-cyan-900/10 flex-shrink-0">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
          </div>
          <div className="flex-1 space-y-4">
              <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">Technical Archetype: {result.product_name}</h3>
                  <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg text-[10px] font-black text-brand-cyan uppercase tracking-widest">Physics-Agnostic</span>
                      <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-[10px] font-black text-indigo-400 uppercase tracking-widest">{(result.preliminaryCostEstimate?.confidence || 'Medium')} Confidence</span>
                      <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] font-black text-amber-500 uppercase tracking-widest">{(result.material_suggestions?.[0]?.name || 'N/A')} Primary</span>
                  </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 italic">
                  "{result.executive_summary}"
              </p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                  <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Components</span>
                  <span className="text-xl font-black text-brand-cyan">{(result.billOfMaterials || []).length}</span>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                  <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Risk Vectors</span>
                  <span className="text-xl font-black text-red-500">{(result.complianceAndSafety?.safety_risks || []).length}</span>
              </div>
          </div>
        </div>
      )}

      {/* Visual Project Timeline Dashboard */}
      {(dashboardTab === 'all' || dashboardTab === 'timeline') && (
        <ProjectTimelineDashboard
          result={result}
          project={project}
          activeVersion={activeVersion}
          computeEvents={computeEvents}
          onRevertVersion={onRevertVersion}
          onAddComputeEvent={onAddComputeEvent}
          cadData={cadData}
          simulationResult={simulationResult}
        />
      )}

      {/* Main Charts Grid */}
      {(dashboardTab === 'all' || dashboardTab === 'matrices') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm transition-colors duration-300">
            <div ref={materialChartRef} />
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm transition-colors duration-300">
            <div ref={materialBarChartRef} />
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm transition-colors duration-300">
            <div ref={costChartRef} />
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm transition-colors duration-300">
            <div ref={riskChartRef} />
          </div>
        </div>
      )}
    </div>
  );
};
