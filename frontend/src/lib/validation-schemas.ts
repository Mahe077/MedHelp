import { z } from "zod";

export const Gender = z.enum(["MALE", "FEMALE", "OTHER"]);

export const CreateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username can only contain letters, numbers, dots, underscores, and hyphens"
    ),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email format").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[ @#$%^&+=]).*$/,
      "Password must contain at least one digit, one lowercase, one uppercase, and one special character"
    ),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number format").optional(),
  dateOfBirth: z.string().optional(),
  gender: Gender.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().regex(/^[0-9]{5,10}$/, "Invalid postal code").optional(),
  employeeId: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  yearsOfExperience: z.number().min(0, "Years of experience cannot be negative").optional(),
  dateOfJoining: z.string().optional(),
  department: z.string().optional(),
  reportingTo: z.number().optional(),
  customerId: z.string().optional(),
  loyaltyCardNumber: z.string().optional(),
  memberSince: z.string().optional(),
  preferredBranchId: z.number().optional(),
  branchId: z.number().optional(),
  role: z.string().min(1, "At least one role is required"),
  createdBy: z.number().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;