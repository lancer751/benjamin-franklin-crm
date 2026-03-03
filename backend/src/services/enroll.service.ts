import axios, { AxiosError } from "axios";
import { MOODLE_TOKEN, MOODLE_URL } from "../config/connection";
import type { MoodleErrorResponse } from "../types/moodle";

type EnrollmentData = {
  userid: number;
  courseid: number;
  roleid: number;
};

type EnrollmentResult =
  | {
      success: true;
    }
  | { success: false; error: string };

export async function enrollStudentsInMoodle(
  enrollment: EnrollmentData,
): Promise<EnrollmentResult> {
  try {
    // Data validation
    if (!enrollment.userid || !enrollment.courseid || !enrollment.roleid) {
      return {
        success: false,
        error: "Missing required enrollment fields (userid, courseid, roleid)",
      };
    }

    // Build Moodle request params
    const params = new URLSearchParams();
    // General params
    params.append("wstoken", MOODLE_TOKEN);
    params.append("wsfunction", "enrol_manual_enrol_users");
    params.append("moodlewsrestformat", "json");
    // Enrollment params
    params.append("enrolments[0][userid]", enrollment.userid.toString());
    params.append("enrolments[0][courseid]", enrollment.courseid.toString());
    params.append("enrolments[0][roleid]", enrollment.roleid.toString());

    await axios.post(MOODLE_URL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 10000,
    });

    return { success: true };
  } catch (error) {
    console.error("Error in enrollStudentsInMoodle service", error);

    // Axios error handling
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<MoodleErrorResponse>;

      if (axiosError.response?.data?.message) {
        return {
          success: false,
          error: axiosError.response.data.message,
        };
      }

      if (axiosError.request) {
        return {
          success: false,
          error: "No response received from Moodle server.",
        };
      }
    }
    return {
      success: false,
      error: "Unexpected error while enrolling student.",
    };
  }
}
