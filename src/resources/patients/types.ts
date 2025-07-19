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
