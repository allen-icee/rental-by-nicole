import { z } from "zod";

export const FittingStatusSchema = z.enum(["Scheduled", "Completed", "No Show", "Cancelled"]);
export const RentalBookingStatusSchema = z.enum(["Reserved", "Ready for Pickup", "Picked Up", "Due Today", "Overdue", "Returned", "Cancelled"]);
export const PackageTypeSchema = z.string(); // Can be "Standard", "Unlimited", or JSON string

export const FittingSchema = z.object({
  id: z.string().uuid().optional(),
  bookingNumber: z.string(),
  date: z.string(), // e.g. "YYYY-MM-DD"
  time: z.string().optional().nullable(),
  representativeCustomerId: z.string().uuid().optional().nullable(),
  representativeName: z.string().min(1, "Representative name is required"),
  customerCount: z.number().int().min(1),
  packageType: PackageTypeSchema,
  fee: z.number().min(0),
  total: z.number().min(0),
  status: FittingStatusSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const RentalBookingSchema = z.object({
  id: z.string().uuid().optional(),
  bookingNumber: z.string(),
  startDate: z.string(), // e.g. "YYYY-MM-DD"
  rentalDays: z.number().int().min(1),
  endDate: z.string().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  customerName: z.string().min(1, "Customer name is required"),
  dressId: z.string().uuid().optional().nullable(),
  sizeId: z.string().uuid().optional().nullable(),
  accessories: z.array(z.any()).optional().nullable(),
  subtotal: z.number().min(0),
  downPayment: z.number().min(0),
  securityDeposit: z.number().min(0),
  damageCharge: z.number().min(0),
  lateFee: z.number().min(0),
  refundAmount: z.number().min(0),
  total: z.number().min(0),
  pickupMode: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  status: RentalBookingStatusSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
