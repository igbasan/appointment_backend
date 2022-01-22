import mongoose, { Schema, Document } from "mongoose";


enum Role {
  USER = "user",
  ADMIN = "admin", // ADMIN = HOSPITAL
  SUPER_ADMIN = "super_admin",
}

export interface IHospitalProfile extends Document {
  _id?: string;
  email: string;
  hospitalName: string;
  fullName?: string;
  role?: Role;
  avatar?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

const hospitalProfileSchema = new Schema(
  {
    hospitalName: {
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
    },

    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);



const HospitalProfile = mongoose.model<IHospitalProfile>(
  "HospitalProfile",
  hospitalProfileSchema
);

export default HospitalProfile;
