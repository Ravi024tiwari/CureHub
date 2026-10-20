import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Hospital } from "../models/Hospital.model.js";
import { User } from "../models/User.model.js";
import { UserRole, VerificationStatus } from "../constants/index.js";

dotenv.config();

const hospitalsSeedData = [
  {
    name: "Apollo Multispeciality Hospital",
    slug: "apollo-multispeciality-hospital-bilaspur",
    licenseNumber: "CG-HOSP-2010-00124",
    hospitalType: "Multi-Speciality",
    address: {
      street: "Civil Lines, Near Rajendra Nagar",
      city: "Bilaspur",
      state: "Chhattisgarh",
      zipCode: "495001",
      country: "India",
    },
    contactEmail: "care.bilaspur@apollohospitals.com",
    contactPhone: "+91 7752 494000",
    departments: [
      "Cardiology",
      "Neurology",
      "Orthopedics",
      "General Medicine",
      "Pediatrics",
      "Dermatology",
      "Gynecology",
      "Oncology",
    ],
    facilities: [
      "24x7 Emergency",
      "Ambulance",
      "ICU",
      "Pharmacy",
      "Diagnostic Lab",
      "Cath Lab",
      "Blood Bank",
      "Cafeteria",
      "Parking",
    ],
    establishmentYear: 2010,
    totalBeds: 250,
    rating: 4.8,
    distance: "2.3 km",
    website: "https://www.apollohospitals.com",
    openingTime: "00:00",
    closingTime: "23:59",
    isEmergency24x7: true,
    description:
      "Apollo Multispeciality Hospital Bilaspur is a premier tertiary healthcare institution offering international-standard medical care with modern medical technology, advanced CCU/ICU facilities, modular operation theatres, and round-the-clock emergency services.",
    images: {
      coverImage: "/src/assets/apollo-hospital.jpg",
      gallery: [
        "/src/assets/apollo-hospital.jpg",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
  {
    name: "City Care Hospital",
    slug: "city-care-hospital-bilaspur",
    licenseNumber: "CG-HOSP-2015-00289",
    hospitalType: "General & Surgery",
    address: {
      street: "Vyapar Vihar Commercial Complex",
      city: "Bilaspur",
      state: "Chhattisgarh",
      zipCode: "495004",
      country: "India",
    },
    contactEmail: "info@citycarehospital.in",
    contactPhone: "+91 7752 421111",
    departments: [
      "General Medicine",
      "Pediatrics",
      "Orthopedics",
      "General Surgery",
      "Gastroenterology",
    ],
    facilities: [
      "24x7 Emergency",
      "ICU",
      "Diagnostic Lab",
      "Pharmacy",
      "Ambulance",
      "Parking",
    ],
    establishmentYear: 2015,
    totalBeds: 150,
    rating: 4.6,
    distance: "3.1 km",
    website: "https://www.citycarehospital.in",
    openingTime: "08:00",
    closingTime: "22:00",
    isEmergency24x7: true,
    description:
      "City Care Hospital is a recognized center for general medicine, laparoscopic surgery, and critical trauma care located in the heart of Vyapar Vihar, providing comprehensive diagnostic and surgical treatments.",
    images: {
      coverImage: "/src/assets/city-care-hospital.jpg",
      gallery: [
        "/src/assets/city-care-hospital.jpg",
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
  {
    name: "Shree Sai Hospital",
    slug: "shree-sai-hospital-bilaspur",
    licenseNumber: "CG-HOSP-2012-00178",
    hospitalType: "Multi-Speciality",
    address: {
      street: "Talapara Main Road",
      city: "Bilaspur",
      state: "Chhattisgarh",
      zipCode: "495001",
      country: "India",
    },
    contactEmail: "support@shreesaihospital.org",
    contactPhone: "+91 7752 234567",
    departments: [
      "Orthopedics",
      "Dermatology",
      "Gynecology",
      "General Medicine",
      "ENT",
    ],
    facilities: [
      "24x7 Emergency",
      "Diagnostic Lab",
      "Pharmacy",
      "Digital X-Ray",
      "Physiotherapy Wing",
    ],
    establishmentYear: 2012,
    totalBeds: 100,
    rating: 4.5,
    distance: "4.5 km",
    website: "https://www.shreesaihospital.org",
    openingTime: "08:30",
    closingTime: "21:30",
    isEmergency24x7: true,
    description:
      "Shree Sai Hospital provides top-tier joint replacement, fracture care, and maternal health services. Known for warm patient care, modern radiology, and dedicated physiotherapy rehabilitation.",
    images: {
      coverImage: "/src/assets/shree-sai-hospital.jpg",
      gallery: [
        "/src/assets/shree-sai-hospital.jpg",
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
  {
    name: "LifeCare Hospital",
    slug: "lifecare-hospital-bilaspur",
    licenseNumber: "CG-HOSP-2017-00345",
    hospitalType: "Multi-Speciality",
    address: {
      street: "Koni Bilaspur-Ratanpur Road",
      city: "Bilaspur",
      state: "Chhattisgarh",
      zipCode: "495009",
      country: "India",
    },
    contactEmail: "admin@lifecarebilaspur.com",
    contactPhone: "+91 7752 289000",
    departments: [
      "Pediatrics",
      "Cardiology",
      "General Medicine",
      "Pulmonology",
      "Dermatology",
    ],
    facilities: [
      "Ambulance",
      "ICU",
      "Pharmacy",
      "Diagnostic Lab",
      "Parking",
      "Oxygen Plant",
    ],
    establishmentYear: 2017,
    totalBeds: 80,
    rating: 4.4,
    distance: "5.0 km",
    website: "https://www.lifecarebilaspur.com",
    openingTime: "08:00",
    closingTime: "22:00",
    isEmergency24x7: false,
    description:
      "LifeCare Hospital delivers trusted healthcare along the Koni corridor, offering focused cardiology assessments, pediatric wellness clinics, respiratory clinics, and 24-hour in-house medicine dispensary.",
    images: {
      coverImage: "/src/assets/lifecare-hospital.jpg",
      gallery: [
        "/src/assets/lifecare-hospital.jpg",
        "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
  {
    name: "Metro Care Hospital",
    slug: "metro-care-hospital-bilaspur",
    licenseNumber: "CG-HOSP-2014-00210",
    hospitalType: "Super Speciality",
    address: {
      street: "Mopka Bypass Chowk",
      city: "Bilaspur",
      state: "Chhattisgarh",
      zipCode: "495006",
      country: "India",
    },
    contactEmail: "contact@metrocarebilaspur.org",
    contactPhone: "+91 7752 450000",
    departments: [
      "Oncology",
      "Neurology",
      "Nephrology",
      "Cardiology",
      "Orthopedics",
      "Urology",
    ],
    facilities: [
      "24x7 Emergency",
      "Ambulance",
      "ICU",
      "Diagnostic Lab",
      "Dialysis Unit",
      "Chemotherapy Suite",
      "Pharmacy",
    ],
    establishmentYear: 2014,
    totalBeds: 300,
    rating: 4.3,
    distance: "6.2 km",
    website: "https://www.metrocarebilaspur.org",
    openingTime: "00:00",
    closingTime: "23:59",
    isEmergency24x7: true,
    description:
      "Metro Care Hospital is a premier super-speciality health destination with state-of-the-art oncology radiotherapy, renal dialysis infrastructure, neuro-intensive care, and advanced robotic surgical assistance.",
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
  {
    name: "Sunrise Maternity & Children Hospital",
    slug: "sunrise-maternity-children-hospital-bilaspur",
    licenseNumber: "CG-HOSP-2019-00412",
    hospitalType: "Maternity & Women Care",
    address: {
      street: "Seepat Road, Sarkanda",
      city: "Bilaspur",
      state: "Chhattisgarh",
      zipCode: "495006",
      country: "India",
    },
    contactEmail: "care@sunrisematernity.com",
    contactPhone: "+91 7752 467890",
    departments: [
      "Gynecology",
      "Pediatrics",
      "Obstetrics",
      "Neonatology",
      "Fertility & IVF",
    ],
    facilities: [
      "24x7 Emergency",
      "NICU",
      "PICU",
      "Labor Suites",
      "Pharmacy",
      "Ambulance",
    ],
    establishmentYear: 2019,
    totalBeds: 120,
    rating: 4.5,
    distance: "8.1 km",
    website: "https://www.sunrisematernity.com",
    openingTime: "00:00",
    closingTime: "23:59",
    isEmergency24x7: true,
    description:
      "Sunrise Maternity & Children Hospital is Chhattisgarh's leading center for high-risk pregnancies, Level-3 Neonatal Intensive Care (NICU), comprehensive pediatric surgeries, and advanced reproductive medicine.",
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
  {
    name: "Sanjeevani Super Speciality Hospital",
    slug: "sanjeevani-super-speciality-hospital-bilaspur",
    licenseNumber: "CG-HOSP-2016-00311",
    hospitalType: "Super Speciality",
    address: {
      street: "Link Road, Near Bus Stand",
      city: "Bilaspur",
      state: "Chhattisgarh",
      zipCode: "495001",
      country: "India",
    },
    contactEmail: "contact@sanjeevanihospital.in",
    contactPhone: "+91 7752 412345",
    departments: [
      "Cardiology",
      "Orthopedics",
      "Gastroenterology",
      "Neurology",
      "General Surgery",
    ],
    facilities: [
      "24x7 Emergency",
      "Ambulance",
      "ICU",
      "Cath Lab",
      "Diagnostic Lab",
      "Pharmacy",
      "Parking",
    ],
    establishmentYear: 2016,
    totalBeds: 180,
    rating: 4.7,
    distance: "3.8 km",
    website: "https://www.sanjeevanihospital.in",
    openingTime: "00:00",
    closingTime: "23:59",
    isEmergency24x7: true,
    description:
      "Sanjeevani Super Speciality Hospital is renowned for round-the-clock emergency cardiology, keyhole neuro-surgeries, complex joint reconstructions, and state-of-the-art diagnostic imaging suites.",
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
  {
    name: "Fortis Escorts Hospital",
    slug: "fortis-escorts-hospital-raipur",
    licenseNumber: "CG-HOSP-2011-00109",
    hospitalType: "Super Speciality",
    address: {
      street: "Telibandha, GE Road",
      city: "Raipur",
      state: "Chhattisgarh",
      zipCode: "492006",
      country: "India",
    },
    contactEmail: "reachus.raipur@fortishealthcare.com",
    contactPhone: "+91 771 4242424",
    departments: [
      "Cardiology",
      "Cardiac Surgery",
      "Orthopedics",
      "Neurology",
      "Critical Care",
      "Nephrology",
    ],
    facilities: [
      "24x7 Emergency",
      "Ambulance",
      "ICU",
      "Cath Lab",
      "Pharmacy",
      "Blood Bank",
      "Cafeteria",
      "Parking",
    ],
    establishmentYear: 2011,
    totalBeds: 210,
    rating: 4.8,
    distance: "110 km",
    website: "https://www.fortishealthcare.com",
    openingTime: "00:00",
    closingTime: "23:59",
    isEmergency24x7: true,
    description:
      "Fortis Escorts Raipur is a globally accredited cardiac care and tertiary surgery center known for cutting-edge heart bypass operations, interventional electrophysiology, and advanced life-support ambulances.",
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
  {
    name: "AIIMS Raipur Healthcare Complex",
    slug: "aiims-raipur-healthcare-complex",
    licenseNumber: "GOI-AIIMS-2012-00001",
    hospitalType: "Super Speciality",
    address: {
      street: "GE Road, Tatibandh",
      city: "Raipur",
      state: "Chhattisgarh",
      zipCode: "492099",
      country: "India",
    },
    contactEmail: "director@aiimsraipur.edu.in",
    contactPhone: "+91 771 2572999",
    departments: [
      "General Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Pediatrics",
      "Orthopedics",
      "Dermatology",
      "Ophthalmology",
      "ENT",
      "Psychiatry",
    ],
    facilities: [
      "24x7 Emergency",
      "Ambulance",
      "ICU",
      "Trauma Centre",
      "Diagnostic Lab",
      "Blood Bank",
      "Pharmacy",
      "Cafeteria",
      "Parking",
    ],
    establishmentYear: 2012,
    totalBeds: 960,
    rating: 4.9,
    distance: "115 km",
    website: "https://www.aiimsraipur.edu.in",
    openingTime: "00:00",
    closingTime: "23:59",
    isEmergency24x7: true,
    description:
      "All India Institute of Medical Sciences (AIIMS) Raipur is an Apex Healthcare Institute of National Importance established by the Government of India, delivering world-class superspeciality medical treatment and clinical research.",
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
  {
    name: "Max Super Speciality Hospital",
    slug: "max-super-speciality-hospital-delhi",
    licenseNumber: "DL-HOSP-2006-00045",
    hospitalType: "Super Speciality",
    address: {
      street: "1, 2, Press Enclave Road, Mandir Marg, Saket",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110017",
      country: "India",
    },
    contactEmail: "care.saket@maxhealthcare.com",
    contactPhone: "+91 11 26515050",
    departments: [
      "Oncology",
      "Cardiology",
      "Neurosciences",
      "Orthopedics",
      "Organ Transplant",
      "Robotic Surgery",
    ],
    facilities: [
      "24x7 Emergency",
      "Ambulance",
      "ICU",
      "Cath Lab",
      "Pharmacy",
      "Diagnostic Lab",
      "Cafeteria",
      "Parking",
    ],
    establishmentYear: 2006,
    totalBeds: 500,
    rating: 4.8,
    distance: "1050 km",
    website: "https://www.maxhealthcare.com",
    openingTime: "00:00",
    closingTime: "23:59",
    isEmergency24x7: true,
    description:
      "Max Super Speciality Hospital Saket is an internationally accredited multi-superspeciality hospital recognized for its world-class center of excellence in Cancer care, Cardiac sciences, and advanced minimally invasive organ transplants.",
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
  {
    name: "Lilavati Hospital & Research Centre",
    slug: "lilavati-hospital-research-centre-mumbai",
    licenseNumber: "MH-HOSP-1997-00088",
    hospitalType: "Multi-Speciality",
    address: {
      street: "A-791, Bandra Reclamation, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India",
    },
    contactEmail: "info@lilavatihospital.com",
    contactPhone: "+91 22 26751000",
    departments: [
      "Cardiology",
      "Neurology",
      "Gastroenterology",
      "Orthopedics",
      "Pediatrics",
      "Dermatology",
    ],
    facilities: [
      "24x7 Emergency",
      "Ambulance",
      "ICU",
      "Diagnostic Lab",
      "Pharmacy",
      "Blood Bank",
      "Parking",
    ],
    establishmentYear: 1997,
    totalBeds: 320,
    rating: 4.7,
    distance: "1150 km",
    website: "https://www.lilavatihospital.com",
    openingTime: "00:00",
    closingTime: "23:59",
    isEmergency24x7: true,
    description:
      "Lilavati Hospital & Research Centre in Mumbai is a premier multi-speciality tertiary care hospital globally respected for clinical expertise, cutting-edge surgical infrastructure, and compassionate patient care.",
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
  {
    name: "Manipal Hospital",
    slug: "manipal-hospital-bengaluru",
    licenseNumber: "KA-HOSP-1991-00012",
    hospitalType: "Super Speciality",
    address: {
      street: "98, HAL Old Airport Road, Kodihalli",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560017",
      country: "India",
    },
    contactEmail: "info@manipalhospitals.com",
    contactPhone: "+91 80 25024444",
    departments: [
      "Cardiology",
      "Neurosurgery",
      "Pediatrics",
      "Orthopedics",
      "Organ Transplant",
      "Oncology",
    ],
    facilities: [
      "24x7 Emergency",
      "Ambulance",
      "ICU",
      "Pharmacy",
      "Diagnostic Lab",
      "Cafeteria",
      "Parking",
    ],
    establishmentYear: 1991,
    totalBeds: 600,
    rating: 4.8,
    distance: "1280 km",
    website: "https://www.manipalhospitals.com",
    openingTime: "00:00",
    closingTime: "23:59",
    isEmergency24x7: true,
    description:
      "Manipal Hospital Old Airport Road is one of India's top multi-speciality healthcare destinations, offering exemplary care with over 60 speciality disciplines, precision robotics, and internationally recognized medical faculty.",
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  },
];

export const seedHospitalsDatabase = async () => {
  try {
    console.log("Connecting to Database for hospital seeding...");
    await connectDB();

    // 1. Get or create a verified Hospital Admin user to link as hospitalAdminId
    let hospitalAdmin = await User.findOne({ role: UserRole.HOSPITAL_ADMIN });
    if (!hospitalAdmin) {
      console.log("Creating default verified Hospital Administrator account...");
      hospitalAdmin = await User.create({
        name: "Dr. Alok Verma (Chief Administrator)",
        email: "hospital.admin@curehealth.org",
        password: "Password@123",
        phoneNumber: "+91 98765 43210",
        role: UserRole.HOSPITAL_ADMIN,
        isEmailVerified: true,
        isAccountApproved: true,
        isActive: true,
      });
    }

    // 2. Get Super Admin for verifiedBy
    let superAdmin = await User.findOne({ role: UserRole.SUPER_ADMIN });

    console.log(`Starting to seed ${hospitalsSeedData.length} verified hospitals...`);

    // Remove legacy reviewCount field from all hospitals in database
    await Hospital.updateMany({}, { $unset: { reviewCount: 1 } });

    let seededCount = 0;
    for (const data of hospitalsSeedData) {
      const hospitalDoc = {
        ...data,
        hospitalAdminId: hospitalAdmin._id,
        licenseDocumentUrl:
          "https://curehealthstore.s3.us-east-1.amazonaws.com/licenses/govt_medical_license_sample.pdf",
        verificationStatus: VerificationStatus.APPROVED,
        verifiedBy: superAdmin?._id || hospitalAdmin._id,
        verifiedAt: new Date(),
        isActive: true,
      };

      await Hospital.findOneAndUpdate(
        { slug: data.slug },
        { $set: hospitalDoc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededCount++;
      console.log(`[✔ Seeded] ${data.name} (${data.address.city})`);
    }

    console.log(`\n🎉 Successfully seeded ${seededCount} verified hospitals into CureHealth database!`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding hospitals:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedHospitalsDatabase();
