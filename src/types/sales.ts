import { z } from "zod";
import { 
  FittingSchema, 
  RentalBookingSchema, 
  FittingStatusSchema, 
  RentalBookingStatusSchema,
  PackageTypeSchema
} from "../schema/sales.schema";

export type FittingStatus = z.infer<typeof FittingStatusSchema>;
export type RentalBookingStatus = z.infer<typeof RentalBookingStatusSchema>;
export type PackageType = z.infer<typeof PackageTypeSchema>;

export type Fitting = z.infer<typeof FittingSchema>;
export type RentalBooking = z.infer<typeof RentalBookingSchema>;
