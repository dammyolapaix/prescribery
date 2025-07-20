import { HttpsClient } from "../../http-client";
import type {
  PatientListResponse,
  PatientCreateRequest,
  Patient,
} from "./types";

/**
 * Configuration for the Patient resource
 */
export type PatientConfig = {
  debug?: boolean;
};

/**
 * Parameters for listing patients
 */
export type PatientListParams = {
  facility_id: string;
  record_id: string;
};

/**
 * Patient resource for managing patient data
 *
 * Handles patient-related API operations with proper error handling
 * and debug logging capabilities.
 *
 * @example
 * ```typescript
 * // List patients
 * const patients = await prescribery.patients.list('your-access-token', {
 *   facility_id: 'facility123',
 *   record_id: 'record456'
 * })
 *
 * if (isSuccess(patients)) {
 *   console.log('Patients:', patients.data?.members)
 * } else if (isError(patients)) {
 *   console.error('Error:', patients.message)
 * }
 *
 * // Get a specific patient
 * const patient = await prescribery.patients.get('your-access-token', 'patient123')
 *
 * if (isSuccess(patient)) {
 *   console.log('Patient:', patient.data)
 *   console.log('Name:', patient.data?.first_name, patient.data?.last_name)
 * } else if (isError(patient)) {
 *   console.error('Error:', patient.message)
 * }
 *
 * // Create a new patient
 * const newPatient = await prescribery.patients.create('your-access-token', {
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   email: 'john.doe@example.com',
 *   dob: '1990-01-01',
 *   gender: 'male'
 * })
 *
 * if (isSuccess(newPatient)) {
 *   console.log('Patient created:', newPatient.data)
 * } else if (isError(newPatient)) {
 *   console.error('Error:', newPatient.message)
 * }
 * ```
 */
export class PatientResource {
  private readonly client: HttpsClient;
  private readonly debug: boolean;

  constructor(client: HttpsClient, config: PatientConfig = {}) {
    this.client = client;
    this.debug = config.debug || false;
  }

  /**
   * List patients for a specific facility and record
   *
   * @param accessToken - Access token for authentication
   * @param params - Parameters for listing patients
   * @param params.facility_id - The facility ID
   * @param params.record_id - The record ID
   * @returns Promise resolving to normalized patient list response
   * @throws {Error} If request fails or network error occurs
   *
   * @example
   * ```typescript
   * const patients = await prescribery.patients.list('your-access-token', {
   *   facility_id: 'facility123',
   *   record_id: 'record456'
   * })
   *
   * if (isSuccess(patients)) {
   *   console.log('Patients:', patients.data?.members)
   * } else if (isError(patients)) {
   *   console.error('Error:', patients.message)
   * }
   * ```
   */
  async list(accessToken: string, params: PatientListParams) {
    const response = await this.client.get<PatientListResponse>("/patients", {
      accessToken,
      query: {
        facility_id: params.facility_id,
        record_id: params.record_id,
      },
    });

    return response;
  }

  /**
   * Get a specific patient by ID
   *
   * @param accessToken - Access token for authentication
   * @param patientId - The patient ID to retrieve
   * @returns Promise resolving to normalized patient response
   * @throws {Error} If request fails or network error occurs
   *
   * @example
   * ```typescript
   * const patient = await prescribery.patients.get('your-access-token', 'patient123')
   *
   * if (isSuccess(patient)) {
   *   console.log('Patient:', patient.data)
   *   console.log('Name:', patient.data?.first_name, patient.data?.last_name)
   *   console.log('Email:', patient.data?.email)
   * } else if (isError(patient)) {
   *   console.error('Error:', patient.message)
   * }
   * ```
   */
  async get(accessToken: string, patientId: string) {
    const response = await this.client.get<Patient>(`/patients/${patientId}`, {
      accessToken,
    });

    return response;
  }

  /**
   * Create a new patient
   *
   * @param accessToken - Access token for authentication
   * @param patientData - Patient data for creation
   * @returns Promise resolving to normalized patient creation response
   * @throws {Error} If request fails or network error occurs
   *
   * @example
   * ```typescript
   * const newPatient = await prescribery.patients.create('your-access-token', {
   *   first_name: 'John',
   *   last_name: 'Doe',
   *   email: 'john.doe@example.com',
   *   dob: '1990-01-01',
   *   gender: 'male',
   *   mobile: '+1234567890',
   *   address_line1: '123 Main St',
   *   city: 'New York',
   *   state: 'NY',
   *   postal_code: '10001'
   * })
   *
   * if (isSuccess(newPatient)) {
   *   console.log('Patient created:', newPatient.data)
   * } else if (isError(newPatient)) {
   *   console.error('Error:', newPatient.message)
   * }
   * ```
   */
  async create(accessToken: string, patientData: PatientCreateRequest) {
    const response = await this.client.post<Patient>("/patients", {
      accessToken,
      body: patientData,
    });

    return response;
  }
}
