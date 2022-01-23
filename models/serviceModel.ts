 import mongoose, { Schema, Document } from "mongoose";


 export interface IService extends Document {
   _id?: string;
   title: string;
   description: string;
   image?: string;
   price?: string;
   createdAt?: string;
   updatedAt?: string;
 }

 const serviceSchema = new Schema(
   {
     title: {
       type: String,
       trim: true,
     },

     description: {
       type: String,
       trim: true,
     },

     price: String,

     image: String,


   },
   { timestamps: true }
 );

 const Service = mongoose.model<IService>(
   "Service",
   serviceSchema
 );

 export default Service;
