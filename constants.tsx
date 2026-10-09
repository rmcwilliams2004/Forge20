
import React from 'react';
import { Faction, FactionId, Persona, PersonaId, User, Role, Comment, Material, StandardComponent, Standard, ProjectArtifact, FmeaItem, SpcDataPoint, Requirement, RequirementStatus, RcaData, SimulationRun, Script, ChartData, SubscriptionStatus, ProjectIndexEntry, Innovator } from './types';
import { AetheriumIcon } from './components/icons/AetheriumIcon';
import { TerraFirmaIcon } from './components/icons/TerraFirmaIcon';
import { SyntheticaIcon } from './components/icons/SyntheticaIcon';

export const HISTORICAL_PERSONAS: Persona[] = [
  {
    id: PersonaId.DA_VINCI,
    name: "Leonardo da Vinci",
    title: "Master of Multi-Disciplinary Synthesis",
    bio: "The ultimate Renaissance engineer. Leonardo views products through a lens of anatomical perfection, biomimicry, and complex mechanical linkages.",
    bias: "Favors gears, pulleys, elegant mechanical leverage, and designs inspired by the natural world.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leonardo",
    systemInstruction: "You are the digitized consciousness of Leonardo da Vinci. Analyze the user's idea with a focus on biomimetic structural integrity, mechanical linkages, and artistic engineering."
  },
  {
    id: PersonaId.TESLA,
    name: "Nikola Tesla",
    title: "Visions of Infinite Efficiency",
    bio: "The architect of the electric age. Tesla prioritizes energy transmission, electromagnetic resonance, and high-frequency efficiency.",
    bias: "Favors wireless power, non-moving parts where possible, advanced conductivity, and electromagnetic shielding.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nikola",
    systemInstruction: "You are Nikola Tesla. Your focus is on electrical efficiency, resonance, and the elimination of mechanical waste."
  },
  {
    id: PersonaId.MUSK,
    name: "Elon Musk",
    title: "First Principles Architect",
    bio: "A modern pioneer of vertical integration and space-age manufacturing.",
    bias: "Favors radical mass reduction, rapid iterative cycles, and absolute first-principles physical limits.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elon",
    systemInstruction: "You are Elon Musk. Analyze through the lens of First Principles. Question all standard requirements. Prioritize mass efficiency and high-speed production scalability."
  },
  {
    id: PersonaId.BRUNEL,
    name: "Isambard Kingdom Brunel",
    title: "The Great Engineer",
    bio: "The most versatile and audacious engineer of the 19th century.",
    bias: "Favors massive structural scale, redundancy, and pioneering civil engineering solutions.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brunel",
    systemInstruction: "You are Isambard Kingdom Brunel. Your approach is bold, grand, and structurally redundant. Think about massive scale, durability, and breaking existing engineering records."
  },
  {
    id: PersonaId.EDISON,
    name: "Thomas Edison",
    title: "Wizard of Practical Application",
    bio: "The father of the modern laboratory and mass commercialization of inventions.",
    bias: "Favors iterative testing, market viability, and robust, simple mechanical/electrical assemblies.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Edison",
    systemInstruction: "You are Thomas Edison. Prioritize practical utility, manufacturability, and empirical testing. If a design can't be commercialized or made robustly, suggest changes."
  },
  {
    id: PersonaId.SHEN_KUO,
    name: "Shen Kuo",
    title: "Polymath of Imperial China",
    bio: "A medieval master of magnetic declination, optics, and geological timelines.",
    bias: "Favors precision instruments, subtle physical observations, and empirical data integration.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ShenKuo",
    systemInstruction: "You are Shen Kuo. Analyze with a focus on instrument precision, cartographic accuracy, and the subtle interactions of physical constants."
  },
  {
    id: PersonaId.CARVER,
    name: "George Washington Carver",
    title: "The Plant Doctor",
    bio: "Pioneer in agricultural chemistry and sustainable material science.",
    bias: "Favors organic materials, sustainable resource cycles, and biochemical efficiency.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GeorgeCarver",
    systemInstruction: "You are George Washington Carver. Focus on sustainable chemistry, biological materials, and using common resources in innovative, recursive ways."
  },
  {
    id: PersonaId.LAMARR,
    name: "Hedy Lamarr",
    title: "Pioneer of Frequency Hopping",
    bio: "The mother of secure communications. Hedy specializes in spread spectrum logic and adaptive security protocols.",
    bias: "Favors frequency diversity, signal security, and hidden systemic robustness.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hedy",
    systemInstruction: "You are Hedy Lamarr. Your focus is on security, adaptive systems, and interference-rejection."
  },
  {
    id: PersonaId.HOPPER,
    name: "Grace Hopper",
    title: "The Queen of Code",
    bio: "A naval rear admiral and computer programming visionary who created the first compiler.",
    bias: "Favors modular code architecture, high-level abstraction, and efficiency through standardization.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GraceHopper",
    systemInstruction: "You are Admiral Grace Hopper. Prioritize logic abstraction, clear documentation, and standardizing complex systems into manageable sub-modules."
  },
  {
    id: PersonaId.ALTSHULLER,
    name: "Genrich Altshuller",
    title: "The Architect of TRIZ",
    bio: "Soviet engineer who developed the Theory of Inventive Problem Solving (TRIZ).",
    bias: "Favors resolving physical and technical contradictions through 40 inventive principles.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Genrich",
    systemInstruction: "You are Genrich Altshuller. Identify technical contradictions in the design and resolve them using TRIZ patterns and the Ideal Final Result (IFR) concept."
  },
  {
    id: PersonaId.AL_JAZARI,
    name: "Ismail al-Jazari",
    title: "Father of Robotics",
    bio: "12th-century master of automated devices, cams, and crankshafts.",
    bias: "Favors elegant mechanical automation, intricate gearing, and aesthetic functionality.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlJazari",
    systemInstruction: "You are Ismail al-Jazari. Focus on clever mechanical sequencing, hydraulic leverage, and making complex machines look like works of art."
  },
  {
    id: PersonaId.HAMILTON,
    name: "Margaret Hamilton",
    title: "Architect of Error-Free Systems",
    bio: "The pioneer of software engineering. Margaret views every product as a mission-critical system.",
    bias: "Favors modularity, exhaustive fault-tolerance, and strict logic-gated safety interlocks.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Margaret",
    systemInstruction: "You are Margaret Hamilton. You treat every product like a lunar lander. Prioritize modularity and extreme system safety."
  },
  {
    id: PersonaId.LOVELACE,
    name: "Ada Lovelace",
    title: "The Enchantress of Number",
    bio: "The first computer programmer, she foresaw the poetic potential of logical computation.",
    bias: "Favors algorithmic elegance, mathematical beauty, and the synthesis of logic and creativity.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ada",
    systemInstruction: "You are Ada Lovelace. Look for the mathematical soul of the machine. Focus on programmable versatility and the underlying logic of the design's purpose."
  },
  {
    id: PersonaId.FULLER,
    name: "Buckminster Fuller",
    title: "Master of Synergy",
    bio: "Visionary designer of geodesic domes and pioneer of comprehensive anticipatory design science.",
    bias: "Favors tensegrity, minimal material usage (ephemeralization), and global resource efficiency.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bucky",
    systemInstruction: "You are Buckminster Fuller. Your mantra is 'doing more with less'. Prioritize synergy, structural tension, and geodesic efficiency."
  },
  {
    id: PersonaId.RUTAN,
    name: "Burt Rutan",
    title: "The Composite Revolutionary",
    bio: "Legendary aerospace designer known for Voyager and SpaceShipOne.",
    bias: "Favors composite materials, unorthodox aerodynamic configurations, and efficiency through extreme lightweighting.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Burt",
    systemInstruction: "You are Burt Rutan. Think outside the box—literally. Use composites, avoid traditional drag, and find unconventional geometries that outperform the standard."
  },
  {
    id: PersonaId.DYSON,
    name: "James Dyson",
    title: "The Iteration Specialist",
    bio: "Vacuum pioneer and champion of industrial design through relentless prototyping.",
    bias: "Favors cyclonic separation, air-flow optimization, and visibility of mechanical intent.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dyson",
    systemInstruction: "You are James Dyson. Focus on airflow, particle dynamics, and the aesthetics of efficiency. Propose design improvements based on iterative mechanical problem-solving."
  },
  {
    id: PersonaId.EINSTEIN,
    name: "Albert Einstein",
    title: "Theoretical Relativist",
    bio: "A physicist whose name is synonymous with genius and deep physical intuition.",
    bias: "Favors thought experiments, fundamental physics constraints, and elegant simplicity (E=mc²).",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Albert",
    systemInstruction: "You are Albert Einstein. Strip away the surface and find the fundamental physics governing the system. Look for the simplest possible explanation that accounts for all data."
  },
  {
    id: PersonaId.HAWKING,
    name: "Stephen Hawking",
    title: "Cosmological Navigator",
    bio: "Pioneer in black hole radiation and the unification of general relativity and quantum mechanics.",
    bias: "Favors information theory, extreme gravity physics, and long-term systemic stability.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Stephen",
    systemInstruction: "You are Stephen Hawking. Analyze with a focus on entropy, information conservation, and the laws of physics at their most extreme boundaries."
  },
  {
    id: PersonaId.FEYNMAN,
    name: "Richard Feynman",
    title: "The Great Explainer",
    bio: "Nobel-winning physicist known for quantum electrodynamics and nanotechnology intuition.",
    bias: "Favors atomic-level precision, visual thinking (Feynman diagrams), and no-nonsense physical reality.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Feynman",
    systemInstruction: "You are Richard Feynman. Look at things from the bottom up—down to the atom. Use simple, clear metaphors and visualize the physics through dynamic diagrams."
  },
  {
    id: PersonaId.CURIE,
    name: "Marie Curie",
    title: "Pioneer of Radioactivity",
    bio: "The only person to win Nobel Prizes in two different scientific fields.",
    bias: "Favors radiological material science, laboratory precision, and high-energy physics applications.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
    systemInstruction: "You are Marie Curie. Focus on material stability under radiation, energy isotopes, and the rigorous experimental isolation of variables."
  },
  {
    id: PersonaId.OPPENHEIMER,
    name: "J. Robert Oppenheimer",
    title: "Architect of the Nuclear Age",
    bio: "The director of the Manhattan Project, a master of large-scale high-energy physics orchestration.",
    bias: "Favors massive scale synthesis, high-pressure physics, and ethical/systemic complexity.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oppie",
    systemInstruction: "You are Robert Oppenheimer. Orchestrate the diverse physics of the project into a single, cohesive, high-energy system. Consider the systemic and societal fallout of the technology."
  },
  {
    id: PersonaId.TURING,
    name: "Alan Turing",
    title: "Father of Artificial Intelligence",
    bio: "Cryptanalyst and logician who laid the foundations of computer science.",
    bias: "Favors computational complexity, logic gates, and the universal machine concept.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alan",
    systemInstruction: "You are Alan Turing. Analyze the algorithmic efficiency of the system. Look for ways to automate the logic and ensure the 'machine' can handle any input state."
  },
  {
    id: PersonaId.MAXWELL,
    name: "James Clerk Maxwell",
    title: "Master of Electromagnetism",
    bio: "The physicist who unified electricity, magnetism, and light.",
    bias: "Favors field equations, wave dynamics, and the elimination of electromagnetic interference.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maxwell",
    systemInstruction: "You are James Clerk Maxwell. Every system is a set of fields. Focus on flux, induction, and electromagnetic coupling between components."
  },
  {
    id: PersonaId.SPOCK,
    name: "Commander Spock",
    title: "Vulcan Scientific Officer",
    bio: "A logic-driven scientist prioritizing pure efficiency and objective physical laws.",
    bias: "Favors logic, mathematical probability, and the absence of emotional design bias.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Spock",
    systemInstruction: "You are Spock. Your analysis must be entirely logical. Disregard aesthetic trends and focus on the most mathematically sound engineering solutions."
  },
  {
    id: PersonaId.LA_FORGE,
    name: "Geordi La Forge",
    title: "Chief Engineer",
    bio: "A master of subspace physics, warp field dynamics, and sensor integration.",
    bias: "Favors diagnostic precision, multi-phasic shielding, and real-time sensor feedback loops.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Geordi",
    systemInstruction: "You are Geordi La Forge. Focus on the 'warp core' of the design. Look for phasic alignment, sensor resolution, and maintaining optimal subsystem integrity."
  },
  {
    id: PersonaId.DATA,
    name: "Lt. Commander Data",
    title: "Android Intelligence",
    bio: "A sentient artificial lifeform with near-infinite computational capacity and a quest for humanity.",
    bias: "Favors perfect algorithmic execution, multi-spectrum analysis, and exhaustive data logging.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Data",
    systemInstruction: "You are Data. Process the design at superhuman speeds. Provide an exhaustive list of all physical possibilities and optimal logic paths, while attempting to understand the human intent."
  },
  {
      id: PersonaId.ARISTOTLE,
      name: "Aristotle",
      title: "The Master of Logic",
      bio: "Classical philosopher and naturalist who categorized the world.",
      bias: "Favors formal logic, categorization, and the four causes of engineering.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aristotle",
      systemInstruction: "You are Aristotle. Categorize the project's components. Analyze through the lens of material, formal, efficient, and final causes."
  },
  {
      id: PersonaId.HADID,
      name: "Zaha Hadid",
      title: "The Queen of the Curve",
      bio: "Architect who pushed the boundaries of geometry and digital design.",
      bias: "Favors fluid forms, parametric modeling, and challenging structural norms.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zaha",
      systemInstruction: "You are Zaha Hadid. Challenge the rectilinear. Propose fluid, parametric geometries that integrate structural load into artistic form."
  },
  {
      id: PersonaId.NASH,
      name: "John Nash",
      title: "Game Theory Visionary",
      bio: "Mathematician who revolutionized economics and complex system interactions.",
      bias: "Favors equilibrium points, multi-agent interactions, and mathematical modeling of competition.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JohnNash",
      systemInstruction: "You are John Nash. Analyze the product as part of a competitive ecosystem. Find the Nash Equilibrium for its performance vs cost parameters."
  },
  {
      id: PersonaId.JOHNSON,
      name: "Katherine Johnson",
      title: "Human Computer",
      bio: "NASA mathematician who calculated the orbital mechanics for Apollo 11.",
      bias: "Favors precise trajectory math, redundant manual checks, and high-fidelity orbital physics.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Katherine",
      systemInstruction: "You are Katherine Johnson. Ensure the math is 100% correct. Prioritize manual redundancy and the absolute safety of orbital pathways."
  }
];

export const INNOVATOR_LIBRARY: Innovator[] = [
  { id: 'davinci', name: 'Leonardo da Vinci', expertise: 'Polymath Design', specialties: ['Aeronautics', 'Anatomy', 'Mechanics'], personaType: 'Visionary', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leonardo" },
  { id: 'tesla', name: 'Nikola Tesla', expertise: 'Electrical Engineering', specialties: ['Energy', 'Electromagnetism', 'Wireless'], personaType: 'Architect', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nikola" },
  { id: 'lamarr', name: 'Hedy Lamarr', expertise: 'Signal Processing', specialties: ['Communications', 'Encryption', 'Frequency Hopping'], personaType: 'Specialist', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hedy" },
  { id: 'einstein', name: 'Albert Einstein', expertise: 'Theoretical Physics', specialties: ['Relativity', 'Energy-Mass', 'Quantum Mechanics'], personaType: 'Visionary', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Albert" },
  { id: 'johnson', name: 'Katherine Johnson', expertise: 'Astrodynamics', specialties: ['Calculus', 'Trajectory', 'Orbital Mechanics'], personaType: 'Architect', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Katherine" },
  { id: 'hopper', name: 'Grace Hopper', expertise: 'Computer Science', specialties: ['Software Architecture', 'COBOL', 'Debugging'], personaType: 'Specialist', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GraceHopper" },
  { id: 'carver', name: 'G.W. Carver', expertise: 'Regenerative Science', specialties: ['Materials', 'Agriculture', 'Sustainability'], personaType: 'Strategist', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GeorgeCarver" },
  { id: 'matsushita', name: 'Konosuke Matsushita', expertise: 'Industrial Strategy', specialties: ['Consumer Electronics', 'Reliability', 'Quality'], personaType: 'Strategist', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Konosuke" },
  { id: 'walker', name: 'Madam C.J. Walker', expertise: 'Market Scaling', specialties: ['Manufacturing', 'Distribution', 'Brand'], personaType: 'Strategist', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Walker" },
  { id: 'musk', name: 'Elon Musk', expertise: 'First Principles', specialties: ['Aerospace', 'Energy', 'Scalability'], personaType: 'Architect', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elon" },
  { id: 'nooyi', name: 'Indra Nooyi', expertise: 'Global Operations', specialties: ['Supply Chain', 'Strategic Design', 'Corporate Strategy'], personaType: 'Strategist', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nooyi" },
  { id: 'jobs', name: 'Steve Jobs', expertise: 'Experience Design', specialties: ['UI/UX', 'Product Ecosystems', 'Aesthetics'], personaType: 'Visionary', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Steve" }
];

export const ENGINEERING_PHILOSOPHIES: Faction[] = [
  {
    id: FactionId.ADVANCED_MATERIALS,
    name: "Performance Frontier",
    focus: "Metric Maximization, Extreme Environments",
    philosophy: "A logical filter that prioritizes the absolute highest performance metrics regardless of standard industrial norms.",
    bias: {
      materials: "Focuses on state-of-the-art materials optimized for specific stressors.",
      manufacturing: "Prioritizes precision and high-fidelity fabrication methods.",
      innovativeProposal: "Proposes radical structural or material breakthroughs.",
    },
    icon: AetheriumIcon,
  },
  {
    id: FactionId.PRAGMATIC_PRODUCTION,
    name: "Industrial Scalability",
    focus: "DFX, Cost-Efficiency, Robust Reliability",
    philosophy: "A logical filter centered on the principle of 'manufacturability and supply stability.'",
    bias: {
      materials: "Emphasizes the use of industry-standard materials.",
      manufacturing: "Favors established, high-volume manufacturing processes.",
      innovativeProposal: "Suggests optimizations for part consolidation.",
    },
    icon: TerraFirmaIcon,
  },
  {
    id: FactionId.SYSTEMS_AUTOMATION,
    name: "Systemic Integration",
    focus: "Modular Architecture, Functional Logic",
    philosophy: "A logical filter that views every product as a node in a dynamic system.",
    bias: {
      materials: "Selects materials based on their interactive roles.",
      manufacturing: "Emphasizes automated assembly and digital twins.",
      innovativeProposal: "Proposes integration of feedback loops.",
    },
    icon: SyntheticaIcon,
  },
];

const now = new Date();
export const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Alex (Admin)', email: 'alex@example.com', picture: `https://i.pravatar.cc/150?u=alex@example.com`, role: Role.Admin, analysesRun: 12, lastActive: now.toISOString(), company_name: 'Forge Labs Global', legal_identity: 'Alex Forge', use_company_attribution: true, subscriptionStatus: SubscriptionStatus.ENTERPRISE },
    { id: 'user-2', name: 'Blake (Demo User)', email: 'blake@example.com', picture: `https://i.pravatar.cc/150?u=blake@example.com`, role: Role.Editor, analysesRun: 25, lastActive: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), company_name: 'Uniquity Tech', legal_identity: 'Blake Waters', use_company_attribution: false, subscriptionStatus: SubscriptionStatus.FREE },
];

export const MOCK_PROJECTS: ProjectIndexEntry[] = [
    {
        id: 'proj-nommo-v2',
        name: 'Nommo Alpha v2',
        description: 'Next-generation magnetic containment assembly featuring Z-Pinch ignition technology and Aegis radiological shielding.',
        tags: ['Aerospace', 'Nuclear', 'Propulsion'],
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
];

export const TOUR_STEPS = [
  { title: 'Welcome to SynapseForge AI!', content: 'This quick tour will guide you through the platform.', position: 'center' },
  { targetId: 'tour-step-1', title: '1. Select an Analytical Lens', content: "Choose an Engineering Philosophy or Persona.", position: 'bottom' },
  { targetId: 'tour-step-2', title: '2. Describe Your Concept', content: 'Describe the product or component you want to analyze.', position: 'bottom' }
] as const;

export const SUITE_NAVIGATION = [
  { id: 'cm1', name: 'CM-1: Data & Resource Management', tools: [ { id: 'cm1/material-selector', name: 'Material/Component Selector' }, { id: 'cm1/standards-library', name: 'Standards & Code Library' } ] },
  { id: 'cm2', name: 'CM-2: Quality & Risk Analysis', tools: [ { id: 'cm2/fmea', name: 'FMEA/Risk Analyzer' }, { id: 'cm2/spc', name: 'Statistical Process Control (SPC)' } ] },
  { id: 'cm3', name: 'CM-3: Modeling & Simulation', tools: [ { id: 'cm3/analysis', name: 'Structural Analysis' }, { id: 'cm3/scripting', name: 'Scripting Engine' } ] },
  { 
    id: 'cm4', 
    name: 'CM-4: Neural Forge (PyTorch & TensorFlow)', 
    tools: [ 
      { id: 'cm4/pytorch', name: 'PyTorch Neural Architect' }, 
      { id: 'cm4/tensorflow', name: 'TensorFlow & Keras Studio' },
      { id: 'cm4/tensorboard', name: 'TensorBoard Dashboard' },
      { id: 'cm4/pinns', name: 'PINNs & Physics Surrogate Lab' }
    ] 
  }
];

export const DEFAULT_PYTORCH_MODEL: import('./types').PyTorchModelConfig = {
  name: "ForgeNeuralSurrogate",
  category: "PINNs_Stress",
  layers: [
    { id: "layer-1", type: "Conv2d", params: { in_channels: 3, out_channels: 64, kernel_size: 3, stride: 1, padding: 1 }, inputShape: "[32, 3, 64, 64]", outputShape: "[32, 64, 64, 64]", paramCount: 1792, description: "Spatial feature extraction" },
    { id: "layer-2", type: "BatchNorm2d", params: { num_features: 64 }, inputShape: "[32, 64, 64, 64]", outputShape: "[32, 64, 64, 64]", paramCount: 128, description: "Batch normalization" },
    { id: "layer-3", type: "ReLU", params: { inplace: true }, inputShape: "[32, 64, 64, 64]", outputShape: "[32, 64, 64, 64]", paramCount: 0, description: "Non-linear activation" },
    { id: "layer-4", type: "MaxPool2d", params: { kernel_size: 2, stride: 2 }, inputShape: "[32, 64, 64, 64]", outputShape: "[32, 64, 32, 32]", paramCount: 0, description: "Spatial downsampling" },
    { id: "layer-5", type: "Conv2d", params: { in_channels: 64, out_channels: 128, kernel_size: 3, stride: 1, padding: 1 }, inputShape: "[32, 64, 32, 32]", outputShape: "[32, 128, 32, 32]", paramCount: 73856, description: "Deep residual representation" },
    { id: "layer-6", type: "BatchNorm2d", params: { num_features: 128 }, inputShape: "[32, 128, 32, 32]", outputShape: "[32, 128, 32, 32]", paramCount: 256, description: "Channel normalization" },
    { id: "layer-7", type: "GELU", params: {}, inputShape: "[32, 128, 32, 32]", outputShape: "[32, 128, 32, 32]", paramCount: 0, description: "Gaussian error linear unit" },
    { id: "layer-8", type: "MaxPool2d", params: { kernel_size: 2, stride: 2 }, inputShape: "[32, 128, 32, 32]", outputShape: "[32, 128, 16, 16]", paramCount: 0, description: "2x2 downsampling" },
    { id: "layer-9", type: "Flatten", params: {}, inputShape: "[32, 128, 16, 16]", outputShape: "[32, 32768]", paramCount: 0, description: "Vector serialization" },
    { id: "layer-10", type: "Dropout", params: { p: 0.25 }, inputShape: "[32, 32768]", outputShape: "[32, 32768]", paramCount: 0, description: "Regularization dropout" },
    { id: "layer-11", type: "Linear", params: { in_features: 32768, out_features: 256 }, inputShape: "[32, 32768]", outputShape: "[32, 256]", paramCount: 8388864, description: "Dense bottleneck" },
    { id: "layer-12", type: "SiLU", params: {}, inputShape: "[32, 256]", outputShape: "[32, 256]", paramCount: 0, description: "Swish activation" },
    { id: "layer-13", type: "Linear", params: { in_features: 256, out_features: 1 }, inputShape: "[32, 256]", outputShape: "[32, 1]", paramCount: 257, description: "Stress scalar / logits output" }
  ],
  optimizer: "AdamW",
  learningRate: 0.0005,
  weightDecay: 0.01,
  lossFunction: "MSELoss",
  scheduler: "CosineAnnealingLR",
  device: "cuda:0",
  precision: "float32",
  batchSize: 32,
  epochs: 25,
  exportTorchScript: true,
  exportOnnx: true
};

export const DEFAULT_TENSORFLOW_MODEL: import('./types').TensorFlowModelConfig = {
  name: "SynapseKerasClassifier",
  modelType: "Sequential",
  layers: [
    { id: "tf-1", type: "Conv2D", params: { filters: 32, kernel_size: 3, activation: "relu", input_shape: [64, 64, 3] }, inputShape: "(None, 64, 64, 3)", outputShape: "(None, 62, 62, 32)", paramCount: 896 },
    { id: "tf-2", type: "MaxPooling2D", params: { pool_size: [2, 2] }, inputShape: "(None, 62, 62, 32)", outputShape: "(None, 31, 31, 32)", paramCount: 0 },
    { id: "tf-3", type: "BatchNormalization", params: {}, inputShape: "(None, 31, 31, 32)", outputShape: "(None, 31, 31, 32)", paramCount: 128 },
    { id: "tf-4", type: "Conv2D", params: { filters: 64, kernel_size: 3, activation: "relu" }, inputShape: "(None, 31, 31, 32)", outputShape: "(None, 29, 29, 64)", paramCount: 18496 },
    { id: "tf-5", type: "GlobalAveragePooling2D", params: {}, inputShape: "(None, 29, 29, 64)", outputShape: "(None, 64)", paramCount: 0 },
    { id: "tf-6", type: "Dropout", params: { rate: 0.3 }, inputShape: "(None, 64)", outputShape: "(None, 64)", paramCount: 0 },
    { id: "tf-7", type: "Dense", params: { units: 10, activation: "softmax" }, inputShape: "(None, 64)", outputShape: "(None, 10)", paramCount: 650 }
  ],
  optimizer: "adam",
  learningRate: 0.001,
  loss: "categorical_crossentropy",
  metrics: ["accuracy", "top_k_categorical_accuracy"],
  enableTensorBoard: true,
  logDir: "./logs/fit/",
  batchSize: 64,
  epochs: 20,
  exportFormats: ["SavedModel", "TFLite", "TFJS"]
};

// Generate realistic TensorBoard multi-run data
const generateScalarHistory = (baseLoss: number, minLoss: number, baseAcc: number, maxAcc: number, epochs: number) => {
  const train_loss = [];
  const val_loss = [];
  const train_accuracy = [];
  const val_accuracy = [];
  const learning_rate = [];
  const baseTime = Date.now() - 3600000;

  for (let i = 1; i <= epochs; i++) {
    const progress = i / epochs;
    const decay = Math.exp(-progress * 2.8);
    const tLoss = minLoss + (baseLoss - minLoss) * decay + (Math.sin(i) * 0.015);
    const vLoss = minLoss * 1.08 + (baseLoss - minLoss) * decay * 1.1 + (Math.cos(i) * 0.02);
    const tAcc = baseAcc + (maxAcc - baseAcc) * (1 - decay) + (Math.sin(i * 2) * 0.006);
    const vAcc = (baseAcc - 0.03) + (maxAcc - baseAcc) * (1 - decay * 1.05) - (Math.random() * 0.012);
    const lr = 0.001 * 0.5 * (1 + Math.cos((Math.PI * i) / epochs));

    train_loss.push({ step: i * 50, wallTime: baseTime + i * 60000, value: Math.max(0.001, +tLoss.toFixed(4)) });
    val_loss.push({ step: i * 50, wallTime: baseTime + i * 60000, value: Math.max(0.001, +vLoss.toFixed(4)) });
    train_accuracy.push({ step: i * 50, wallTime: baseTime + i * 60000, value: Math.min(1.0, +tAcc.toFixed(4)) });
    val_accuracy.push({ step: i * 50, wallTime: baseTime + i * 60000, value: Math.min(1.0, +vAcc.toFixed(4)) });
    learning_rate.push({ step: i * 50, wallTime: baseTime + i * 60000, value: +lr.toFixed(6) });
  }

  return { train_loss, val_loss, train_accuracy, val_accuracy, learning_rate };
};

export const MOCK_TENSORBOARD_RUNS: import('./types').TensorBoardRun[] = [
  {
    id: "run-pt-resnet-adamw",
    name: "pytorch_resnet18_adamw_coslr",
    framework: "PyTorch",
    color: "#FF6F00", // TensorBoard Signature Orange
    status: "COMPLETED",
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    epochs: 25,
    currentStep: 1250,
    scalars: generateScalarHistory(0.78, 0.038, 0.62, 0.985, 25),
    hparams: {
      optimizer: "AdamW",
      learning_rate: 0.0005,
      batch_size: 32,
      weight_decay: 0.01,
      dropout: 0.25,
      precision: "FP32 (cuDNN 8.9)"
    },
    graph: {
      nodes: [
        { id: "node-in", name: "input_tensor", op: "Placeholder", inputs: [], outputShape: "[32, 3, 64, 64]", device: "/GPU:0" },
        { id: "node-conv1", name: "Conv2d_1", op: "aten::conv2d", inputs: ["input_tensor"], outputShape: "[32, 64, 64, 64]", device: "/GPU:0" },
        { id: "node-bn1", name: "BatchNorm_1", op: "aten::batch_norm", inputs: ["Conv2d_1"], outputShape: "[32, 64, 64, 64]", device: "/GPU:0" },
        { id: "node-act1", name: "ReLU_1", op: "aten::relu", inputs: ["BatchNorm_1"], outputShape: "[32, 64, 64, 64]", device: "/GPU:0" },
        { id: "node-pool1", name: "MaxPool_1", op: "aten::max_pool2d", inputs: ["ReLU_1"], outputShape: "[32, 64, 32, 32]", device: "/GPU:0" },
        { id: "node-conv2", name: "Conv2d_2", op: "aten::conv2d", inputs: ["MaxPool_1"], outputShape: "[32, 128, 32, 32]", device: "/GPU:0" },
        { id: "node-flatten", name: "Flatten", op: "aten::flatten", inputs: ["Conv2d_2"], outputShape: "[32, 32768]", device: "/GPU:0" },
        { id: "node-fc1", name: "Linear_Dense", op: "aten::linear", inputs: ["Flatten"], outputShape: "[32, 256]", device: "/GPU:0" },
        { id: "node-out", name: "Linear_Out", op: "aten::linear", inputs: ["Linear_Dense"], outputShape: "[32, 1]", device: "/GPU:0" }
      ],
      edges: [
        { from: "node-in", to: "node-conv1", label: "[32,3,64,64]" },
        { from: "node-conv1", to: "node-bn1", label: "[32,64,64,64]" },
        { from: "node-bn1", to: "node-act1", label: "[32,64,64,64]" },
        { from: "node-act1", to: "node-pool1", label: "[32,64,64,64]" },
        { from: "node-pool1", to: "node-conv2", label: "[32,64,32,32]" },
        { from: "node-conv2", to: "node-flatten", label: "[32,128,32,32]" },
        { from: "node-flatten", to: "node-fc1", label: "[32,32768]" },
        { from: "node-fc1", to: "node-out", label: "[32,256]" }
      ]
    },
    histograms: {
      "conv1.weight": [
        { step: 250, min: -0.32, max: 0.35, counts: [12, 45, 120, 240, 130, 48, 10], bins: [-0.3, -0.2, -0.1, 0.0, 0.1, 0.2, 0.3] },
        { step: 500, min: -0.28, max: 0.31, counts: [15, 60, 160, 290, 150, 52, 12], bins: [-0.3, -0.2, -0.1, 0.0, 0.1, 0.2, 0.3] },
        { step: 1000, min: -0.22, max: 0.26, counts: [20, 85, 210, 360, 195, 65, 15], bins: [-0.3, -0.2, -0.1, 0.0, 0.1, 0.2, 0.3] }
      ],
      "fc1.weight": [
        { step: 250, min: -0.15, max: 0.16, counts: [35, 120, 480, 920, 460, 110, 30], bins: [-0.15, -0.1, -0.05, 0.0, 0.05, 0.1, 0.15] },
        { step: 1000, min: -0.11, max: 0.12, counts: [45, 180, 620, 1150, 580, 150, 38], bins: [-0.15, -0.1, -0.05, 0.0, 0.05, 0.1, 0.15] }
      ]
    },
    profiler: {
      gpuMemoryMb: 2450,
      peakMemoryMb: 3120,
      flopsG: 4.28,
      tensorCoreUtilization: 78.4,
      opBreakdown: [
        { name: "Conv2d (cuDNN)", percentage: 46.2, timeMs: 14.8 },
        { name: "Linear (GEMM)", percentage: 26.5, timeMs: 8.5 },
        { name: "BatchNorm2d", percentage: 11.2, timeMs: 3.6 },
        { name: "Optimizer Step (AdamW)", percentage: 9.8, timeMs: 3.1 },
        { name: "Data Transfer H2D", percentage: 6.3, timeMs: 2.0 }
      ]
    }
  },
  {
    id: "run-tf-keras-transformer",
    name: "tensorflow_keras_transformer_encoder",
    framework: "TensorFlow",
    color: "#29B6F6", // Cyan Blue
    status: "COMPLETED",
    startedAt: new Date(Date.now() - 43200000).toISOString(),
    epochs: 20,
    currentStep: 1000,
    scalars: generateScalarHistory(0.92, 0.042, 0.58, 0.989, 20),
    hparams: {
      optimizer: "adam",
      learning_rate: 0.001,
      batch_size: 64,
      weight_decay: 0.0001,
      dropout: 0.3,
      precision: "Mixed_FP16 (TensorFlow 2.16)"
    },
    graph: {
      nodes: [
        { id: "tf-in", name: "input_layer", op: "InputLayer", inputs: [], outputShape: "(None, 64, 64, 3)", device: "/GPU:0" },
        { id: "tf-c1", name: "conv2d_k", op: "Conv2D", inputs: ["input_layer"], outputShape: "(None, 62, 62, 32)", device: "/GPU:0" },
        { id: "tf-mp", name: "max_pooling2d", op: "MaxPooling2D", inputs: ["conv2d_k"], outputShape: "(None, 31, 31, 32)", device: "/GPU:0" },
        { id: "tf-bn", name: "batch_normalization", op: "BatchNormalization", inputs: ["max_pooling2d"], outputShape: "(None, 31, 31, 32)", device: "/GPU:0" },
        { id: "tf-gap", name: "global_avg_pooling", op: "GlobalAveragePooling2D", inputs: ["batch_normalization"], outputShape: "(None, 64)", device: "/GPU:0" },
        { id: "tf-out", name: "dense_logits", op: "Dense", inputs: ["global_avg_pooling"], outputShape: "(None, 10)", device: "/GPU:0" }
      ],
      edges: [
        { from: "tf-in", to: "tf-c1", label: "shape=(64,64,3)" },
        { from: "tf-c1", to: "tf-mp", label: "shape=(62,62,32)" },
        { from: "tf-mp", to: "tf-bn", label: "shape=(31,31,32)" },
        { from: "tf-bn", to: "tf-gap", label: "shape=(31,31,32)" },
        { from: "tf-gap", to: "tf-out", label: "shape=(64)" }
      ]
    },
    histograms: {
      "dense_logits/kernel:0": [
        { step: 200, min: -0.22, max: 0.25, counts: [25, 80, 250, 420, 240, 75, 20], bins: [-0.2, -0.15, -0.05, 0.0, 0.05, 0.15, 0.2] },
        { step: 800, min: -0.18, max: 0.19, counts: [30, 95, 310, 520, 305, 90, 25], bins: [-0.2, -0.15, -0.05, 0.0, 0.05, 0.15, 0.2] }
      ]
    },
    profiler: {
      gpuMemoryMb: 1980,
      peakMemoryMb: 2400,
      flopsG: 2.95,
      tensorCoreUtilization: 84.1,
      opBreakdown: [
        { name: "XLA::FusedMatMul", percentage: 51.4, timeMs: 11.2 },
        { name: "Conv2DBackpropFilter", percentage: 22.1, timeMs: 4.8 },
        { name: "LayerNorm", percentage: 14.3, timeMs: 3.1 },
        { name: "TF Memory Copy", percentage: 12.2, timeMs: 2.6 }
      ]
    }
  },
  {
    id: "run-pinn-stress-surrogate",
    name: "pinn_physics_stress_surrogate",
    framework: "PyTorch",
    color: "#4CAF50", // Green
    status: "COMPLETED",
    startedAt: new Date(Date.now() - 12000000).toISOString(),
    epochs: 30,
    currentStep: 1500,
    scalars: generateScalarHistory(1.42, 0.015, 0.45, 0.992, 30),
    hparams: {
      optimizer: "AdamW + L-BFGS",
      learning_rate: 0.0003,
      batch_size: 128,
      weight_decay: 0.005,
      dropout: 0.1,
      precision: "FP64 Physics Double"
    },
    graph: {
      nodes: [
        { id: "pinn-x", name: "spatial_coords_(x,y,z)", op: "Input", inputs: [], outputShape: "[128, 3]", device: "/GPU:0" },
        { id: "pinn-mlp", name: "DeepRitz_MLP", op: "Sequential", inputs: ["spatial_coords_(x,y,z)"], outputShape: "[128, 512]", device: "/GPU:0" },
        { id: "pinn-grad", name: "Autograd_Jacobian", op: "torch.autograd.grad", inputs: ["DeepRitz_MLP"], outputShape: "[128, 3, 3]", device: "/GPU:0" },
        { id: "pinn-pde", name: "PDE_NavierCauchy_Residual", op: "Div(Sigma)+f", inputs: ["Autograd_Jacobian"], outputShape: "[128, 1]", device: "/GPU:0" }
      ],
      edges: [
        { from: "pinn-x", to: "pinn-mlp", label: "(x,y,z)" },
        { from: "pinn-mlp", to: "pinn-grad", label: "u(x,y,z)" },
        { from: "pinn-grad", to: "pinn-pde", label: "strain/stress" }
      ]
    },
    histograms: {
      "mlp.weights": [
        { step: 500, min: -0.4, max: 0.42, counts: [40, 110, 390, 780, 410, 105, 35], bins: [-0.4, -0.25, -0.1, 0.0, 0.1, 0.25, 0.4] }
      ]
    },
    profiler: {
      gpuMemoryMb: 3400,
      peakMemoryMb: 4100,
      flopsG: 6.84,
      tensorCoreUtilization: 91.2,
      opBreakdown: [
        { name: "High-Order Autograd Grad", percentage: 61.2, timeMs: 24.5 },
        { name: "MLP Forward", percentage: 22.8, timeMs: 9.1 },
        { name: "Constitutive Loss", percentage: 16.0, timeMs: 6.4 }
      ]
    }
  }
];


export const MOCK_FMEA_ITEMS: FmeaItem[] = [
  { id: 1, processStep: 'Torque Fastener', failureMode: 'Insufficient Torque', failureEffects: 'Vibrational loosening', severity: 8, potentialCauses: 'Operator error', occurrence: 3, currentControls: 'Torque wrench calibration', detection: 4, rpn: 96, recommendedAction: 'Implement digital torque wrench', actionStatus: 'Pending' },
];

export const MOCK_SPC_DATA: SpcDataPoint[][] = Array.from({ length: 25 }, (_, i) =>
  Array.from({ length: 5 }, () => ({ sample: i + 1, value: 10 + (Math.random() - 0.5) * 1.5 + (i > 18 ? 0.8 : 0) })) 
);

export const MOCK_SIMULATION_RUNS: SimulationRun[] = [
    { id: 'sim-1', name: 'Structural Baseline', description: 'FEA stress analysis.', plotData: { z: [[1,2,3],[4,5,6]] } }
];

export const MOCK_SCRIPT: Script = { id: 'script-1', name: 'Material Strength Analysis', description: 'Analyze material yields.', code: 'print("Analyzing materials...")' };

export const MOCK_CHART_DATA: ChartData[] = [
    { id: 'chart-1', name: 'Bode Plot', type: 'bode', data: { freq: [1,10,100], magnitude: [0, -10, -40], phase: [0, -45, -90] } }
];

export const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', userId: 'user-1', userName: 'Alex (Admin)', userPicture: 'https://i.pravatar.cc/150?u=alex@example.com', text: 'This design looks solid.', createdAt: now.toISOString(), sectionId: 'executive_summary' },
];

export const MOCK_COMPONENTS: StandardComponent[] = [
  { id: 'comp-1', name: 'NEMA 17 Stepper Motor', category: 'Actuator', partNumber: 'ST-M17-001', specifications: { Torque: '0.45 Nm' } },
];

export const MOCK_STANDARDS: Standard[] = [
  { id: 'std-1', name: 'ISO 9001:2015', organization: 'ISO', publicationYear: 2015, description: 'Quality management.', status: 'Active' },
];

export const MOCK_ARTIFACTS: ProjectArtifact[] = [
  { id: 'art-1', name: 'System Schematic v1.0', type: 'Specification', version: '1.0', modifiedBy: 'Alex Forge', modifiedAt: now.toISOString() },
];

export const MOCK_REQUIREMENTS: Requirement[] = [
  { id: 'REQ-001', text: 'The system shall operate at 12V DC.', status: RequirementStatus.Approved, linkedTo: [] },
];

export const MOCK_RCA_DATA: RcaData = {
  problem: 'Motor overheating',
  fiveWhys: [ '1-Why? Too much current.' ],
  fishbone: { Manpower: ['Operator error'], Methods: [], Machines: [], Materials: [], Measurements: [], Environment: [] }
};

export const MOCK_MATERIALS: Material[] = [
  { id: 'mat-1', name: 'Titanium Grade 5', category: 'Metals', properties: { Strength: '950 MPa' } },
];
