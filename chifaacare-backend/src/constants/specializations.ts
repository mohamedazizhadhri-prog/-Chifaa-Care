// Medical Specializations Constants
// Use this file to import specializations in your frontend

export const MEDICAL_SPECIALIZATIONS = [
  // Cancer Care Specialties
  'Medical Oncologist',
  'Surgical Oncologist',
  'Radiation Oncologist',
  'Hematologist-Oncologist',
  'Breast Oncologist',
  'Gynecologic Oncologist',
  'Urologic Oncologist',
  'Gastrointestinal Oncologist',
  'Thoracic Oncologist',
  'Pediatric Oncologist',
  // General Medical Specialties
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Surgery',
  'Gynecology',
  'Internal Medicine',
  'Neurology',
  'Obstetrics',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology (ENT)',
  'Pediatrics',
  'Physical Medicine and Rehabilitation',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Urology',
  'Anesthesiology',
  'Nephrology',
  'Pathology'
];

// Specialization descriptions for UI tooltips
export const SPECIALIZATION_DESCRIPTIONS = {
  // Cancer Care Specialties
  'Medical Oncologist': 'Cancer treatment with chemotherapy, immunotherapy, and targeted therapy',
  'Surgical Oncologist': 'Surgical removal of tumors and cancer tissue',
  'Radiation Oncologist': 'Cancer treatment using radiation therapy',
  'Hematologist-Oncologist': 'Blood cancers and disorders including leukemia and lymphoma',
  'Breast Oncologist': 'Specialized care for breast cancer',
  'Gynecologic Oncologist': 'Female reproductive system cancers',
  'Urologic Oncologist': 'Urinary tract and male reproductive cancers',
  'Gastrointestinal Oncologist': 'Digestive system cancers',
  'Thoracic Oncologist': 'Chest and lung cancers',
  'Pediatric Oncologist': 'Cancer care for children',
  // General Medical Specialties
  'Cardiology': 'Heart and cardiovascular system',
  'Dermatology': 'Skin, hair, and nails',
  'Emergency Medicine': 'Acute and urgent medical care',
  'Endocrinology': 'Hormones and metabolic disorders',
  'Family Medicine': 'Comprehensive care for all ages',
  'Gastroenterology': 'Digestive system and liver',
  'General Surgery': 'Surgical procedures and operations',
  'Gynecology': 'Female reproductive health',
  'Internal Medicine': 'Adult disease prevention and treatment',
  'Neurology': 'Brain and nervous system',
  'Obstetrics': 'Pregnancy and childbirth',
  'Oncology': 'Cancer diagnosis and treatment',
  'Ophthalmology': 'Eye and vision care',
  'Orthopedics': 'Bones, joints, and muscles',
  'Otolaryngology (ENT)': 'Ear, nose, and throat',
  'Pediatrics': 'Children\'s health',
  'Physical Medicine and Rehabilitation': 'Recovery and physical function',
  'Psychiatry': 'Mental health and disorders',
  'Pulmonology': 'Respiratory system and lungs',
  'Radiology': 'Medical imaging and diagnosis',
  'Rheumatology': 'Autoimmune and joint diseases',
  'Urology': 'Urinary tract and male reproductive system',
  'Anesthesiology': 'Pain management and anesthesia',
  'Nephrology': 'Kidney diseases',
  'Pathology': 'Disease diagnosis through lab testing'
};

// Helper function to get specialization with description
export const getSpecializationInfo = (specialization: string) => {
  return {
    name: specialization,
    description: SPECIALIZATION_DESCRIPTIONS[specialization as keyof typeof SPECIALIZATION_DESCRIPTIONS] || 'Medical specialist'
  };
};
