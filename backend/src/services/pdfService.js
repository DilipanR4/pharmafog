const PDFDocument = require('pdfkit');

class PDFService {
  static generateAssessmentPDF(assessment, stream) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(stream);

    // Header Branding
    doc.rect(40, 40, 515, 60).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('PHARMAFOG', 55, 52);
    doc.fontSize(10).font('Helvetica').text('Clinical Polypharmacy & Medication Safety Platform', 55, 78);
    doc.fillColor('#38bdf8').fontSize(9).font('Helvetica-Bold').text('CLINICAL DECISION SUPPORT REPORT', 330, 65, { align: 'right' });

    doc.moveDown(3);
    doc.fillColor('#1e293b');

    // Assessment & Patient Info Grid
    const yTop = 115;
    doc.rect(40, yTop, 515, 80).strokeColor('#e2e8f0').lineWidth(1).stroke();
    doc.fillColor('#f8fafc').rect(40, yTop, 515, 20).fill();

    doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold').text('PATIENT & ASSESSMENT SPECIFICATIONS', 50, yTop + 5);

    const p = assessment.patientSnapshot || {};
    doc.fillColor('#475569').fontSize(9).font('Helvetica');
    doc.text(`Patient Name: ${p.fullName || 'N/A'}`, 50, yTop + 28);
    doc.text(`Patient ID: ${p.patientId || 'N/A'}`, 50, yTop + 43);
    doc.text(`Age / Sex: ${p.age || 'N/A'} yrs / ${p.sex || 'N/A'}`, 50, yTop + 58);

    doc.text(`Assessment ID: ${assessment.assessmentId || 'N/A'}`, 260, yTop + 28);
    doc.text(`Date & Time: ${new Date(assessment.createdAt || Date.now()).toLocaleString()}`, 260, yTop + 43);
    doc.text(`Recorded Allergies: ${(p.allergies && p.allergies.length) ? p.allergies.join(', ') : 'None documented'}`, 260, yTop + 58);

    // Risk Classification Banner
    const risk = assessment.riskAnalysis || {};
    const riskY = 205;
    const bannerColor = risk.riskLevel === 'High Risk' ? '#fee2e2' : risk.riskLevel === 'Moderate Risk' ? '#fef3c7' : '#ccfbf1';
    const textColor = risk.riskLevel === 'High Risk' ? '#991b1b' : risk.riskLevel === 'Moderate Risk' ? '#92400e' : '#115e59';

    doc.rect(40, riskY, 515, 45).fill(bannerColor);
    doc.fillColor(textColor).fontSize(14).font('Helvetica-Bold')
      .text(`RISK CLASSIFICATION: ${risk.riskLevel || 'EVALUATED'} (Risk Score: ${risk.score || 0} / 100)`, 50, riskY + 10);
    doc.fontSize(8.5).font('Helvetica').text(risk.summaryStatement || 'Clinical review recommended.', 50, riskY + 28);

    // Active Medications Section
    let currentY = 260;
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('ACTIVE MEDICATION PROFILE ANALYZED', 40, currentY);
    currentY += 16;

    // Table Header
    doc.rect(40, currentY, 515, 18).fill('#f1f5f9');
    doc.fillColor('#475569').fontSize(8.5).font('Helvetica-Bold');
    doc.text('Medication', 48, currentY + 5);
    doc.text('Dosage / Route', 210, currentY + 5);
    doc.text('Frequency', 340, currentY + 5);
    doc.text('Drug Class', 430, currentY + 5);
    currentY += 20;

    const meds = assessment.medicationsSnapshot || [];
    doc.font('Helvetica').fontSize(8);
    meds.forEach(m => {
      doc.fillColor('#1e293b').text(m.genericName || 'Unknown', 48, currentY);
      doc.fillColor('#64748b').text(`${m.dosage || ''} (${m.route || 'Oral'})`, 210, currentY);
      doc.text(m.frequency || '', 340, currentY);
      doc.text(m.drugClass || 'General', 430, currentY, { width: 120 });
      currentY += 15;
    });

    currentY += 10;

    // Detected Interactions Section
    const ddilist = assessment.interactionsDetected || [];
    if (ddilist.length > 0) {
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(`POTENTIAL DRUG-DRUG INTERACTIONS (${ddilist.length} DETECTED)`, 40, currentY);
      currentY += 16;

      ddilist.slice(0, 4).forEach(item => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 40;
        }
        const sevColor = item.severity === 'Major' ? '#dc2626' : '#d97706';
        doc.rect(40, currentY, 515, 36).strokeColor('#e2e8f0').stroke();
        doc.fillColor(sevColor).fontSize(8.5).font('Helvetica-Bold')
          .text(`[${item.severity.toUpperCase()}] ${item.medicationA || item.medication_a} + ${item.medicationB || item.medication_b}`, 48, currentY + 4);
        doc.fillColor('#334155').fontSize(7.5).font('Helvetica')
          .text(`Clinical Concern: ${item.clinicalEffect || item.clinical_effect || 'Adverse interaction'}`, 48, currentY + 16, { width: 495 });
        doc.fillColor('#0284c7').fontSize(7)
          .text(`Reference: ${item.source || 'PharmaFog Verified Reference'} (${item.referenceStatus || 'Verified'})`, 48, currentY + 26);
        currentY += 42;
      });
    }

    // Duplicate Medications Section
    const dups = assessment.duplicatesDetected || [];
    if (dups.length > 0) {
      if (currentY > 700) {
        doc.addPage();
        currentY = 40;
      }
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(`DUPLICATE MEDICATION ALERTS (${dups.length})`, 40, currentY);
      currentY += 16;
      dups.forEach(d => {
        doc.rect(40, currentY, 515, 26).fill('#fffbeb');
        doc.fillColor('#b45309').fontSize(8).font('Helvetica-Bold')
          .text(`${d.type}: ${(d.medications || []).join(' & ')}`, 48, currentY + 4);
        doc.fillColor('#78350f').fontSize(7.5).font('Helvetica')
          .text(d.description || '', 48, currentY + 14, { width: 495 });
        currentY += 32;
      });
    }

    // Clinician Checklist Section
    const chk = assessment.clinicianChecklist || [];
    if (chk.length > 0) {
      if (currentY > 700) {
        doc.addPage();
        currentY = 40;
      }
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('CLINICIAN REVIEW CHECKLIST', 40, currentY);
      currentY += 16;
      chk.slice(0, 4).forEach(item => {
        doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(`[ ] ${item.action}`, 48, currentY);
        doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text(`Priority: ${item.priority} | ${item.rationale}`, 62, currentY + 10, { width: 480 });
        currentY += 24;
      });
    }

    // Mandatory Regulatory & Safety Disclaimer
    doc.rect(40, 750, 515, 45).fill('#f8fafc');
    doc.fillColor('#64748b').fontSize(7).font('Helvetica')
      .text('IMPORTANT CLINICAL DECISION SUPPORT NOTICE: This document was produced by PharmaFog, an AI-powered polypharmacy detection platform designed for decision-support assistance only. This system does NOT make autonomous diagnoses, prescribe treatments, or recommend medication alterations without qualified physician or pharmacist evaluation.', 48, 755, { width: 495 });

    doc.end();
  }
}

module.exports = PDFService;
