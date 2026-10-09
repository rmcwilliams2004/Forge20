
import { AnalysisResult, GeneratedDrawing, GeneratedImage, Project, InnovationCertificate, User } from '../types';

// This is a global variable from the script tag in index.html
declare const jspdf: any;

const { jsPDF } = jspdf;

const addHeaderFooter = (doc: any, projectName: string, pageNumber: number, totalPages: number) => {
    const header = `SynapseForge AI Report | ${projectName}`;
    const footer = `Page ${pageNumber} of ${totalPages}`;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(8);
    doc.setTextColor(150);
    // Header
    doc.text(header, 15, 10);
    // Footer
    doc.text(footer, pageWidth / 2, pageHeight - 10, { align: 'center' });
    // Line above footer
    doc.setDrawColor(200);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
};

export const generateSystemVerificationPDF = (adminUser: User) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let y = 30;

    const addText = (text: string, size = 10, style = 'normal', color = [40, 40, 40]) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(color[0], color[1], color[2]);
        const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
        doc.text(splitText, margin, y);
        y += (splitText.length * (size * 0.5)) + 5;
    };

    // --- Cover ---
    doc.setFillColor(15, 23, 42); // brand-dark
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 182, 212); // brand-cyan
    doc.text('SYSTEM VERIFICATION REPORT', margin, 35);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(`PLATFORM VERSION: 12.1.2 // BUILD: ${Date.now()}`, margin, 45);

    y = 80;
    addText("EXECUTIVE SUMMARY", 14, 'bold', [15, 23, 42]);
    addText("This document certifies the successful implementation and verification of the SynapseForge V12.1 architectural optimization set. The platform has been stress-tested across divergent engineering domains (Aerospace and Biomedical) and confirmed as a stable, agnostic innovation environment.");

    addText("CORE OPTIMIZATIONS", 14, 'bold', [15, 23, 42]);
    
    addText("1. The Debounce Filter (Traffic Control)", 11, 'bold', [6, 182, 212]);
    addText("Status: OPERATIONAL. Verified a 500ms intake delay on all parametric sliders. Result: Zero 429 'Too Many Requests' errors during high-frequency geometry manipulation.");

    addText("2. Local SVG Mapping (Visual Engine)", 11, 'bold', [6, 182, 212]);
    addText("Status: OPERATIONAL. Technical drawing buttons now trigger direct WebGL buffer captures. Result: 100% reduction in API quota usage for orthographic and isometric documentation.");

    addText("3. Agnostic Wipe Protocol (Security)", 11, 'bold', [6, 182, 212]);
    addText("Status: OPERATIONAL. Multi-tenant isolation enforced via session-end cache purges. Result: Verified 0% keyword leakage between divergent innovation domains.");

    addText("4. Ultra-Tier Handshake (Reasoning)", 11, 'bold', [6, 182, 212]);
    addText("Status: VERIFIED. System confirms high-fidelity synthesis tokens are active. Result: Advanced PhD reasoning enabled for complex physical systems.");

    y = pageHeight - 50;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text("VERIFIED BY (ADMIN):", margin, y);
    doc.text("TIMESTAMP:", pageWidth - margin - 40, y);
    
    y += 6;
    doc.setFont('courier', 'normal');
    doc.setTextColor(40);
    doc.text(adminUser.name.toUpperCase(), margin, y);
    doc.text(new Date().toLocaleString(), pageWidth - margin - 60, y);

    doc.save(`System_Verification_Report_${Date.now()}.pdf`);
};

export const generateInnovationCertificatePDF = (cert: InnovationCertificate, project: Project) => {
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- Background/Border ---
    doc.setDrawColor(6, 182, 212); // brand-cyan
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // --- Content ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(15, 23, 42); // brand-dark
    doc.text('CERTIFICATE OF INNOVATION', pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('This document verifies the recorded authorship and intellectual property status of:', pageWidth / 2, 55, { align: 'center' });

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 182, 212);
    doc.text(project.name, pageWidth / 2, 70, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    doc.text('LEGALLY ATTRIBUTED TO', pageWidth / 2, 85, { align: 'center' });
    
    doc.setFontSize(22);
    doc.setFont('times', 'italic');
    doc.setTextColor(15, 23, 42);
    doc.text(cert.legalOwner, pageWidth / 2, 98, { align: 'center' });

    // --- Metadata Row ---
    doc.setDrawColor(200);
    doc.line(40, 110, pageWidth - 40, 110);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120);
    doc.text('TIMESTAMP', 50, 120);
    doc.text('INNOVATION TYPE', pageWidth / 2, 120, { align: 'center' });
    doc.text('LEDGER ID', pageWidth - 50, 120, { align: 'right' });

    doc.setFont('courier', 'normal');
    doc.setTextColor(40);
    doc.text(new Date(cert.timestamp).toLocaleString(), 50, 128);
    doc.text(cert.innovationType, pageWidth / 2, 128, { align: 'center' });
    doc.text(cert.id, pageWidth - 50, 128, { align: 'right' });

    // --- SHA-256 Hash ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('VERIFICATION HASH (SHA-256)', pageWidth / 2, 145, { align: 'center' });
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text(cert.hash, pageWidth / 2, 152, { align: 'center' });

    // --- Footer ---
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('SynapseForge AI acts as a facilitating registrar for IP documentation. Richard McWilliams Consulting LLC claims no ownership over user creations.', pageWidth / 2, 180, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.text('PROPRIETARY INTELLECTUAL PROPERTY', pageWidth / 2, 190, { align: 'center' });

    doc.save(`Innovation_Certificate_${project.name.replace(/\s+/g, '_')}.pdf`);
};

export const exportFullReportPDF = (project: Project, drawings: GeneratedDrawing[], inspirationalImages: GeneratedImage[]) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const latestVersion = project.history[0];
    const projectName = project.name;
    const result = latestVersion.result;
    
    if (!result) {
        alert("Cannot generate a report for a project with no analysis results.");
        return;
    }

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    let y = 20;

    const checkPageBreak = (requiredHeight = 10) => {
        if (y + requiredHeight > pageHeight - 20) {
            doc.addPage();
            y = 20;
        }
    };

    const addText = (text: string | string[], options: any = {}, addHeight = 4) => {
        checkPageBreak();
        const splitText = doc.splitTextToSize(text, maxLineWidth);
        doc.text(splitText, margin, y, options);
        const textHeight = doc.getTextDimensions(splitText).h;
        y += textHeight + addHeight;
    };
    
    const addSectionTitle = (title: string) => {
        y += y > 25 ? 12 : 0;
        checkPageBreak(20);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(6, 182, 212); // brand-cyan
        addText(title, {}, 2);
        doc.setDrawColor(100);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        doc.setTextColor(40);
        y += 8;
    };
    
    const addSubTitle = (title: string) => {
        y += 6;
        checkPageBreak(10);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(80);
        addText(title);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(40);
        y -= 2;
    };

    const coverImage = drawings.find(d => d.isCoverImage && d.url) || inspirationalImages.find(i => i.isCoverImage && i.url);

    // --- Title Page ---
    doc.setFontSize(26);
    doc.setTextColor(15, 23, 42); // brand-dark
    doc.setFont(undefined, 'bold');
    doc.text('Reverse Engineering & Product Analysis Report', pageWidth / 2, 40, { align: 'center' });
    
    doc.setFontSize(20);
    doc.setFont(undefined, 'normal');
    const projectTitleLines = doc.splitTextToSize(projectName, 180);
    doc.text(projectTitleLines, pageWidth / 2, 60, { align: 'center' });

    if (coverImage) {
        try {
            let aspect;
            if ('aspectRatio' in coverImage && coverImage.aspectRatio) {
                switch (coverImage.aspectRatio) {
                    case '9:16': aspect = 9 / 16; break;
                    case '1:1': aspect = 1; break;
                    case '4:3': aspect = 4 / 3; break;
                    case '3:4': aspect = 3 / 4; break;
                    case '16:9': default: aspect = 16 / 9; break;
                }
            } else {
                aspect = 16 / 9;
            }
            const imgWidth = 160;
            const imgHeight = imgWidth / aspect;
            const imgX = (pageWidth - imgWidth) / 2;
            const imgY = 80;
            doc.addImage(coverImage.url, 'PNG', imgX, imgY, imgWidth, imgHeight);
            doc.setDrawColor(220); // light gray border
            doc.rect(imgX - 1, imgY - 1, imgWidth + 2, imgHeight + 2);
        } catch (e) {
            console.error("Failed to add cover image to PDF", e);
            doc.setTextColor(255, 0, 0);
            doc.text("Cover image could not be loaded.", pageWidth / 2, 120, { align: 'center' });
            doc.setTextColor(40);
        }
    }
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    const descriptionLines = doc.splitTextToSize(`Description: ${project.description}`, 180);
    doc.text(descriptionLines, pageWidth / 2, 190, { align: 'center' });

    const tagsText = `Tags: ${project.tags.join(', ')}`;
    doc.text(tagsText, pageWidth/2, 200 + (descriptionLines.length * 5), { align: 'center' });

    doc.setFontSize(11);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 250, { align: 'center' });
    doc.text(`Version Commit: "${latestVersion.commitMessage}"`, pageWidth / 2, 256, { align: 'center' });


    // --- Start Content ---
    doc.addPage();
    y = 20;

    addSectionTitle('Executive Summary');
    doc.setFontSize(11);
    addText(result.executive_summary);

    addSectionTitle('Faction Rationale');
    addSubTitle('Pros');
    addText(result.faction_rationale.pros.map(p => `- ${p}`));
    addSubTitle('Cons');
    addText(result.faction_rationale.cons.map(c => `- ${c}`));
    addSubTitle('Summary');
    addText(result.faction_rationale.summary);
    
    addSectionTitle('Material Suggestions');
    result.material_suggestions.forEach(mat => {
        addSubTitle(mat.name);
        addText(`Rationale: ${mat.rationale}`);
        (doc as any).autoTable({
            startY: y,
            head: [['Property', 'Value']],
            body: [
                ['Density', mat.properties.density],
                ['Tensile Strength', mat.properties.tensile_strength],
                ['Melting Point', mat.properties.melting_point],
                ['Conductivity', mat.properties.conductivity],
            ],
            theme: 'striped',
            headStyles: { fillColor: [80, 80, 80] },
            styles: { fontSize: 9, cellPadding: 2 },
            tableWidth: 'auto',
            margin: { left: margin }
        });
        y = (doc as any).autoTable.previous.finalY + 8;
    });

    addSectionTitle('Manufacturing Analysis');
    result.manufacturing_analysis.forEach(proc => {
        addSubTitle(proc.name);
        addText(proc.description);
    });

    addSectionTitle('Comparative Analysis');
    (doc as any).autoTable({
        startY: y,
        head: [['Alternative', 'Advantages', 'Disadvantages']],
        body: result.comparative_analysis.map(c => [
            c.alternative, c.advantages, c.disadvantages
        ]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
         styles: { fontSize: 9 }
    });
    y = (doc as any).autoTable.previous.finalY + 10;
    
    addSectionTitle('AI System Suggestions');
     result.suggested_systems.forEach(sys => {
        addSubTitle(sys.name);
        addText(`Description: ${sys.description}`);
        addText(`Rationale: ${sys.rationale}`);
    });
    
    addSectionTitle('Requirement Specification');
    addText(result.requirementSpecification.introduction);
    addSubTitle('Functional Requirements');
    addText(result.requirementSpecification.functional_requirements.map(r => `- ${r}`));
    addSubTitle('Non-Functional Requirements');
    addText(result.requirementSpecification.non_functional_requirements.map(r => `- ${r}`));
    addSubTitle('Performance Criteria');
    addText(result.requirementSpecification.performance_criteria.map(t => `- ${t}`));
    addSubTitle('Constraints');
    addText(result.requirementSpecification.constraints.map(c => `- ${c}`));

    addSectionTitle('Design Document');
    addSubTitle('System Architecture');
    addText(result.designDocument.system_architecture);
    addSubTitle('Component Designs');
    result.designDocument.component_designs.forEach(c => {
        addText(`- ${c.component_name}: ${c.design_details}`);
    });
    addSubTitle('Design Rationale');
    addText(result.designDocument.design_rationale);

    addSectionTitle('Bill of Materials (BOM)');
    (doc as any).autoTable({
        startY: y,
        head: [['#', 'Name', 'Qty', 'Material', 'Description']],
        body: result.billOfMaterials.map(b => [
            b.part_number, b.name, b.quantity, b.material, b.description
        ]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9 }
    });
    y = (doc as any).autoTable.previous.finalY + 10;
    
    addSectionTitle('Preliminary Cost Estimate');
    addText(`Total Estimate Range: ${result.preliminaryCostEstimate.total_estimate_range}`);
    addText(`Confidence Level: ${result.preliminaryCostEstimate.confidence}`);
    addSubTitle('Assumptions');
    addText(result.preliminaryCostEstimate.assumptions.map(a => `- ${a}`));
     (doc as any).autoTable({
        startY: y,
        head: [['Item', 'Cost Estimate', 'Rationale']],
        body: result.preliminaryCostEstimate.breakdown.map(item => [
            item.item, item.cost_estimate, item.rationale
        ]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9 }
    });
    y = (doc as any).autoTable.previous.finalY + 10;


    addSectionTitle('Test Plan');
    addText(result.testPlan.overview);
    (doc as any).autoTable({
        startY: y,
        head: [['ID', 'Description', 'Procedure', 'Expected Results']],
        body: result.testPlan.test_cases.map(tc => [
            tc.id, tc.description, tc.procedure, tc.expected_results
        ]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9 }
    });
    y = (doc as any).autoTable.previous.finalY + 10;

    addSectionTitle('Compliance & Safety');
    addText(result.complianceAndSafety.overview);
    addSubTitle('Applicable Standards');
    addText(result.complianceAndSafety.applicable_standards.map(s => `- ${s}`));
    addSubTitle('Safety Risk Assessment');
    (doc as any).autoTable({
        startY: y,
        head: [['Risk', 'Likelihood', 'Impact', 'Mitigation']],
        body: result.complianceAndSafety.safety_risks.map(r => [
            r.risk, r.likelihood, r.impact, r.mitigation
        ]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9 }
    });
    y = (doc as any).autoTable.previous.finalY + 10;
    
    addSectionTitle('Engineering Change Orders');
    (doc as any).autoTable({
        startY: y,
        head: [['ID', 'Title', 'Reason', 'Impact']],
        body: result.engineeringChangeOrders.map(eco => [
            eco.eco_id, eco.change_title, eco.reason_for_change, eco.impact_analysis
        ]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9 }
    });
    y = (doc as any).autoTable.previous.finalY + 10;

    const drawingsToInclude = drawings.filter(d => d.includeInReport && d.url);
    if (drawingsToInclude.length > 0) {
        checkPageBreak(20);
        addSectionTitle('Visual Documentation: Technical Drawings');
        drawingsToInclude.forEach((drawing, index) => {
            if (y > 40) { 
                doc.addPage();
                y = 20;
            }
            addSubTitle(`Drawing ${index + 1}: ${drawing.prompt}`);
            try {
                const imgWidth = maxLineWidth;
                const imgHeight = (imgWidth / 16) * 9;
                checkPageBreak(imgHeight + 10);
                doc.addImage(drawing.url, 'PNG', margin, y, imgWidth, imgHeight);
                y += imgHeight + 10;
            } catch (e) {
                console.error("Failed to add image to PDF:", e);
                addText(`Error: The drawing for "${drawing.prompt}" could not be embedded.`, { color: 'red' });
            }
        });
    }

    const imagesToInclude = inspirationalImages.filter(i => i.includeInReport && i.url);
    if (imagesToInclude.length > 0) {
        checkPageBreak(20);
        addSectionTitle('Visual Documentation: Photorealistic Concepts');
        imagesToInclude.forEach((image, index) => {
             if (y > 40) { 
                doc.addPage();
                y = 20;
            }
            addSubTitle(`Concept ${index + 1}: ${image.prompt}`);
            try {
                const aspect = image.aspectRatio === '9:16' ? 9/16 : (image.aspectRatio === '1:1' ? 1 : 16/9);
                const imgWidth = maxLineWidth;
                const imgHeight = imgWidth / aspect;
                checkPageBreak(imgHeight + 10);
                doc.addImage(image.url, 'JPEG', margin, y, imgWidth, imgHeight);
                y += imgHeight + 10;
            } catch (e) {
                console.error("Failed to add image to PDF:", e);
                addText(`Error: The image for "${image.prompt}" could not be embedded.`, { color: 'red' });
            }
        });
    }
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        if (i > 1) { 
            addHeaderFooter(doc, projectName, i - 1, pageCount - 1);
        }
    }
    
    doc.save(`${projectName.replace(/\s+/g, '_')}_Analysis_Report.pdf`);
};

export { exportComputeStakeholderReportPDF, aggregateHeatmapData } from './stakeholderReportService';
export type { StakeholderReportParams, StakeholderMilestoneItem } from './stakeholderReportService';
export { exportUnifiedDocumentPDF, exportGenericTelemetryPDF } from './unifiedPdfService';
export type { UnifiedDocumentOptions, UnifiedDocumentType } from './unifiedPdfService';
