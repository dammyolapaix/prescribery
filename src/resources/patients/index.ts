import { HttpsClient } from "../../http-client";
import type { PatientListResponse } from "./types";

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
}
