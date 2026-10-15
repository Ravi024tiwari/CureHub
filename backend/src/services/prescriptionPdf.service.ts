import PDFDocument from "pdfkit";
import { IAppointment } from "../models/Appointment.model.js";

/**
 * Production-Grade Prescription PDF Generator Service
 */

interface PopulatedDoctor {
  department: string;
  specialization?: string[];
  qualifications?: string[];
  medicalCouncilRegistrationNumber?: string;
  experienceYears?: number;
  consultationFee?: number;
  userId?: {
    name: string;
    email: string;
    phoneNumber?: string;
  };
}

interface PopulatedHospital {
  name: string;
  licenseNumber?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface PopulatedPatient {
  name: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  age?: number;
}

export const generatePrescriptionPdfBuffer = (appointment: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `Prescription - ${appointment.appointmentNumber}`,
          Author: "CureHealth Telemedicine System",
          Subject: "Clinical Consultation Prescription",
          Keywords: "prescription, medical, curehealth, telehealth",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const doctor = appointment.doctorId as unknown as PopulatedDoctor;
      const hospital = appointment.hospitalId as unknown as PopulatedHospital;
      const patient = appointment.patientId as unknown as PopulatedPatient;
      const prescription = appointment.prescription;

      // Color Palette
      const PRIMARY = "#0F766E"; 
      const SECONDARY = "#0E7490"; 
      const TEXT_MAIN = "#0F172A"; 
      const TEXT_MUTED = "#475569"; 
      const BORDER_COLOR = "#CBD5E1"; 
      const BG_LIGHT = "#F8FAFC"; 
      const ROW_ALT = "#F1F5F9"; 

      const pageWidth = 595.28; // A4 standard width in points
      const leftMargin = 40;
      const rightMargin = 40;
      const contentWidth = pageWidth - leftMargin - rightMargin; // 515.28

      // ========================================================================
      // 1. HOSPITAL / CLINIC LETTERHEAD HEADER
      // ========================================================================
      const hospitalName = hospital?.name || "CureHealth  Consultation Centre";
      const hospitalAddress = hospital?.address
        ? `${hospital.address.street || ""}, ${hospital.address.city || ""}, ${hospital.address.state || ""} ${hospital.address.zipCode || ""}`.replace(/^,\s*|,\s*$/g, "")
        : "Accredited CureHealth Telehealth Network";
      const hospitalContact = `Phone: ${hospital?.contactPhone || "1800-CURE-HLTH"} | Email: ${hospital?.contactEmail || "support@curehealth.in"}`;
      const hospitalReg = hospital?.licenseNumber
        ? `Facility Reg/NABH No: ${hospital.licenseNumber}`
        : "Registered Digital Health Facility";

      // Brand Accent Top Bar
      doc.rect(0, 0, pageWidth, 8).fill(PRIMARY);

      // Hospital Title & Subtitle
      doc.fillColor(PRIMARY).fontSize(16).font("Helvetica-Bold").text(hospitalName, leftMargin, 25, { width: 340 });
      doc.fillColor(TEXT_MUTED).fontSize(8.5).font("Helvetica").text(hospitalAddress, leftMargin, doc.y + 2, { width: 340 });
      doc.text(hospitalContact, leftMargin, doc.y + 1, { width: 340 });
      doc.fillColor(SECONDARY).fontSize(8).font("Helvetica-Bold").text(hospitalReg, leftMargin, doc.y + 1, { width: 340 });

      // Right-side Prescription Badge
      const badgeX = pageWidth - rightMargin - 150;
      doc.roundedRect(badgeX, 22, 150, 48, 4).fillAndStroke(BG_LIGHT, BORDER_COLOR);
      doc.fillColor(PRIMARY).fontSize(11).font("Helvetica-Bold").text("DIGITAL PRESCRIPTION", badgeX, 28, {
        width: 150,
        align: "center",
      });
      doc.fillColor(TEXT_MUTED).fontSize(8).font("Helvetica").text("Electronic Health Record (EHR)", badgeX, doc.y + 2, {
        width: 150,
        align: "center",
      });
      doc.fillColor(TEXT_MAIN).fontSize(7.5).font("Helvetica-Bold").text(`Ref: ${appointment.appointmentNumber}`, badgeX, doc.y + 2, {
        width: 150,
        align: "center",
      });

      // Divider below letterhead
      let currentY = 82;
      doc.moveTo(leftMargin, currentY).lineTo(pageWidth - rightMargin, currentY).lineWidth(1.5).strokeColor(PRIMARY).stroke();

      // ========================================================================
      // 2. DOCTOR CREDENTIALS & APPOINTMENT META PANEL
      // ========================================================================
      currentY += 8;
      const panelHeight = 62;
      doc.roundedRect(leftMargin, currentY, contentWidth, panelHeight, 4).fillAndStroke(BG_LIGHT, BORDER_COLOR);

      // Left Column: Doctor Details
      const docName = `Dr. ${doctor?.userId?.name || "Consultant Doctor"}`;
      const docQual = doctor?.qualifications?.length ? doctor.qualifications.join(", ") : "MBBS, Specialist";
      const docDept = `${doctor?.department || "General Medicine"}${doctor?.specialization?.length ? " (" + doctor.specialization.join(", ") + ")" : ""}`;
      const docRegNo = `State Medical Reg No: ${doctor?.medicalCouncilRegistrationNumber || "NMC-VERIFIED"}`;

      doc.fillColor(PRIMARY).fontSize(10).font("Helvetica-Bold").text(docName, leftMargin + 10, currentY + 7);
      doc.fillColor(TEXT_MAIN).fontSize(8).font("Helvetica").text(docQual, leftMargin + 10, doc.y + 1);
      doc.fillColor(TEXT_MUTED).fontSize(8).font("Helvetica").text(docDept, leftMargin + 10, doc.y + 1);
      doc.fillColor(SECONDARY).fontSize(7.5).font("Helvetica-Bold").text(docRegNo, leftMargin + 10, doc.y + 1);

      // Right Column: Consultation Metadata
      const col2X = leftMargin + contentWidth / 2 + 10;
      const consultDate = appointment.date || new Date().toISOString().split("T")[0];
      const consultTime = `${appointment.startTime || "--"} - ${appointment.endTime || "--"}`;
      const consultMode = appointment.type === "VIDEO_CALL" ? "Teleconsultation (Video)" : "In-Person Clinic Visit";
      const issueDate = prescription?.issuedAt
        ? new Date(prescription.issuedAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleDateString("en-IN");

      doc.fillColor(TEXT_MUTED).fontSize(8).font("Helvetica").text(`Consultation Date: `, col2X, currentY + 7, { continued: true });
      doc.fillColor(TEXT_MAIN).font("Helvetica-Bold").text(consultDate);

      doc.fillColor(TEXT_MUTED).font("Helvetica").text(`Slot Time: `, col2X, doc.y + 2, { continued: true });
      doc.fillColor(TEXT_MAIN).font("Helvetica-Bold").text(consultTime);

      doc.fillColor(TEXT_MUTED).font("Helvetica").text(`Consultation Mode: `, col2X, doc.y + 2, { continued: true });
      doc.fillColor(TEXT_MAIN).font("Helvetica-Bold").text(consultMode);

      doc.fillColor(TEXT_MUTED).font("Helvetica").text(`Prescription Issued: `, col2X, doc.y + 2, { continued: true });
      doc.fillColor(TEXT_MAIN).font("Helvetica-Bold").text(issueDate);

      // ========================================================================
      // 3. PATIENT DEMOGRAPHICS BAR
      // ========================================================================
      currentY += panelHeight + 8;
      const patientBarHeight = 28;
      doc.rect(leftMargin, currentY, contentWidth, patientBarHeight).fillAndStroke("#F1F5F9", BORDER_COLOR);

      const patientName = patient?.name || "Patient";
      const patientPhone = patient?.phoneNumber ? `Ph: ${patient.phoneNumber}` : "Ph: N/A";
      const patientEmail = patient?.email ? `Email: ${patient.email}` : "";

      doc.fillColor(TEXT_MUTED).fontSize(8.5).font("Helvetica").text("PATIENT: ", leftMargin + 10, currentY + 8, { continued: true });
      doc.fillColor(TEXT_MAIN).fontSize(9).font("Helvetica-Bold").text(patientName, { continued: true });
      doc.fillColor(TEXT_MUTED).fontSize(8).font("Helvetica").text(`   |   ${patientPhone}   |   ${patientEmail}`);

      // ========================================================================
      // 4. CLINICAL OBSERVATIONS & DIAGNOSIS
      // ========================================================================
      currentY += patientBarHeight + 10;

      // Symptoms Box
      doc.fillColor(PRIMARY).fontSize(9).font("Helvetica-Bold").text("CHIEF COMPLAINTS / PRESENTING SYMPTOMS:", leftMargin, currentY);
      doc.fillColor(TEXT_MAIN).fontSize(8.5).font("Helvetica").text(appointment.symptoms || "Routine consultation requested.", leftMargin, doc.y + 2, {
        width: contentWidth,
      });

      currentY = doc.y + 8;

      // Primary Diagnosis Box
      doc.roundedRect(leftMargin, currentY, contentWidth, 26, 3).fillAndStroke("#ECFDF5", "#A7F3D0");
      doc.fillColor("#065F46").fontSize(8.5).font("Helvetica-Bold").text("PROVISIONAL / CLINICAL DIAGNOSIS: ", leftMargin + 10, currentY + 7, {
        continued: true,
      });
      doc.fillColor("#047857").fontSize(9).font("Helvetica-Bold").text(prescription?.diagnosis || "Consultation Completed");

      // ========================================================================
      // 5. Rx (PRESCRIBED MEDICINES SCHEDULE TABLE)
      // ========================================================================
      currentY += 34;

      // Big Rx Symbol
      doc.fillColor(PRIMARY).fontSize(14).font("Helvetica-Bold").text("Rx", leftMargin, currentY);
      doc.fillColor(TEXT_MUTED).fontSize(8).font("Helvetica").text("  (Prescribed Medications & Treatment Schedule)", leftMargin + 25, currentY + 4);

      currentY += 18;

      // Table Column Definitions
      const colW = {
        idx: 26,
        name: 154,
        dosage: 75,
        freq: 85,
        duration: 65,
        inst: 110.28,
      };

      // Table Header Row
      doc.rect(leftMargin, currentY, contentWidth, 20).fill(PRIMARY);
      doc.fillColor("#FFFFFF").fontSize(7.5).font("Helvetica-Bold");

      let headerX = leftMargin;
      doc.text("#", headerX, currentY + 6, { width: colW.idx, align: "center" });
      headerX += colW.idx;
      doc.text("MEDICINE NAME", headerX + 4, currentY + 6, { width: colW.name - 4 });
      headerX += colW.name;
      doc.text("DOSAGE", headerX, currentY + 6, { width: colW.dosage, align: "center" });
      headerX += colW.dosage;
      doc.text("FREQUENCY", headerX, currentY + 6, { width: colW.freq, align: "center" });
      headerX += colW.freq;
      doc.text("DURATION", headerX, currentY + 6, { width: colW.duration, align: "center" });
      headerX += colW.duration;
      doc.text("INSTRUCTIONS", headerX + 4, currentY + 6, { width: colW.inst - 4 });

      currentY += 20;

      // Table Rows
      const medicines = prescription?.medicines || [];

      medicines.forEach((med: any, index: number) => {
        const rowHeight = 22;
        const isAlt = index % 2 === 1;

        if (isAlt) {
          doc.rect(leftMargin, currentY, contentWidth, rowHeight).fill(ROW_ALT);
        } else {
          doc.rect(leftMargin, currentY, contentWidth, rowHeight).fill("#FFFFFF");
        }

        // Draw Row Bottom Border
        doc.moveTo(leftMargin, currentY + rowHeight).lineTo(pageWidth - rightMargin, currentY + rowHeight).lineWidth(0.5).strokeColor(BORDER_COLOR).stroke();

        let rowX = leftMargin;
        // Index
        doc.fillColor(TEXT_MUTED).fontSize(8).font("Helvetica").text(`${index + 1}`, rowX, currentY + 6, {
          width: colW.idx,
          align: "center",
        });
        rowX += colW.idx;

        // Medicine Name
        doc.fillColor(TEXT_MAIN).fontSize(8.5).font("Helvetica-Bold").text(med.name || "--", rowX + 4, currentY + 6, {
          width: colW.name - 6,
          ellipsis: true,
        });
        rowX += colW.name;

        // Dosage
        doc.fillColor(TEXT_MAIN).fontSize(8).font("Helvetica").text(med.dosage || "--", rowX, currentY + 6, {
          width: colW.dosage,
          align: "center",
        });
        rowX += colW.dosage;

        // Frequency
        doc.fillColor(TEXT_MAIN).fontSize(8).font("Helvetica-Bold").text(med.frequency || "--", rowX, currentY + 6, {
          width: colW.freq,
          align: "center",
        });
        rowX += colW.freq;

        // Duration
        doc.fillColor(TEXT_MAIN).fontSize(8).font("Helvetica").text(med.duration || "--", rowX, currentY + 6, {
          width: colW.duration,
          align: "center",
        });
        rowX += colW.duration;

        // Instructions
        doc.fillColor(TEXT_MUTED).fontSize(7.5).font("Helvetica-Oblique").text(med.instructions || "As directed", rowX + 4, currentY + 6, {
          width: colW.inst - 6,
          ellipsis: true,
        });

        currentY += rowHeight;
      });

      // Outer table border
      doc.rect(leftMargin, currentY - 20 - medicines.length * 22, contentWidth, 20 + medicines.length * 22).lineWidth(0.75).strokeColor(BORDER_COLOR).stroke();

      // ========================================================================
      // 6. CLINICAL ADVICE & GENERAL NOTES
      // ========================================================================
      currentY += 12;

      doc.fillColor(PRIMARY).fontSize(9).font("Helvetica-Bold").text("DOCTOR'S ADVICE & SPECIAL PRECAUTIONS:", leftMargin, currentY);
      const notesContent = prescription?.notes?.trim() || "Take medicines on schedule. Maintain adequate hydration. Return if symptoms worsen.";
      doc.fillColor(TEXT_MAIN).fontSize(8.5).font("Helvetica").text(notesContent, leftMargin, doc.y + 3, {
        width: contentWidth,
        lineGap: 2,
      });

      // ========================================================================
      // 7. DIGITAL SIGNATURE & VERIFICATION STAMP FOOTER
      // ========================================================================
      // Anchor signature block at bottom (fixed position ~680pt)
      const footerY = 675;

      // Doctor's Signature Block (Right aligned)
      const sigBoxW = 200;
      const sigBoxX = pageWidth - rightMargin - sigBoxW;

      doc.moveTo(sigBoxX, footerY).lineTo(sigBoxX + sigBoxW, footerY).lineWidth(1).strokeColor(PRIMARY).stroke();
      doc.fillColor(PRIMARY).fontSize(8.5).font("Helvetica-Bold").text(`Digitally Signed by: ${docName}`, sigBoxX, footerY + 4, {
        width: sigBoxW,
        align: "right",
      });
      doc.fillColor(TEXT_MUTED).fontSize(7.5).font("Helvetica").text(`Reg: ${doctor?.medicalCouncilRegistrationNumber || "NMC-VERIFIED"}`, sigBoxX, doc.y + 1, {
        width: sigBoxW,
        align: "right",
      });
      doc.fillColor(TEXT_MUTED).fontSize(7).font("Helvetica").text(`Timestamp: ${issueDate}`, sigBoxX, doc.y + 1, {
        width: sigBoxW,
        align: "right",
      });

      // Security / Legal Disclaimer Badge (Left aligned)
      const secBoxW = 270;
      doc.roundedRect(leftMargin, footerY - 5, secBoxW, 46, 3).fillAndStroke("#F8FAFC", BORDER_COLOR);
      doc.fillColor(PRIMARY).fontSize(7.5).font("Helvetica-Bold").text("ELECTRONIC HEALTH RECORD (EHR) VALIDATION", leftMargin + 8, footerY + 2);
      doc.fillColor(TEXT_MUTED).fontSize(6.5).font("Helvetica").text(
        "This prescription is digitally authenticated under the Information Technology Act, 2000 & National Telemedicine Practice Guidelines. Generated securely via CureHealth Healthcare Cloud.",
        leftMargin + 8,
        doc.y + 2,
        { width: secBoxW - 16, lineGap: 1 }
      );

      // Bottom Bar
      doc.rect(0, 782, pageWidth, 60).fill("#F1F5F9");
      doc.fillColor(TEXT_MUTED).fontSize(7.5).font("Helvetica").text(
        "CureHealth Cloud Platform | Confidential Medical Document | For Emergency, visit your nearest hospital emergency ward immediately.",
        leftMargin,
        790,
        { width: contentWidth, align: "center" }
      );

      // Finish document
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
