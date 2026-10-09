import React from 'react';

export enum FactionId {
  ADVANCED_MATERIALS = 'advanced_materials',
  PRAGMATIC_PRODUCTION = 'pragmatic_production',
  SYSTEMS_AUTOMATION = 'systems_automation',
}

export enum PersonaId {
  DA_VINCI = 'da_vinci',
  TESLA = 'tesla',
  HAMILTON = 'hamilton',
  LAMARR = 'lamarr',
  BRUNEL = 'brunel',
  MUSK = 'musk',
  EDISON = 'edison',
  SHEN_KUO = 'shen_kuo',
  CARVER = 'carver',
  HOPPER = 'hopper',
  ALTSHULLER = 'altshuller',
  AL_JAZARI = 'al_jazari',
  LOVELACE = 'lovelace',
  FULLER = 'fuller',
  RUTAN = 'rutan',
  DYSON = 'dyson',
  EINSTEIN = 'einstein',
  HAWKING = 'hawking',
  NASH = 'once',
  ARISTOTLE = 'aristotle',
  OPPENHEIMER = 'oppenheimer',
  JOHNSON = 'johnson',
  RAMANUJAN = 'ramanujan',
  HADID = 'hadid',
  MORGAN = 'morgan',
  ROSS = 'ross',
  IBN_AL_HAYTHAM = 'haytham',
  WU = 'wu',
  SAGAN = 'sagan',
  HUBBLE = 'hubble',
  BOHR = 'bohr',
  RUTHERFORD = 'rutherford',
  CURIE = 'curie',
  FERMI = 'fermi',
  RUBIN = 'rubin',
  FEYNMAN = 'feynman',
  FARADAY = 'faraday',
  HUYGENS = 'huygens',
  MEITNER = 'meitner',
  DIRAC = 'dirac',
  PAULI = 'pauli',
  MAXWELL = 'maxwell',
  DARWIN = 'darwin',
  FRANKLIN = 'franklin',
  PASTEUR = 'pasteur',
  TURING = 'turing',
  SHANNON = 'shannon',
  SPOCK = 'spock',
  LA_FORGE = 'la_forge',
  DATA = 'data'
}

export enum DomainCategory {
  APPLIED_PHYSICS = 'Applied Physics',
  LOGIC_SYSTEMS = 'Logic Systems',
  GENERAL_INNOVATION = 'General Innovation'
}

export enum EngineeringBranch {
  CHEMICAL = 'Chemical',
  CIVIL = 'Civil',
  ELECTRICAL = 'Electrical',
  MECHANICAL = 'Mechanical',
  AEROSPACE = 'Aerospace',
  NUCLEAR = 'Nuclear',
  BIO_MEDICAL = 'Biomedical',
  GENERAL = 'General Engineering'
}

/**
 * Fix: Added Admin, Manager, Editor, and Viewer roles to resolve property access 
 * and comparison errors across multiple files.
 */
export enum Role {
  Operator = 'Operator',
  Institution = 'Institution',
  Inventor = 'Inventor',
  Apprentice = 'Apprentice',
  Admin = 'Admin',
  Manager = 'Manager',
  Editor = 'Editor',
  Viewer = 'Viewer',
}

export enum SystemState {
  IDLE = 'IDLE',
  CALIBRATING = 'CALIBRATING',
  STABLE = 'STABLE',
  LOCKED = 'LOCKED',
  ERROR = 'ERROR',
  DEEP_SOLVE = 'DEEP_SOLVE'
}

export enum NalPrecision {
  DRAFT = 0.1,
  ANALYSIS = 0.01,
  FOUNDRY = 0.001
}

export type IoStatus = 'IDLE' | 'READING' | 'WRITING' | 'VERIFYING' | 'JAMMED';
export type ExportStatus = 'IDLE' | 'PACKAGING' | 'HASHING' | 'READY' | 'FAILED';

export enum SubscriptionStatus {
  FREE = 'FREE',
  PRO_TRIAL = 'PRO_TRIAL',
  PRO_ACTIVE = 'PRO_ACTIVE',
  ENTERPRISE = 'ENTERPRISE',
  EXPIRED = 'EXPIRED'
}

export type ProtectionTypePref = 'PATENT' | 'COPYRIGHT' | 'TRADEMARK' | 'AI_RECOMMENDED';
export type LegalJurisdiction = 'USPTO' | 'EPO' | 'WIPO' | 'JPO' | 'CNIPA';

export interface Persona {
  id: PersonaId;
  name: string;
  title: string;
  bio: string;
  bias: string;
  avatar: string;
  systemInstruction: string;
}

export interface Innovator {
  id: string;
  name: string;
  expertise: string;
  specialties: string[];
  personaType: 'Visionary' | 'Architect' | 'Strategist' | 'Specialist';
  avatar: string;
}

export interface Faction {
  id: FactionId;
  name: string;
  focus: string;
  philosophy: string;
  bias: {
    materials: string;
    manufacturing: string;
    innovativeProposal: string;
  };
  icon: React.FC<{ className?: string }>;
}

export interface EditorState {
  prompt: string;
  selectedFaction: Faction | null;
  selectedPersona: Persona | null;
  selectionMode: 'philosophy' | 'persona';
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: Role;
  analysesRun: number;
  lastActive: string;
  company_name?: string;
  legal_identity?: string;
  use_company_attribution?: boolean;
  default_protection_pref?: ProtectionTypePref;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: string;
  certificatesGenerated?: number;
  branch?: EngineeringBranch;
  hasAcceptedLegal?: boolean;
  lastAcceptedLegal?: string;
  hasSignedPartnerProtocol?: boolean;
  is_first_login?: boolean;
  isSilenced?: boolean;
  customMaterials?: MaterialPreset[];
  forgeCredits?: number;
}

export interface ComputeEvent {
  id: string;
  timestamp: string;
  type: 'FOUNDRY_SYNTHESIS' | 'GENESIS_AUDIT' | 'MASTERMIND_SESSION' | 'FEA_SIMULATION' | 'CAD_SYNTHESIS' | 'THERMAL_CFD' | 'PHYSICAL_BENCHMARK' | string;
  user: string;
  cost: number;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  projectId?: string;
  projectName?: string;
  versionId?: string;
  details?: string;
  durationMs?: number;
  tokensUsed?: number;
  engine?: string;
}

export interface IpAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'TDP_EXPORT' | 'PATENT_DRAFT_GEN' | 'CERTIFICATE_GEN';
  projectName: string;
  fileHash: string;
  jurisdiction: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  subtasks: ProjectTask[];
  createdAt: string;
}

export interface SystemComponentMap {
  name: string;
  material_inference: string;
  confidence: number;
  dimensions: { x: number; y: number; z: number };
  children: SystemComponentMap[];
}

export interface SystemMap {
  product_name: string;
  hierarchy: SystemComponentMap[];
}

export interface InnovationCertificate {
    id: string;
    projectId: string;
    versionId: string;
    timestamp: string;
    hash: string;
    legalOwner: string;
    innovationType: 'SOFTWARE' | 'HARDWARE' | 'MATERIAL' | 'PROCESS' | 'PATENT' | 'COPYRIGHT' | 'TRADEMARK';
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userPicture: string;
    text: string;
    createdAt: string;
    sectionId: string;
}

export interface FactionRationale {
  pros: string[];
  cons: string[];
  summary: string;
}

export interface MaterialProperties {
    density: string;
    tensile_strength: string;
    melting_point: string;
    conductivity: string;
}

export interface MaterialSuggestion {
  name: string;
  rationale: string;
  properties: MaterialProperties;
}

export interface ProcessFmeaEntry {
  failure_mode: string;
  potential_effects: string;
  severity: number;
  potential_causes: string;
  occurrence: number;
  current_controls: string;
  detection: number;
  rpn: number;
  recommended_action: string;
}

export interface ManufacturingProcess {
  name: string;
  description: string;
  fmea: ProcessFmeaEntry[];
}

export interface ComparativeAnalysis {
    alternative: string;
    advantages: string;
    disadvantages: string;
}

export interface SystemSuggestion {
  name: string;
  description: string;
  rationale: string;
}

export interface RequirementSpecification {
    introduction: string;
    functional_requirements: string[];
    non_functional_requirements: string[];
    performance_criteria: string[];
    constraints: string[];
}

export interface DesignDocument {
    system_architecture: string;
    component_designs: {
        component_name: string;
        design_details: string;
    }[];
    design_rationale: string;
}

export interface TestPlan {
    overview: string;
    test_cases: {
        id: string;
        description: string;
        procedure: string;
        expected_results: string;
    }[];
}

export interface SoftwareDocumentation {
    architecture_overview: string;
    api_documentation: {
        endpoint: string;
        description: string;
        request: string;
        response: string;
    }[];
}

export interface SimulationAndAnalysisReport {
    simulation_type: string;
    methodology: string;
    results_summary: string;
    key_findings: string[];
}

export interface ComplianceAndSafety {
    overview: string;
    applicable_standards: string[];
    safety_risks: {
        risk: string;
        likelihood: 'Low' | 'Medium' | 'High';
        impact: 'Low' | 'Medium' | 'High';
        mitigation: string;
    }[];
}

export interface BillOfMaterialsItem {
    part_number: number;
    name: string;
    quantity: number;
    material: string;
    description: string;
}
export type BillOfMaterials = BillOfMaterialsItem[];

export interface ProcurementInfo {
    supplier: string;
    url: string;
    estimatedCost: string;
    leadTime: string;
    verified?: boolean;
    confidence?: number;
}

export interface DrawingSpecification {
    standard: string;
    required_views: string[];
    key_dimensions_tolerances: string[];
    general_notes: string;
}

export interface CostComponent {
    item: string;
    cost_estimate: string;
    rationale: string;
}

export interface PreliminaryCostEstimate {
    total_estimate_range: string;
    confidence: 'Low' | 'Medium' | 'High';
    assumptions: string[];
    breakdown: CostComponent[];
}

export interface EngineeringChangeOrder {
    eco_id: string;
    change_title: string;
    description: string;
    reason_for_change: string;
    impact_analysis: string;
}

export interface IndependentClaim {
  text: string;
  rationale: string;
}

export interface NoveltyPoint {
  text: string;
  rationale: string;
}

export interface PatentApplication {
  title: string;
  abstract: string;
  background: string;
  summary: string;
  independent_claims: IndependentClaim[];
  dependent_claims: string[];
  novelty_points: NoveltyPoint[];
  inventive_step_rationale: string;
  owner_of_record?: string;
  protection_type?: ProtectionTypePref;
  legal_hash?: string;
  jurisdiction?: LegalJurisdiction;
}

export interface SafetyAuditFinding {
    protocol: string;
    status: 'Pass' | 'Warn' | 'Fail';
    message: string;
}

export interface AnalysisResult {
  product_name: string;
  executive_summary: string;
  branch?: EngineeringBranch;
  faction_rationale: FactionRationale;
  material_suggestions: MaterialSuggestion[];
  manufacturing_analysis: ManufacturingProcess[];
  comparative_analysis: ComparativeAnalysis[];
  suggested_systems: SystemSuggestion[];
  requirementSpecification: RequirementSpecification;
  designDocument: DesignDocument;
  drawingSpecification: DrawingSpecification;
  testPlan: TestPlan;
  softwareDocumentation?: SoftwareDocumentation;
  simulationAndAnalysisReport: SimulationAndAnalysisReport;
  assemblyInstructions: AssemblyInstructions;
  billOfMaterials: BillOfMaterials;
  preliminaryCostEstimate: PreliminaryCostEstimate;
  complianceAndSafety: ComplianceAndSafety;
  engineeringChangeOrders: EngineeringChangeOrder[];
  patentApplication?: PatentApplication;
  safety_audit?: SafetyAuditFinding[];
  suggested_tasks?: ProjectTask[];
  system_map?: SystemMap;
}

export type SimulationType = 
  | 'FEA' 
  | 'CFD' 
  | 'THERMAL' 
  | 'PHYSICS_VALIDATION' 
  | 'MODAL'
  | 'FATIGUE'
  | 'IMPACT'
  | 'EM_FIELD'
  | 'OPTIMIZATION'
  ;

export interface FailureTelemetry {
  type: string;
  coordinates: { x: number; y: number; z: number };
  magnitude?: number;
  delta_t?: string;
  description: string;
}

export interface PhysicsTelemetry {
  max_stress: number;
  stability_index: number;
  max_stress_gpa: number;
  thermal_state?: { hotspot_max: number };
}

export interface PeakStressNode {
  x: number;
  y: number;
  z: number;
  magnitude: number;
}

export interface VisualLayers {
  peak_stress_nodes: PeakStressNode[];
  displacement_4d: any[];
}

export interface PhysicsValidationResult {
  simulation_id: string;
  status: 'STABLE' | 'MESH_RUPTURE' | 'THERMAL_OVERLOAD' | 'CRITICAL_SYSTEM_FAILURE';
  timestamp: string;
  failure_telemetry: FailureTelemetry[] | null;
  engine_handshake: string;
  solver_path: string;
  video_url?: string;
  telemetry?: PhysicsTelemetry;
  visual_layers?: VisualLayers;
}

export interface SimulationResult {
    id?: string;
    timestamp?: string;
    type: SimulationType;
    componentName: string;
    summary: string;
    keyFindings: string[];
    imageUrl: string | null;
    imagePrompt: string;
    isLoading: boolean;
    error: string | null;
    physicsTelemetry?: PhysicsValidationResult | null;
}

export interface GeneratedDrawing {
  id: string;
  prompt: string;
  url: string | null;
  isLoading: boolean;
  error: string | null;
  includeInReport: boolean;
  isCoverImage?: boolean;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  url: string | null;
  isLoading: boolean;
  error: string | null;
  aspectRatio?: string;
  includeInReport: boolean;
  isCoverImage?: boolean;
}

export interface AssemblyInstructionStep {
    step: number;
    action: string;
    parts_needed: string[];
}
export interface AssemblyInstructions {
    overview: string;
    steps: AssemblyInstructionStep[];
}

export interface RotorMaterial {
    name: string;
    E: number;
    G_s: number;
    rho: number;
}

export interface RotorShaftElement {
    L: number;
    idl: number;
    odl: number;
    material: RotorMaterial;
    n: number;
}

export interface RotorDiskElement {
    n: number;
    m: number;
    Id: number;
    Ip: number;
}

export interface RotorBearingElement {
    n: number;
    kxx?: number;
    kxy?: number;
    kyx?: number;
    kyy?: number;
    cxx?: number;
    cxy?: number;
    cyx?: number;
    cyy?: number;
}

export interface RotorModel {
    shaft: RotorShaftElement[];
    disks: RotorDiskElement[];
    bearings: RotorBearingElement[];
}

export interface PhdMetadata {
  governing_physics: string[];
  critical_constants: Record<string, string>;
  industry_standards: string[];
  peer_review_context?: string;
}

export interface IngestedDocument {
  id: string;
  name: string;
  type: string;
  branch: EngineeringBranch;
  phd_metadata: PhdMetadata;
  content: string;
  summary: string;
  timestamp: string;
  embedding?: number[];
  isLoading?: boolean;
}

export interface ProjectVersion {
  versionId: string;
  createdAt: string;
  commitMessage: string;
  prompt: string;
  factionId: FactionId;
  result: AnalysisResult | null;
  fileUrls: string[];
  drawings?: GeneratedDrawing[];
  inspirationalImages?: GeneratedImage[];
  incorporatedSuggestions?: string[];
  rotorModel?: RotorModel;
  simulations?: SimulationResult[];
}

export interface ProjectIndexEntry {
  id: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  searchKeywords?: string;
  domainCategory?: DomainCategory;
}

export interface Project extends ProjectIndexEntry {
  history: ProjectVersion[];
  inspirationalImageHistory?: GeneratedImage[];
  knowledgeBase?: IngestedDocument[];
  tasks: ProjectTask[];
}

export type DeVinciState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking' | 'error' | 'paused' | 'reconnecting' | 'reconnect_failed';

export interface TranscriptEntry {
    source: 'user' | 'devinci';
    text: string;
    isFinal: boolean;
    speakerName?: string;
}

export type DeVinciVoice = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';
export type VoiceCommanderState = 'idle' | 'listening' | 'thinking' | 'error';
export type AiChatState = 'idle' | 'thinking' | 'error';
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export type VoiceInterfaceMode = 'MANUAL' | 'ALWAYS_ON';

export interface VoiceTranscriptEntry {
  id: string;
  text: string;
  intent?: string;
  timestamp: string;
  status: 'PENDING' | 'EXECUTED' | 'REJECTED';
}

export interface LogEntry {
    id: number;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    user?: string;
    context?: string;
}

export interface CadComponent {
    name: string;
    shape: 'cube' | 'cylinder' | 'sphere' | 'complex';
    dimensions: { x: number; y: number; z: number; };
    position: { x: number; y: number; z: number; };
    children?: CadComponent[];
}

export interface CadData {
    assemblyName: string;
    units: 'mm' | 'inches';
    components: CadComponent[];
}

export type CadViewerTool = 'select' | 'measure' | 'section';

export interface CadAnnotation {
  id: string;
  x: number; y: number;
  text: string;
}

export interface CadMeasurement {
  id: string;
  type: string;
  distance: number;
  units: string;
}

export interface CadModification {
    name: string;
    changes: string[];
}
export interface CadComparisonResult {
    additions: string[];
    deletions: string[];
    modifications: CadModification[];
}

export type GoogleDocContentItem = {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'bulletList' | 'table' | 'image';
  text?: string;
  items?: string[];
  headers?: string[];
  rows?: (string|number)[][];
  url?: string;
  caption?: string;
  isMuted?: boolean;
};
export type GoogleDocContent = GoogleDocContentItem[];

export interface SetupSuggestions {
  recommendedFactionId: FactionId;
  suggested_tags: string[];
}

export type ManufacturingProcessType = 
  | 'CNC Machining' 
  | '3D Printing' 
  | 'Sheet Metal' 
  | 'Injection Molding' 
  | 'Die Casting' 
  | 'Forging' 
  | 'Laser Cutting' 
  | 'Waterjet Cutting' 
  | 'Extrusion' 
  | 'Robotic Assembly' 
  | 'Manual Assembly' 
  | 'Composite Layup'
  ;

export interface GCodeSummary {
    summary: string;
    keyOperations: string[];
}

export interface DfmCheck {
    component: string;
    issue: string;
    recommendation: string;
}

export interface FabricationPlan {
    dfmChecks: DfmCheck[];
    tolerancingNotes: string[];
    processSpecificOutput: {
        title: string;
        data: string;
    };
}

export interface ImageIdentificationResult {
  summary: string;
  sources: any[];
  imageUrl: string;
}

export interface ExplorationResult {
  suggestionText: string;
  explanation: string;
  imageUrl: string;
}

export interface PromptValidationResult {
  isClear: boolean;
  suggestion: string | null;
}

export interface NextStepSuggestion {
  title: string;
  rationale: string;
  actionId: string;
  icon: 'beaker' | 'cube' | 'bolt' | 'ruler' | 'chart' | 'dollar' | 'conversation' | 'play';
}

export interface InProgressState {
  projectName: string;
  prompt: string;
  tags: string[];
  factionId: FactionId;
  result: AnalysisResult;
  drawings: GeneratedDrawing[];
  inspirationalImages: GeneratedImage[];
  domainCategory?: DomainCategory;
}

export interface Material {
    id: string;
    name: string;
    category: string;
    properties: Record<string, string>;
    materialData?: MaterialPreset;
    isUserGenerated?: boolean;
}

export interface StandardComponent {
    id: string;
    name: string;
    category: string;
    partNumber: string;
    specifications: Record<string, string>;
}

export interface Standard {
    id: string;
    name: string;
    organization: string;
    publicationYear: number;
    description: string;
    status: 'Active' | 'Withdrawn';
}

export interface ProjectArtifact {
    id: string;
    name: string;
    type: string;
    version: string;
    modifiedBy: string;
    modifiedAt: string;
}

export interface FmeaItem {
    id: number;
    processStep: string;
    failureMode: string;
    failureEffects: string;
    severity: number;
    potentialCauses: string;
    occurrence: number;
    currentControls: string;
    detection: number;
    rpn: number;
    recommendedAction: string;
    actionStatus: 'Pending' | 'In Progress' | 'Complete';
}

export interface SpcDataPoint {
    sample: number;
    value: number;
}

export enum RequirementStatus {
    Draft = 'Draft',
    Approved = 'Approved',
    Tested = 'Tested',
    Obsolete = 'Obsolete'
}

export interface Requirement {
    id: string;
    text: string;
    status: RequirementStatus;
    linkedTo: string[];
}

export interface RcaData {
    problem: string;
    fiveWhys: string[];
    fishbone: {
        Manpower: string[];
        Methods: string[];
        Machines: string[];
        Materials: string[];
        Measurements: string[];
        Environment: string[];
    };
}

export interface SimulationRun {
    id: string;
    name: string;
    description: string;
    plotData: any;
}

export interface Script {
    id: string;
    name: string;
    description: string;
    code: string;
}

export interface ChartData {
    id: string;
    name: string;
    type: 'bode' | 'gantt' | 'stress-strain';
    data: any;
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: 'STRUCTURAL' | 'LEGAL' | 'LOGIC' | 'SYSTEM' | 'FOUNDRY_SYNTHESIS' | 'GENESIS_AUDIT' | 'MASTERMIND_SESSION' | 'FEA_SIMULATION' | string;
    projectName?: string;
    cost?: number;
    user?: string;
    status?: 'SUCCESS' | 'VERIFIED' | 'OPTIMIZED' | 'WARNING';
}

export interface MaterialPreset {
  id: string;
  name: string;
  category: 'Metals' | 'Polymers' | 'Ceramics' | 'Composites' | 'Exotic';
  density: number;
  youngsModulus: number;
  tensileStrength: number;
  thermalConductivity: number;
  thermalExpansion: number;
  yieldStrength: number;
  costPerKg: number;
}

export interface FoundryOptimization {
  parameter: string;
  recommendedValue: number;
  rationale: string;
}

export interface ReinforcementProfile {
  id: string;
  name: string;
  description: string;
  parameterOverrides: Record<string, number>;
}

export interface FoundryCadResult {
  plugin: string;
  action: string;
  metadata: {
    project_id: string;
    material: string;
    geometric_hash_required: boolean;
  };
  scad_params: {
    base_dimensions: [number, number, number];
    parameters: Record<string, number>;
    raw_scad: string;
  };
  suggested_fix?: string;
  optimizations?: FoundryOptimization[];
  availableReinforcements?: ReinforcementProfile[];
}

export interface FoundryState {
  selectedMaterial: MaterialPreset;
  parameters: Record<string, number>;
  scadString: string;
  safetyFactor: number;
  isLocked: boolean;
  jurisdiction: LegalJurisdiction;
  designHash?: string;
  cadResult?: FoundryCadResult;
  activeReinforcementId?: string;
}

// ==========================================
// PYTORCH & TENSORFLOW / TENSORBOARD TYPES
// ==========================================

export type PyTorchLayerType = 
  | 'Linear' 
  | 'Conv2d' 
  | 'MaxPool2d' 
  | 'BatchNorm2d' 
  | 'Dropout' 
  | 'MultiheadAttention' 
  | 'TransformerEncoderLayer' 
  | 'LSTM' 
  | 'GRU' 
  | 'ReLU' 
  | 'GELU' 
  | 'SiLU' 
  | 'LayerNorm' 
  | 'Flatten';

export interface PyTorchLayer {
  id: string;
  type: PyTorchLayerType;
  params: Record<string, any>;
  inputShape?: string;
  outputShape?: string;
  paramCount?: number;
  description?: string;
}

export interface PyTorchModelConfig {
  name: string;
  category: 'Vision' | 'NLP_Transformer' | 'Surrogate_Physics' | 'PINNs_Stress' | 'Generative';
  layers: PyTorchLayer[];
  optimizer: 'AdamW' | 'Adam' | 'SGD' | 'RMSprop';
  learningRate: number;
  weightDecay: number;
  lossFunction: 'CrossEntropyLoss' | 'MSELoss' | 'BCEWithLogitsLoss' | 'L1Loss' | 'HuberLoss';
  scheduler: 'CosineAnnealingLR' | 'StepLR' | 'ReduceLROnPlateau' | 'OneCycleLR' | 'None';
  device: 'cuda:0' | 'cpu' | 'mps';
  precision: 'float32' | 'float16' | 'bfloat16';
  batchSize: number;
  epochs: number;
  exportTorchScript: boolean;
  exportOnnx: boolean;
}

export type TensorFlowLayerType = 
  | 'Dense' 
  | 'Conv2D' 
  | 'MaxPooling2D' 
  | 'BatchNormalization' 
  | 'Dropout' 
  | 'MultiHeadAttention' 
  | 'GlobalAveragePooling2D' 
  | 'Flatten' 
  | 'LSTM' 
  | 'Rescaling';

export interface TensorFlowLayer {
  id: string;
  type: TensorFlowLayerType;
  params: Record<string, any>;
  inputShape?: string;
  outputShape?: string;
  paramCount?: number;
}

export interface TensorFlowModelConfig {
  name: string;
  modelType: 'Sequential' | 'Functional';
  layers: TensorFlowLayer[];
  optimizer: 'adam' | 'adamw' | 'sgd' | 'rmsprop';
  learningRate: number;
  loss: string;
  metrics: string[];
  enableTensorBoard: boolean;
  logDir: string;
  batchSize: number;
  epochs: number;
  exportFormats: ('SavedModel' | 'TFLite' | 'TFJS')[];
}

export interface TensorBoardScalarPoint {
  step: number;
  wallTime: number;
  value: number;
}

export interface TensorBoardHistogramBin {
  step: number;
  min: number;
  max: number;
  counts: number[];
  bins: number[];
}

export interface TensorBoardGraphNode {
  id: string;
  name: string;
  op: string;
  inputs: string[];
  outputShape?: string;
  device?: string;
  subgraph?: string;
}

export interface TensorBoardRun {
  id: string;
  name: string;
  framework: 'PyTorch' | 'TensorFlow';
  color: string;
  status: 'RUNNING' | 'COMPLETED' | 'PAUSED';
  startedAt: string;
  epochs: number;
  currentStep: number;
  scalars: {
    train_loss: TensorBoardScalarPoint[];
    val_loss: TensorBoardScalarPoint[];
    train_accuracy: TensorBoardScalarPoint[];
    val_accuracy: TensorBoardScalarPoint[];
    learning_rate: TensorBoardScalarPoint[];
    grad_norm?: TensorBoardScalarPoint[];
  };
  hparams: {
    optimizer: string;
    learning_rate: number;
    batch_size: number;
    weight_decay?: number;
    dropout?: number;
    precision: string;
  };
  graph: {
    nodes: TensorBoardGraphNode[];
    edges: { from: string; to: string; label?: string }[];
  };
  histograms: Record<string, TensorBoardHistogramBin[]>;
  profiler: {
    gpuMemoryMb: number;
    peakMemoryMb: number;
    flopsG: number;
    tensorCoreUtilization: number;
    opBreakdown: { name: string; percentage: number; timeMs: number }[];
  };
}

