import mongoose, { Schema, Document } from "mongoose";

enum Role {
  USER = "user",
  ADMIN = "admin", // ADMIN = HOSPITAL
  SUPER_ADMIN = "super_admin",
}

export interface IPatientProfile extends Document {
  _id?: string;
  email: string;
  fullName?: string;
  role?: Role;
  avatar?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

const patientProfileSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    phone: String,

    nationality: String,

    role: {
      type: String,
      default: Role.USER
    },

    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const PatientProfile = mongoose.model<IPatientProfile>(
  "HospitalProfile",
  patientProfileSchema
);

export default PatientProfile;
