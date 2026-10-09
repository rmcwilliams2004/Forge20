
import { MaterialPreset } from '../types';

export const MATERIAL_LIBRARY: MaterialPreset[] = [
  // --- High-Performance Metals ---
  { id: 'al6061', name: 'Aluminum 6061-T6', category: 'Metals', density: 2700, youngsModulus: 68.9, tensileStrength: 310, yieldStrength: 276, thermalExpansion: 23.6, thermalConductivity: 167, costPerKg: 2.5 },
  { id: 'al7075', name: 'Aluminum 7075-T6', category: 'Metals', density: 2810, youngsModulus: 71.7, tensileStrength: 572, yieldStrength: 503, thermalExpansion: 23.4, thermalConductivity: 130, costPerKg: 5.5 },
  { id: 'ss304', name: 'Stainless Steel 304', category: 'Metals', density: 8000, youngsModulus: 193, tensileStrength: 505, yieldStrength: 215, thermalExpansion: 17.2, thermalConductivity: 16.2, costPerKg: 4.0 },
  { id: 'ss316', name: 'Stainless Steel 316L', category: 'Metals', density: 8000, youngsModulus: 193, tensileStrength: 515, yieldStrength: 205, thermalExpansion: 16.0, thermalConductivity: 16.3, costPerKg: 6.5 },
  { id: 'ti6al4v', name: 'Titanium 6Al-4V (G5)', category: 'Metals', density: 4430, youngsModulus: 114, tensileStrength: 950, yieldStrength: 880, thermalExpansion: 8.6, thermalConductivity: 6.7, costPerKg: 30.0 },
  { id: 'ti_cp2', name: 'Titanium CP Grade 2', category: 'Metals', density: 4510, youngsModulus: 105, tensileStrength: 345, yieldStrength: 275, thermalExpansion: 8.6, thermalConductivity: 16.4, costPerKg: 22.0 },
  { id: 'inconel718', name: 'Inconel 718', category: 'Metals', density: 8190, youngsModulus: 200, tensileStrength: 1375, yieldStrength: 1100, thermalExpansion: 13.0, thermalConductivity: 11.4, costPerKg: 55.0 },
  { id: 'cu101', name: 'Copper C101', category: 'Metals', density: 8940, youngsModulus: 117, tensileStrength: 220, yieldStrength: 70, thermalExpansion: 17.0, thermalConductivity: 391, costPerKg: 9.0 },
  { id: 'br70', name: 'Brass C260', category: 'Metals', density: 8530, youngsModulus: 110, tensileStrength: 300, yieldStrength: 105, thermalExpansion: 19.9, thermalConductivity: 120, costPerKg: 7.5 },
  { id: 'mgaz91', name: 'Magnesium AZ91D', category: 'Metals', density: 1810, youngsModulus: 45, tensileStrength: 230, yieldStrength: 160, thermalExpansion: 26.0, thermalConductivity: 72, costPerKg: 5.0 },
  { id: 'tungsten', name: 'Pure Tungsten', category: 'Metals', density: 19250, youngsModulus: 411, tensileStrength: 1510, yieldStrength: 1400, thermalExpansion: 4.5, thermalConductivity: 173, costPerKg: 45.0 },
  { id: 'molybdenum', name: 'Molybdenum', category: 'Metals', density: 10200, youngsModulus: 329, tensileStrength: 560, yieldStrength: 450, thermalExpansion: 4.8, thermalConductivity: 138, costPerKg: 35.0 },
  { id: 'chrome_moly', name: '4130 Steel', category: 'Metals', density: 7850, youngsModulus: 205, tensileStrength: 670, yieldStrength: 435, thermalExpansion: 12.3, thermalConductivity: 42.7, costPerKg: 3.0 },
  { id: 'tool_steel_d2', name: 'Tool Steel D2', category: 'Metals', density: 7700, youngsModulus: 210, tensileStrength: 1700, yieldStrength: 1550, thermalExpansion: 10.4, thermalConductivity: 20.0, costPerKg: 8.0 },
  
  // --- Advanced Polymers ---
  { id: 'abs', name: 'ABS (Injection Grade)', category: 'Polymers', density: 1040, youngsModulus: 2.3, tensileStrength: 45, yieldStrength: 35, thermalExpansion: 90.0, thermalConductivity: 0.17, costPerKg: 1.8 },
  { id: 'pc', name: 'Polycarbonate', category: 'Polymers', density: 1200, youngsModulus: 2.4, tensileStrength: 70, yieldStrength: 60, thermalExpansion: 68.0, thermalConductivity: 0.20, costPerKg: 3.2 },
  { id: 'peek', name: 'PEEK (High-Temp)', category: 'Polymers', density: 1320, youngsModulus: 3.6, tensileStrength: 100, yieldStrength: 90, thermalExpansion: 45.0, thermalConductivity: 0.25, costPerKg: 95.0 },
  { id: 'peek_cf30', name: 'PEEK CF30', category: 'Polymers', density: 1400, youngsModulus: 13.0, tensileStrength: 120, yieldStrength: 110, thermalExpansion: 12.0, thermalConductivity: 0.35, costPerKg: 180.0 },
  { id: 'ultem_9085', name: 'Ultem 9085', category: 'Polymers', density: 1270, youngsModulus: 2.2, tensileStrength: 70, yieldStrength: 65, thermalExpansion: 55.0, thermalConductivity: 0.22, costPerKg: 220.0 },
  { id: 'ptfe', name: 'PTFE (Teflon)', category: 'Polymers', density: 2200, youngsModulus: 0.5, tensileStrength: 30, yieldStrength: 20, thermalExpansion: 120.0, thermalConductivity: 0.25, costPerKg: 15.0 },
  { id: 'nylon6', name: 'Nylon 6 (PA6)', category: 'Polymers', density: 1140, youngsModulus: 2.5, tensileStrength: 80, yieldStrength: 70, thermalExpansion: 95.0, thermalConductivity: 0.25, costPerKg: 2.8 },
  { id: 'nylon12_cf', name: 'Nylon 12 CF', category: 'Polymers', density: 1150, youngsModulus: 6.5, tensileStrength: 76, yieldStrength: 65, thermalExpansion: 25.0, thermalConductivity: 0.30, costPerKg: 45.0 },
  { id: 'pom', name: 'Delrin (POM)', category: 'Polymers', density: 1410, youngsModulus: 3.1, tensileStrength: 70, yieldStrength: 60, thermalExpansion: 85.0, thermalConductivity: 0.31, costPerKg: 4.5 },
  { id: 'pp', name: 'Polypropylene', category: 'Polymers', density: 900, youngsModulus: 1.5, tensileStrength: 35, yieldStrength: 30, thermalExpansion: 150.0, thermalConductivity: 0.20, costPerKg: 1.5 },
  { id: 'petg', name: 'PETG', category: 'Polymers', density: 1270, youngsModulus: 2.1, tensileStrength: 50, yieldStrength: 45, thermalExpansion: 68.0, thermalConductivity: 0.20, costPerKg: 2.2 },
  { id: 'tpu_95a', name: 'TPU 95A (Elastic)', category: 'Polymers', density: 1200, youngsModulus: 0.05, tensileStrength: 30, yieldStrength: 10, thermalExpansion: 180.0, thermalConductivity: 0.19, costPerKg: 5.0 },
  
  // --- Ceramics & Refractories ---
  { id: 'al2o3', name: 'Alumina (99.5%)', category: 'Ceramics', density: 3950, youngsModulus: 370, tensileStrength: 300, yieldStrength: 300, thermalExpansion: 8.1, thermalConductivity: 30, costPerKg: 25.0 },
  { id: 'sic', name: 'Silicon Carbide', category: 'Ceramics', density: 3210, youngsModulus: 410, tensileStrength: 450, yieldStrength: 450, thermalExpansion: 4.0, thermalConductivity: 120, costPerKg: 80.0 },
  { id: 'sin', name: 'Silicon Nitride', category: 'Ceramics', density: 3440, youngsModulus: 310, tensileStrength: 800, yieldStrength: 800, thermalExpansion: 3.3, thermalConductivity: 30, costPerKg: 120.0 },
  { id: 'zro2', name: 'Zirconia (YSZ)', category: 'Ceramics', density: 6050, youngsModulus: 210, tensileStrength: 900, yieldStrength: 900, thermalExpansion: 10.3, thermalConductivity: 2.2, costPerKg: 150.0 },
  { id: 'tungsten_carbide', name: 'Tungsten Carbide', category: 'Ceramics', density: 15600, youngsModulus: 600, tensileStrength: 340, yieldStrength: 340, thermalExpansion: 5.2, thermalConductivity: 110, costPerKg: 65.0 },
  { id: 'boron_carbide', name: 'Boron Carbide', category: 'Ceramics', density: 2520, youngsModulus: 450, tensileStrength: 350, yieldStrength: 350, thermalExpansion: 5.0, thermalConductivity: 35, costPerKg: 210.0 },
  
  // --- Composites ---
  { id: 'cfep_prepreg', name: 'Carbon Fiber Prepreg (UD)', category: 'Composites', density: 1600, youngsModulus: 150, tensileStrength: 2500, yieldStrength: 2500, thermalExpansion: 0.1, thermalConductivity: 6.0, costPerKg: 120.0 },
  { id: 'gfep_mat', name: 'Fiberglass (E-Glass)', category: 'Composites', density: 1900, youngsModulus: 45, tensileStrength: 1000, yieldStrength: 1000, thermalExpansion: 5.0, thermalConductivity: 0.4, costPerKg: 15.0 },
  { id: 'kevlar', name: 'Kevlar 49 / Epoxy', category: 'Composites', density: 1440, youngsModulus: 75, tensileStrength: 1500, yieldStrength: 1500, thermalExpansion: -2.0, thermalConductivity: 0.3, costPerKg: 85.0 },
  { id: 'glass_reinforced_nylon', name: 'Nylon 6 (30% GF)', category: 'Composites', density: 1350, youngsModulus: 9.5, tensileStrength: 160, yieldStrength: 140, thermalExpansion: 30.0, thermalConductivity: 0.28, costPerKg: 4.5 },
  
  // --- Exotics & Aerospace ---
  { id: 'graphene_film', name: 'Graphene Nano-Platelets', category: 'Exotic', density: 2100, youngsModulus: 1000, tensileStrength: 5000, yieldStrength: 5000, thermalExpansion: -1.0, thermalConductivity: 3000, costPerKg: 5000.0 },
  { id: 'bulk_glass', name: 'Vitreloy 1 (Amorphous)', category: 'Exotic', density: 6700, youngsModulus: 95, tensileStrength: 1900, yieldStrength: 1800, thermalExpansion: 9.0, thermalConductivity: 6.0, costPerKg: 250.0 },
  { id: 'bio_silk', name: 'Recombinant Spider Silk', category: 'Exotic', density: 1300, youngsModulus: 15, tensileStrength: 1100, yieldStrength: 800, thermalExpansion: 1.0, thermalConductivity: 0.2, costPerKg: 1200.0 },
  { id: 'aerogel', name: 'Silica Aerogel', category: 'Exotic', density: 2, youngsModulus: 0.001, tensileStrength: 0.01, yieldStrength: 0.005, thermalExpansion: 3.0, thermalConductivity: 0.015, costPerKg: 3000.0 },
  { id: 'cobalt_chrome', name: 'Cobalt-Chrome (F75)', category: 'Exotic', density: 8300, youngsModulus: 240, tensileStrength: 655, yieldStrength: 450, thermalExpansion: 12.0, thermalConductivity: 14.8, costPerKg: 85.0 },
  { id: 'maraging_steel', name: 'Maraging Steel 300', category: 'Exotic', density: 8100, youngsModulus: 190, tensileStrength: 2000, yieldStrength: 1900, thermalExpansion: 10.1, thermalConductivity: 25.5, costPerKg: 45.0 },
  { id: 'niobium_alloy', name: 'Niobium C-103', category: 'Exotic', density: 8850, youngsModulus: 90, tensileStrength: 450, yieldStrength: 350, thermalExpansion: 7.1, thermalConductivity: 42.0, costPerKg: 350.0 },
  { id: 'tantalum', name: 'Pure Tantalum', category: 'Exotic', density: 16650, youngsModulus: 185, tensileStrength: 200, yieldStrength: 140, thermalExpansion: 6.3, thermalConductivity: 57.0, costPerKg: 400.0 },
  { id: 'gold_24k', name: 'Gold 24K', category: 'Exotic', density: 19300, youngsModulus: 78, tensileStrength: 120, yieldStrength: 20, thermalExpansion: 14.2, thermalConductivity: 318, costPerKg: 65000.0 },
  { id: 'silver_sterling', name: 'Sterling Silver', category: 'Exotic', density: 10400, youngsModulus: 83, tensileStrength: 310, yieldStrength: 170, thermalExpansion: 18.9, thermalConductivity: 429, costPerKg: 800.0 },
  { id: 'shape_memory_niti', name: 'Nitinol (Shape Memory)', category: 'Exotic', density: 6450, youngsModulus: 75, tensileStrength: 800, yieldStrength: 200, thermalExpansion: 11.0, thermalConductivity: 18.0, costPerKg: 500.0 },
  { id: 'beryllium_copper', name: 'Beryllium Copper', category: 'Exotic', density: 8250, youngsModulus: 130, tensileStrength: 1280, yieldStrength: 965, thermalExpansion: 17.5, thermalConductivity: 105, costPerKg: 95.0 },
  { id: 'invall_36', name: 'Invar 36 (Low Expansion)', category: 'Exotic', density: 8100, youngsModulus: 141, tensileStrength: 490, yieldStrength: 240, thermalExpansion: 1.2, thermalConductivity: 10.1, costPerKg: 25.0 },
  { id: 'liquid_gallium', name: 'Liquid Gallium (Room Temp)', category: 'Exotic', density: 5910, youngsModulus: 0.1, tensileStrength: 0.1, yieldStrength: 0.05, thermalExpansion: 58.0, thermalConductivity: 29.0, costPerKg: 450.0 },
  { id: 'hastelloy_c276', name: 'Hastelloy C-276', category: 'Exotic', density: 8890, youngsModulus: 205, tensileStrength: 790, yieldStrength: 355, thermalExpansion: 11.2, thermalConductivity: 10.2, costPerKg: 65.0 },
  { id: 'zirconium_alloy', name: 'Zircaloy-4 (Nuclear)', category: 'Exotic', density: 6560, youngsModulus: 99, tensileStrength: 450, yieldStrength: 310, thermalExpansion: 6.0, thermalConductivity: 21.5, costPerKg: 120.0 },
  { id: 'platinum', name: 'Pure Platinum', category: 'Exotic', density: 21450, youngsModulus: 168, tensileStrength: 125, yieldStrength: 20, thermalExpansion: 8.8, thermalConductivity: 71.6, costPerKg: 32000.0 },
  { id: 'rhodium', name: 'Pure Rhodium', category: 'Exotic', density: 12410, youngsModulus: 379, tensileStrength: 700, yieldStrength: 600, thermalExpansion: 8.2, thermalConductivity: 150, costPerKg: 145000.0 },
];
