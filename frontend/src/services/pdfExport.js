import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportAssessmentPDF = (assessment) => {
  if (!assessment) return;

  const doc = new jsPDF();
  const p = assessment.patientSnapshot || {};
  const risk = assessment.riskAnalysis || {};

  // Header Banner
  doc.setFillColor(15, 23, 42); // Deep navy
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PHARMAFOG', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Powered Polypharmacy Detection & Medication Safety Platform', 14, 25);

  doc.setTextColor(56, 189, 248);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL DECISION SUPPORT REPORT', 196, 20, { align: 'right' });

  // Patient Info Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 30, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Patient: ${p.fullName || 'N/A'} (ID: ${p.patientId || 'N/A'})`, 20, 46);
  doc.text(`Assessment ID: ${assessment.assessmentId || 'N/A'}`, 120, 46);

  doc.setFont('helvetica', 'normal');
  doc.text(`Age / Sex: ${p.age || 'N/A'} yrs / ${p.sex || 'N/A'} | Weight: ${p.weight ? p.weight + ' kg' : 'N/A'}`, 20, 54);
  doc.text(`Date: ${new Date(assessment.createdAt || Date.now()).toLocaleDateString()}`, 120, 54);

  doc.text(`Allergies: ${(p.allergies && p.allergies.length) ? p.allergies.join(', ') : 'None documented'}`, 20, 62);
  doc.text(`Conditions: ${(p.conditions && p.conditions.length) ? p.conditions.join(', ') : 'None documented'}`, 120, 62);

  // Risk Classification Banner
  let riskBg = [204, 251, 241];
  let riskText = [17, 94, 89];
  if (risk.riskLevel === 'High Risk') {
    riskBg = [254, 226, 226];
    riskText = [153, 27, 27];
  } else if (risk.riskLevel === 'Moderate Risk') {
    riskBg = [254, 243, 199];
    riskText = [146, 64, 14];
  }

  doc.setFillColor(riskBg[0], riskBg[1], riskBg[2]);
  doc.roundedRect(14, 72, 182, 20, 2, 2, 'F');

  doc.setTextColor(riskText[0], riskText[1], riskText[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`OVERALL RISK LEVEL: ${(risk.riskLevel || 'EVALUATED').toUpperCase()} (Score: ${risk.score || 0}/100)`, 20, 81);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(risk.summaryStatement || 'Clinical review recommended before dispensing or modifying therapy.', 20, 87, { maxWidth: 170 });

  // Active Medications Table
  const meds = assessment.medicationsSnapshot || [];
  const medRows = meds.map(m => [
    m.genericName || 'N/A',
    m.dosage || 'N/A',
    m.frequency || 'N/A',
    m.route || 'Oral',
    m.drugClass || 'General'
  ]);

  autoTable(doc, {
    startY: 96,
    head: [['Medication', 'Dosage', 'Frequency', 'Route', 'Drug Class']],
    body: medRows,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    margin: { left: 14, right: 14 }
  });

  let currentY = doc.lastAutoTable.finalY + 8;

  // Potential Interactions Table
  const ddilist = assessment.interactionsDetected || [];
  if (ddilist.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Identified Drug-Drug Interactions (${ddilist.length})`, 14, currentY);
    currentY += 4;

    const ddiRows = ddilist.map(i => [
      `${i.medicationA || i.medication_a} + ${i.medicationB || i.medication_b}`,
      i.severity,
      i.clinicalEffect || i.clinical_effect || i.mechanism || 'Potential interaction',
      i.recommendation || 'Consult clinician'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Interacting Pair', 'Severity', 'Clinical Concern', 'Recommendation']],
      body: ddiRows,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 22 },
        2: { cellWidth: 60 },
        3: { cellWidth: 60 }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // Clinician Checklist Table
  const checklist = assessment.clinicianChecklist || [];
  if (checklist.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Clinician Review Checklist', 14, currentY);
    currentY += 4;

    const chkRows = checklist.map(c => [
      c.completed ? '[DONE]' : '[PENDING]',
      c.priority || 'Standard',
      c.action,
      c.rationale
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Status', 'Priority', 'Action Item', 'Clinical Rationale']],
      body: chkRows,
      theme: 'plain',
      headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 70 },
        3: { cellWidth: 72 }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // Mandatory Safety Disclaimer at bottom of last page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, pageHeight - 24, 182, 18, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'IMPORTANT SAFETY NOTICE: PharmaFog is a clinical decision-support prototype, NOT an autonomous diagnostic or prescribing system. All medication adjustments, tapering, or continuations require review by a licensed healthcare practitioner. Verified against structured demo reference databases.',
    16,
    pageHeight - 18,
    { maxWidth: 178 }
  );

  doc.save(`PharmaFog_Assessment_${assessment.assessmentId || 'Report'}.pdf`);
};
