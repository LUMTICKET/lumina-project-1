export type BusinessType = "individual" | "company";

export type DocType =
  | "registration_certificate"
  | "tax_clearance"
  | "business_license"
  | "national_id"
  | "other";

export type DocStatus = "pending" | "verified" | "rejected";

export interface Executive {
  id: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  nationalIdNumber: string;
  nationalIdFront?: string;
  nationalIdBack?: string;
}

export interface BusinessDoc {
  id: string;
  type: DocType;
  title: string;
  status: DocStatus;
  uploadedAt: string;
}

export interface BusinessProfile {
  id: string;
  type: BusinessType;
  businessName: string;
  tradingName?: string;
  registrationNumber?: string;
  taxId?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  website?: string;
  description: string;
  category: string;
  isVerified: boolean;
  executives: Executive[];
  documents: BusinessDoc[];
}

export interface VenueDetail {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity?: string;
  hasParking: boolean;
  isAccessible: boolean;
}

export interface BusinessHour {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "operator" | "viewer";
  joinedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ip?: string;
}

export interface PayoutMethod {
  id: string;
  type: "bank" | "mobile_money";
  name: string;
  account: string;
  isDefault: boolean;
}