import { generate } from '@pdfme/generator';
import { AnalysisResult, Project, User, PatentApplication } from '../types';

const USPTO_TEMPLATE = {
  basePdf: { width: 210, height: 297 },
  schemas: [
    {
      title: {
        type: 'text',
        position: { x: 20, y: 20 },
        width: 170,
        height: 15,
        fontSize: 24,
        fontWeight: 'bold',
        fontColor: '#1f2937',
      },
      abstract_label: {
        type: 'text',
        position: { x: 20, y: 40 },
        width: 170,
        height: 5,
        fontSize: 10,
        fontWeight: 'bold',
        fontColor: '#6b7280',
      },
      abstract: {
        type: 'text',
        position: { x: 20, y: 46 },
        width: 170,
        height: 40,
        fontSize: 11,
        fontColor: '#374151',
      },
      claims_label: {
        type: 'text',
        position: { x: 20, y: 95 },
        width: 170,
        height: 5,
        fontSize: 10,
        fontWeight: 'bold',
        fontColor: '#6b7280',
      },
      claims: {
        type: 'text',
        position: { x: 20, y: 101 },
        width: 170,
        height: 100,
        fontSize: 11,
        fontColor: '#374151',
      },
      ledger_id: {
        type: 'text',
        position: { x: 20, y: 260 },
        width: 80,
        height: 10,
        fontSize: 8,
        fontColor: '#9ca3af',
      },
      hash: {
        type: 'text',
        position: { x: 110, y: 260 },
        width: 80,
        height: 10,
        fontSize: 8,
        fontColor: '#9ca3af',
        alignment: 'right',
      }
    }
  ]
};

export const generateFormalPatentPDF = async (project: Project, patent: PatentApplication, designHash: string): Promise<Uint8Array> => {
  const inputs = [
    {
      title: patent.title,
      abstract_label: 'ABSTRACT',
      abstract: patent.abstract,
      claims_label: 'INDEPENDENT CLAIMS',
      claims: patent.independent_claims.map((c, i) => `${i + 1}. ${c.text}`).join('\n\n'),
      ledger_id: `LEDGER_ID: SYN-${project.id.slice(-8).toUpperCase()}`,
      hash: `FINGERPRINT: ${designHash.slice(0, 12)}...`
    }
  ];

  const pdf = await generate({ template: USPTO_TEMPLATE as any, inputs });
  return pdf;
};
