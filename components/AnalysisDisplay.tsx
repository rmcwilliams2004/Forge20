
import React from 'react';
import { AnalysisResult, Faction, GeneratedDrawing, Project, User, CadData, ProjectVersion, GeneratedImage, RotorModel, GoogleDocContent, FoundryCadResult, SimulationResult, ProjectTask, ComputeEvent } from '../types';
import { InitialView } from './analysis/InitialView';
import { LoadingView } from './analysis/LoadingView';
import { ErrorView } from './analysis/ErrorView';
import { ResultView } from './analysis/ResultView';
import { useTts } from '../hooks/useTts';
import { useSimulation } from '../hooks/useSimulation';
import { useFabricationPlanner } from '../hooks/useFabricationPlanner';
import { useGCodeVisualizer } from '../hooks/useGCodeVisualizer';
import { useSuggestionExplorer } from '../hooks/useSuggestionExplorer';
import { useBomSourcing } from '../hooks/useBomSourcing';
import { useLiveCosting } from '../hooks/useLiveCosting';
import { useNextStepAssistant } from '../hooks/useNextStepAssistant';
import { usePatentGenerator } from '../hooks/usePatentGenerator';

interface AnalysisDisplayProps {
  projectName: string;
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  selectedFaction: Faction | null;
  onClear: () => void;
  onGenerateVideo: (prompt: string, imageFile?: File, aspectRatio?: '16:9' | '9:16') => void;
  isVideoLoading: boolean;
  videoUrl: string | null;
  videoError: string | null;
  drawings: GeneratedDrawing[];
  onRequestDrawing: (prompt: string, result: AnalysisResult, fileUrls?: string[]) => void;
  onRequestDrawingFromImage: (imageFile: File, prompt: string) => void;
  onRemoveDrawing: (id: string) => void;
  onToggleDrawingReportInclusion: (id: string) => void;
  onSetCover: (id: string, type: 'drawing' | 'image') => void;
  inspirationalImages: GeneratedImage[];
  onRemoveInspirationalImage: (id: string) => void;
  onRequestInspirationalImage: (prompt: string, aspectRatio: string) => void;
  onToggleImageReportInclusion: (id: string) => void;
  onIncorporateSuggestions: (suggestionTexts: string[]) => void;
  onLaunchDeVinci: () => void;
  activeProject: Project | null;
  activeVersion: ProjectVersion | null;
  authenticatedUser: User;
  onGenerateSummary: (result: AnalysisResult) => Promise<string | null>;
  isSummaryLoading: boolean;
  summaryError: string | null;
  cadData: CadData | null;
  foundryResult: FoundryCadResult | null;
  onGenerateCad: (drawings: GeneratedDrawing[], result: AnalysisResult) => Promise<CadData | null>;
  isCadLoading: boolean;
  cadError: string | null;
  /**
   * FIX: Added isCadViewerOpen and onOpenCadViewer to props.
   */
  isCadViewerOpen: boolean;
  onOpenCadViewer: () => void;
  onAddLocalSnapshot?: (dataUrl: string, prompt: string) => void;
  isGoogleExporterAuthenticated: boolean;
  googleExporterUser: { name: string; email: string } | null;
  isGoogleAuthLoading: boolean;
  onGoogleExporterSignIn: () => void;
  onGoogleExporterSignOut: () => void;
  isGoogleExporting: boolean;
  googleExportStatus: string;
  googleExportError: string | null;
  googleDocContent: GoogleDocContent | null;
  onOpenGoogleDocPreview: () => void;
  onExportToGoogle: () => void;
  rotorModel?: RotorModel;
  onRotorModelChange: (model: RotorModel) => void;
  rossAnalysis: {
    isRossReady: boolean;
    isRossRunning: boolean;
    rossStatus: string;
    rossResult: any;
    rossError: string | null;
    runAnalysis: (rotorModel: RotorModel, analysisType: 'critical_speed' | 'campbell') => void;
  };
  tts: ReturnType<typeof useTts>;
  inspirationalImageHistory: GeneratedImage[];
  onReinsertInspirationalImage: (image: GeneratedImage) => void;
  onDeleteInspirationalImageFromHistory: (imageId: string) => void;
  simulation: ReturnType<typeof useSimulation>;
  fabricationPlanner: ReturnType<typeof useFabricationPlanner>;
  gcodeVisualizer: ReturnType<typeof useGCodeVisualizer>;
  suggestionExplorer: ReturnType<typeof useSuggestionExplorer>;
  bomSourcing: ReturnType<typeof useBomSourcing>;
  liveCosting: ReturnType<typeof useLiveCosting>;
  nextStepAssistant: ReturnType<typeof useNextStepAssistant>;
  patentGenerator: ReturnType<typeof usePatentGenerator>;
  onSaveSimulation?: (result: SimulationResult) => void;
  // FIX: Added onUpdateTasks prop to resolve type error in App.tsx.
  onUpdateTasks: (tasks: ProjectTask[]) => void;
  computeEvents?: ComputeEvent[];
  onRevertVersion?: (index: number) => void;
  onAddComputeEvent?: (event: ComputeEvent) => void;
}

export const AnalysisDisplay = (props: AnalysisDisplayProps) => {
  if (props.isLoading) {
    return <LoadingView />;
  }

  if (props.error) {
    return <ErrorView error={props.error} onClear={props.onClear} />;
  }

  if (props.result) {
    return (
      <ResultView
        projectName={props.projectName}
        result={props.result}
        selectedFaction={props.selectedFaction}
        onClear={props.onClear}
        isLoading={props.isLoading}
        onGenerateVideo={props.onGenerateVideo}
        isVideoLoading={props.isVideoLoading}
        videoUrl={props.videoUrl}
        videoError={props.videoError}
        drawings={props.drawings}
        onRequestDrawing={props.onRequestDrawing}
        onRequestDrawingFromImage={props.onRequestDrawingFromImage}
        onRemoveDrawing={props.onRemoveDrawing}
        onToggleDrawingReportInclusion={props.onToggleDrawingReportInclusion}
        onSetCover={props.onSetCover}
        inspirationalImages={props.inspirationalImages}
        onRemoveInspirationalImage={props.onRemoveInspirationalImage}
        onRequestInspirationalImage={props.onRequestInspirationalImage}
        onToggleImageReportInclusion={props.onToggleImageReportInclusion}
        onIncorporateSuggestions={props.onIncorporateSuggestions}
        onLaunchDeVinci={props.onLaunchDeVinci}
        activeProject={props.activeProject}
        activeVersion={props.activeVersion}
        authenticatedUser={props.authenticatedUser}
        onGenerateSummary={props.onGenerateSummary}
        isSummaryLoading={props.isSummaryLoading}
        summaryError={props.summaryError}
        cadData={props.cadData}
        foundryResult={props.foundryResult}
        onGenerateCad={props.onGenerateCad}
        isCadLoading={props.isCadLoading}
        cadError={props.cadError}
        /**
         * FIX: Passing isCadViewerOpen to ResultView.
         */
        isCadViewerOpen={props.isCadViewerOpen}
        onOpenCadViewer={props.onOpenCadViewer}
        onAddLocalSnapshot={props.onAddLocalSnapshot}
        isGoogleExporterAuthenticated={props.isGoogleExporterAuthenticated}
        googleExporterUser={props.googleExporterUser}
        isGoogleAuthLoading={props.isGoogleAuthLoading}
        onGoogleExporterSignIn={props.onGoogleExporterSignIn}
        onGoogleExporterSignOut={props.onGoogleExporterSignOut}
        isGoogleExporting={props.isGoogleExporting}
        googleExportStatus={props.googleExportStatus}
        googleExportError={props.googleExportError}
        googleDocContent={props.googleDocContent}
        onOpenGoogleDocPreview={props.onOpenGoogleDocPreview}
        onExportToGoogle={props.onExportToGoogle}
        rotorModel={props.rotorModel}
        onRotorModelChange={props.onRotorModelChange}
        rossAnalysis={props.rossAnalysis}
        tts={props.tts}
        inspirationalImageHistory={props.inspirationalImageHistory}
        onReinsertInspirationalImage={props.onReinsertInspirationalImage}
        onDeleteInspirationalImageFromHistory={props.onDeleteInspirationalImageFromHistory}
        simulation={props.simulation}
        fabricationPlanner={props.fabricationPlanner}
        gcodeVisualizer={props.gcodeVisualizer}
        suggestionExplorer={props.suggestionExplorer}
        bomSourcing={props.bomSourcing}
        liveCosting={props.liveCosting}
        nextStepAssistant={props.nextStepAssistant}
        patentGenerator={props.patentGenerator}
        onSaveSimulation={props.onSaveSimulation}
        // FIX: Passing onUpdateTasks through to ResultView.
        onUpdateTasks={props.onUpdateTasks}
        computeEvents={props.computeEvents}
        onRevertVersion={props.onRevertVersion}
        onAddComputeEvent={props.onAddComputeEvent}
      />
    );
  }

  return <InitialView onStartDialogue={props.onLaunchDeVinci} />;
};
