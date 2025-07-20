export type Patient = {
  active: string;
  city: string;
  created_date: string;
  created_time: string;
  dob: string;
  email: string;
  first_name: string;
  full_name: string;
  gender: string;
  last_name: string;
  mobile: string;
  patient_id: string;
  record_id: string;
  state: string;
  zip_code: string;
};

export type PatientListResponse = {
  members: Patient[];
};

type Address = {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
};

export type PatientCreateRequest = {
  first_name: string;
  last_name: string;
  email: string;
  dob: string;
  gender: string;
  mobile?: string;
  address_line1?: string;
  address_line2?: string;
  postal_code?: string;
  city?: string;
  state?: string;
  "create_contact_on[]"?: string;
  welcome_email?: boolean;
  shipping_address?: Address;
  residential_address?: Address;
};
