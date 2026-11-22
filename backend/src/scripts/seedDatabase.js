const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Patient = require('../models/Patient');
const Medication = require('../models/Medication');
const MedicationReference = require('../models/MedicationReference');
const DrugInteraction = require('../models/DrugInteraction');
const MedicationAssessment = require('../models/MedicationAssessment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const AIService = require('../services/aiService');

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pharmafog';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at', mongoUri);

    // Clear existing collections
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Medication.deleteMany({});
    await MedicationReference.deleteMany({});
    await DrugInteraction.deleteMany({});
    await MedicationAssessment.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('[Seed] Cleared existing database records.');

    // 1. Create Demo Users
    const doctor = await User.create({
      name: 'Dr. Alexander Thorne, MD',
      email: 'doctor@pharmafog.health',
      password: 'Doctor@123',
      role: 'Doctor',
      department: 'Cardiology & Internal Medicine',
      licenseNumber: 'MD-884129',
      active: true
    });

    const pharmacist = await User.create({
      name: 'Sarah Lin, PharmD',
      email: 'pharmacist@pharmafog.health',
      password: 'Pharmacist@123',
      role: 'Pharmacist',
      department: 'Clinical Pharmacology & Safety',
      licenseNumber: 'RPH-44102',
      active: true
    });

    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@pharmafog.health',
      password: 'Admin@123',
      role: 'Admin',
      department: 'Health Informatics & IT',
      licenseNumber: 'ADM-001',
      active: true
    });

    console.log('[Seed] Created demo users (Doctor, Pharmacist, Admin).');

    // 2. Load and Seed Reference Medications
    const medsFile = path.join(__dirname, '../../../ml-service/data/sample_medications.json');
    let medsData = [];
    if (fs.existsSync(medsFile)) {
      medsData = JSON.parse(fs.readFileSync(medsFile, 'utf-8'));
    }

    const insertedRefs = await MedicationReference.insertMany(
      medsData.map(m => ({
        referenceId: m.reference_id,
        genericName: m.generic_name,
        brandNames: m.brand_names,
        drugClass: m.drug_class,
        therapeuticCategory: m.therapeutic_category,
        activeIngredient: m.active_ingredient,
        commonUsage: m.common_usage,
        typicalDosage: m.typical_dosage,
        route: m.route,
        beersCriteria: m.beers_criteria,
        monitoringParameters: m.monitoring_parameters,
        isDemo: true
      }))
    );
    console.log(`[Seed] Seeded ${insertedRefs.length} medication reference entries.`);

    // 3. Load and Seed Drug Interactions
    const interFile = path.join(__dirname, '../../../ml-service/data/sample_interactions.json');
    let interData = [];
    if (fs.existsSync(interFile)) {
      interData = JSON.parse(fs.readFileSync(interFile, 'utf-8'));
    }

    const insertedInteractions = await DrugInteraction.insertMany(
      interData.map(i => ({
        medicationA: i.medication_a,
        medicationB: i.medication_b,
        severity: i.severity,
        mechanism: i.mechanism,
        clinicalEffect: i.clinical_effect,
        recommendation: i.recommendation,
        source: i.source,
        referenceStatus: i.reference_status,
        category: i.category
      }))
    );
    console.log(`[Seed] Seeded ${insertedInteractions.length} drug-drug interaction rules.`);

    // 4. Create Demo Patients
    const p1 = await Patient.create({
      patientId: 'PF-1001',
      fullName: 'Eleanor Vance',
      age: 74,
      sex: 'Female',
      weight: 62.5,
      allergies: ['Penicillin', 'Sulfa'],
      conditions: ['Atrial Fibrillation', 'Hypertension', 'Osteoarthritis', 'Heart Failure (Stage C)'],
      clinicalNotes: 'Elderly patient with multiple chronic conditions. Complains of occasional epistaxis and gastric discomfort. Evaluated for anticoagulation safety.',
      assignedDoctor: doctor._id,
      riskStatus: 'High Risk',
      isDemo: true
    });

    const p2 = await Patient.create({
      patientId: 'PF-1002',
      fullName: 'Arthur Pendelton',
      age: 68,
      sex: 'Male',
      weight: 84.0,
      allergies: [],
      conditions: ['Type 2 Diabetes Mellitus', 'Diabetic Peripheral Neuropathy', 'Major Depressive Disorder', 'GERD'],
      clinicalNotes: 'Under treatment for diabetic neuropathy and depression. Needs evaluation of central nervous system and metabolic burden.',
      assignedDoctor: doctor._id,
      riskStatus: 'Moderate Risk',
      isDemo: true
    });

    const p3 = await Patient.create({
      patientId: 'PF-1003',
      fullName: 'Margaret Chen',
      age: 61,
      sex: 'Female',
      weight: 58.0,
      allergies: ['Aspirin'],
      conditions: ['Hypercholesterolemia', 'Gastroesophageal Reflux Disease (GERD)', 'Mild Osteopenia'],
      clinicalNotes: 'Routine outpatient follow-up. Tolerating current maintenance regimen well without reported adverse events.',
      assignedDoctor: doctor._id,
      riskStatus: 'Low Risk',
      isDemo: true
    });

    const p4 = await Patient.create({
      patientId: 'PF-1004',
      fullName: 'Robert Davis',
      age: 82,
      sex: 'Male',
      weight: 76.5,
      allergies: [],
      conditions: ['Severe Chronic Insomnia', 'Generalized Anxiety Disorder', 'Bilateral Knee Osteoarthritis'],
      clinicalNotes: 'Experiencing daytime somnolence and unsteadiness. Family reports two near-falls in the past 60 days.',
      assignedDoctor: doctor._id,
      riskStatus: 'High Risk',
      isDemo: true
    });

    console.log('[Seed] Created 4 realistic clinical demo patients.');

    // 5. Seed Patient Medications
    // Eleanor Vance Medications:
    const m_p1_1 = await Medication.create({
      patient: p1._id,
      genericName: 'Warfarin',
      brandName: 'Coumadin',
      activeIngredient: 'Warfarin Sodium',
      drugClass: 'Vitamin K Antagonist / Anticoagulant',
      dosage: '4mg',
      frequency: 'Once daily at bedtime',
      route: 'Oral',
      duration: 'Indefinite',
      status: 'Active',
      prescribedBy: 'Dr. Alexander Thorne'
    });

    const m_p1_2 = await Medication.create({
      patient: p1._id,
      genericName: 'Aspirin',
      brandName: 'Bayer',
      activeIngredient: 'Acetylsalicylic Acid',
      drugClass: 'Antiplatelet / Salicylate',
      dosage: '81mg',
      frequency: 'Once daily with breakfast',
      route: 'Oral',
      duration: 'Ongoing',
      status: 'Active',
      prescribedBy: 'Dr. Alexander Thorne'
    });

    const m_p1_3 = await Medication.create({
      patient: p1._id,
      genericName: 'Lisinopril',
      brandName: 'Zestril',
      activeIngredient: 'Lisinopril',
      drugClass: 'ACE Inhibitor',
      dosage: '20mg',
      frequency: 'Once daily in the morning',
      route: 'Oral',
      duration: 'Ongoing',
      status: 'Active',
      prescribedBy: 'Dr. Alexander Thorne'
    });

    const m_p1_4 = await Medication.create({
      patient: p1._id,
      genericName: 'Spironolactone',
      brandName: 'Aldactone',
      activeIngredient: 'Spironolactone',
      drugClass: 'Aldosterone Receptor Antagonist',
      dosage: '25mg',
      frequency: 'Once daily in the morning',
      route: 'Oral',
      duration: 'Ongoing',
      status: 'Active',
      prescribedBy: 'Dr. Alexander Thorne'
    });

    const m_p1_5 = await Medication.create({
      patient: p1._id,
      genericName: 'Ibuprofen',
      brandName: 'Advil',
      activeIngredient: 'Ibuprofen',
      drugClass: 'NSAID',
      dosage: '400mg',
      frequency: 'Three times daily with meals',
      route: 'Oral',
      duration: '30 days',
      status: 'Active',
      prescribedBy: 'Urgent Care Physician'
    });

    // Arthur Pendelton Medications:
    await Medication.create([
      {
        patient: p2._id,
        genericName: 'Metformin',
        brandName: 'Glucophage',
        activeIngredient: 'Metformin Hydrochloride',
        drugClass: 'Biguanide',
        dosage: '1000mg',
        frequency: 'Twice daily with meals',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Dr. Alexander Thorne'
      },
      {
        patient: p2._id,
        genericName: 'Sertraline',
        brandName: 'Zoloft',
        activeIngredient: 'Sertraline Hydrochloride',
        drugClass: 'SSRI',
        dosage: '100mg',
        frequency: 'Once daily in the morning',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Psychiatry Outpatient'
      },
      {
        patient: p2._id,
        genericName: 'Tramadol',
        brandName: 'Ultram',
        activeIngredient: 'Tramadol Hydrochloride',
        drugClass: 'Opioid / SNRI Analgesic',
        dosage: '50mg',
        frequency: 'Every 6 hours as needed for severe neuropathic pain',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Pain Clinic'
      },
      {
        patient: p2._id,
        genericName: 'Gabapentin',
        brandName: 'Neurontin',
        activeIngredient: 'Gabapentin',
        drugClass: 'GABA Analog',
        dosage: '300mg',
        frequency: 'Three times daily',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Neurology'
      },
      {
        patient: p2._id,
        genericName: 'Omeprazole',
        brandName: 'Prilosec',
        activeIngredient: 'Omeprazole',
        drugClass: 'Proton Pump Inhibitor',
        dosage: '20mg',
        frequency: 'Once daily before breakfast',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Primary Care'
      }
    ]);

    // Margaret Chen Medications:
    await Medication.create([
      {
        patient: p3._id,
        genericName: 'Atorvastatin',
        brandName: 'Lipitor',
        activeIngredient: 'Atorvastatin Calcium',
        drugClass: 'HMG-CoA Reductase Inhibitor',
        dosage: '20mg',
        frequency: 'Once daily at bedtime',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Dr. Alexander Thorne'
      },
      {
        patient: p3._id,
        genericName: 'Pantoprazole',
        brandName: 'Protonix',
        activeIngredient: 'Pantoprazole Sodium',
        drugClass: 'Proton Pump Inhibitor',
        dosage: '40mg',
        frequency: 'Once daily before breakfast',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Gastroenterology'
      },
      {
        patient: p3._id,
        genericName: 'Acetaminophen',
        brandName: 'Tylenol',
        activeIngredient: 'Paracetamol',
        drugClass: 'Analgesic',
        dosage: '500mg',
        frequency: 'As needed for headache (max 2g/day)',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Self / OTC'
      }
    ]);

    // Robert Davis Medications (Sedatives + Duplicated NSAIDs):
    await Medication.create([
      {
        patient: p4._id,
        genericName: 'Lorazepam',
        brandName: 'Ativan',
        activeIngredient: 'Lorazepam',
        drugClass: 'Benzodiazepine',
        dosage: '1mg',
        frequency: 'Once daily at bedtime',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Primary Care'
      },
      {
        patient: p4._id,
        genericName: 'Zolpidem',
        brandName: 'Ambien',
        activeIngredient: 'Zolpidem Tartrate',
        drugClass: 'Sedative-Hypnotic',
        dosage: '5mg',
        frequency: 'Once daily at bedtime as needed',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Sleep Clinic'
      },
      {
        patient: p4._id,
        genericName: 'Ibuprofen',
        brandName: 'Advil',
        activeIngredient: 'Ibuprofen',
        drugClass: 'NSAID',
        dosage: '400mg',
        frequency: 'Twice daily',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Orthopedics'
      },
      {
        patient: p4._id,
        genericName: 'Naproxen',
        brandName: 'Aleve',
        activeIngredient: 'Naproxen Sodium',
        drugClass: 'NSAID',
        dosage: '220mg',
        frequency: 'Once daily in the morning',
        route: 'Oral',
        status: 'Active',
        prescribedBy: 'Self / OTC'
      }
    ]);

    console.log('[Seed] Seeded medications for all demo patients.');

    // 6. Generate and Seed Initial Assessments
    // Eleanor Vance initial assessment
    const p1Meds = [m_p1_1, m_p1_2, m_p1_3, m_p1_4, m_p1_5];
    const p1Analysis = await AIService.analyzeMedications(p1, p1Meds);

    const asm1 = await MedicationAssessment.create({
      assessmentId: 'PF-ASM-2026-0001',
      patient: p1._id,
      patientSnapshot: {
        patientId: p1.patientId,
        fullName: p1.fullName,
        age: p1.age,
        sex: p1.sex,
        weight: p1.weight,
        allergies: p1.allergies,
        conditions: p1.conditions
      },
      medicationsSnapshot: p1Meds.map(m => ({
        genericName: m.genericName,
        brandName: m.brandName,
        dosage: m.dosage,
        frequency: m.frequency,
        route: m.route,
        drugClass: m.drugClass,
        status: m.status
      })),
      interactionsDetected: (p1Analysis.interactions || []).map((i, idx) => ({
        id: i.id || `DDI-${idx + 1}`,
        medicationA: i.medicationA || i.medication_a,
        medicationB: i.medicationB || i.medication_b,
        severity: i.severity,
        mechanism: i.mechanism,
        clinicalEffect: i.clinicalEffect || i.clinical_effect,
        recommendation: i.recommendation,
        source: i.source,
        referenceStatus: i.referenceStatus || 'Verified Clinical Reference',
        category: i.category || 'General'
      })),
      duplicatesDetected: (p1Analysis.duplicates || []).map(d => ({
        type: d.type,
        severity: d.severity,
        medications: d.medications,
        activeIngredient: d.activeIngredient || d.active_ingredient || '',
        therapeuticCategory: d.therapeuticCategory || d.therapeutic_category || '',
        description: d.description,
        clinicalAction: d.clinicalAction || d.clinical_action || ''
      })),
      riskAnalysis: {
        score: p1Analysis.risk_analysis ? p1Analysis.risk_analysis.score : 85,
        riskLevel: 'High Risk',
        badgeColor: 'red',
        summaryStatement: 'Critical polypharmacy risk: Multiple major drug interactions between anticoagulant (Warfarin), antiplatelet (Aspirin), and NSAID (Ibuprofen), alongside ACE-inhibitor and Spironolactone hyperkalemia hazard.',
        factors: p1Analysis.risk_analysis ? p1Analysis.risk_analysis.factors : [],
        allergyAlerts: p1Analysis.risk_analysis ? p1Analysis.risk_analysis.allergyAlerts : [],
        beersFlaggedMedications: ['Ibuprofen', 'Aspirin']
      },
      aiInsights: {
        executiveSummary: 'PharmaFog safety assessment for Eleanor Vance flags severe polypharmacy risk. Concurrent prescription of Warfarin + Aspirin + Ibuprofen markedly increases fatal gastrointestinal hemorrhage and intracranial bleeding risk. Concurrent Lisinopril + Spironolactone threatens life-threatening hyperkalemia.',
        patientFriendlyTakeaways: [
          'Warfarin and Ibuprofen together cause significant stomach bleeding risk. Discuss alternative pain management.',
          'Lisinopril and Spironolactone can cause high potassium levels in the blood. Routine blood draws are necessary.',
          'Inform your clinician before taking any over-the-counter painkillers.'
        ],
        verificationFlags: [
          'Verify latest INR level (Target 2.0 - 3.0).',
          'Obtain immediate Basic Metabolic Panel to check Potassium (K+) and serum creatinine.',
          'Deprescribe oral Ibuprofen and replace with topical pain relief or paracetamol.'
        ],
        aiConfidenceNote: 'Verified against authoritative clinical pharmacology interaction compendia.',
        disclaimer: 'Clinical Decision Support prototype. Not autonomous medical diagnosis.'
      },
      clinicianChecklist: [
        {
          id: 'CHK-1',
          category: 'Deprescribing Priority',
          action: 'Immediately discontinue oral Ibuprofen 400mg TID',
          rationale: 'Avoid triple-whammy and major anticoagulant bleeding synergism.',
          priority: 'High',
          completed: false
        },
        {
          id: 'CHK-2',
          category: 'Laboratory Surveillance',
          action: 'Order urgent INR, Serum Potassium, and Creatinine',
          rationale: 'Elevated risk of hyperkalemia and over-anticoagulation.',
          priority: 'High',
          completed: false
        },
        {
          id: 'CHK-3',
          category: 'Gastroprotection',
          action: 'Evaluate necessity of gastroprotective PPI if dual antithrombotic therapy required',
          rationale: 'Protect against upper GI ulceration in elderly patient.',
          priority: 'Medium',
          completed: false
        }
      ],
      networkGraph: {
        totalNodes: 5,
        totalEdges: 4,
        density: 0.4,
        connectedComponents: 1
      },
      conductedBy: doctor._id
    });

    p1.lastRiskScore = 85;
    p1.lastEvaluatedAt = new Date();
    await p1.save();

    // 7. Seed Initial Notifications
    await Notification.create([
      {
        recipient: null,
        title: 'HIGH RISK ALERT: Eleanor Vance (PF-1001)',
        message: 'Severe polypharmacy risk detected: 4 Major interactions flagged including Warfarin + NSAID hemorrhage synergism and Lisinopril + Spironolactone hyperkalemia.',
        type: 'alert',
        priority: 'High',
        relatedPatient: p1._id,
        relatedAssessment: asm1._id,
        read: false
      },
      {
        recipient: null,
        title: 'GERIATRIC SAFETY FLAG: Robert Davis (PF-1004)',
        message: 'Patient aged 82 prescribed dual GABAA sedatives (Lorazepam + Zolpidem) and duplicated NSAIDs (Ibuprofen + Naproxen). Severe fall hazard.',
        type: 'warning',
        priority: 'High',
        relatedPatient: p4._id,
        read: false
      },
      {
        recipient: null,
        title: 'SYSTEM READY: PharmaFog Clinical Knowledgebase',
        message: 'Database seeded with 30 reference medications and 28 verified drug-drug interaction mechanisms.',
        type: 'success',
        priority: 'Low',
        read: true
      }
    ]);

    // 8. Seed Initial Audit Logs
    await AuditLog.create([
      {
        user: admin._id,
        userEmail: admin.email,
        userRole: admin.role,
        action: 'SYSTEM_INITIALIZATION',
        entityType: 'System',
        details: 'PharmaFog clinical database initialization & demo data seed complete.'
      },
      {
        user: doctor._id,
        userEmail: doctor.email,
        userRole: doctor.role,
        action: 'ASSESSMENT_RUN',
        entityType: 'Assessment',
        entityId: String(asm1._id),
        details: 'Initial baseline polypharmacy analysis run for Eleanor Vance (PF-1001).'
      }
    ]);

    console.log('[Seed] Database seeding finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seed();
