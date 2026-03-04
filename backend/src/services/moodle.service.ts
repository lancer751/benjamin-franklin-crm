// Simulated Moodle integration service.
// No real Moodle API calls are made; all responses are simulated.

import axios, { AxiosError } from "axios";
import type { MoodleUser, NewStudent } from "../types/user";
import { MOODLE_TOKEN, MOODLE_URL } from "../config/connection";
import type {
  EnrolledStudentsPerCourse,
  MoodleErrorResponse,
} from "../types/moodle";

export interface MoodleEnrollResult {
  success: boolean;
  moodleEnrollmentId?: string;
  error?: string;
}

export async function simulateMoodleEnrollment(
  clientEmail: string,
  moodleCourseId: string | null,
): Promise<MoodleEnrollResult> {
  // Simulate a short async delay (as if calling a real API)
  await new Promise((res) => setTimeout(res, 50));

  const simulatedEnrollmentId = `moodle_enroll_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  console.log(
    `🎓 [MOODLE SIMULATED] Enrolled ${clientEmail} into Moodle course ID "${moodleCourseId ?? "N/A"}". Enrollment ID: ${simulatedEnrollmentId}`,
  );

  return { success: true, moodleEnrollmentId: simulatedEnrollmentId };
}

type CreateStudentResult =
  | {
      success: true;
      data: Pick<MoodleUser, "id" | "username">;
    }
  | { success: false; error: string, data?: MoodleUser };

export async function getModdleStudentById(
  id: number,
): Promise<
  | { success: true; users: MoodleUser[]; warnings: [] }
  | { success: false; error: string }
> {
  try {
    const response = await axios.get<{ users: MoodleUser[]; warnings: [] }>(
      MOODLE_URL,
      {
        params: {
          wstoken: MOODLE_TOKEN,
          wsfunction: "core_user_get_users",
          moodlewsrestformat: "json",
          "criteria[0][key]": "id",
          "criteria[0][value]": `${id}`,
        },
        timeout: 30_000,
      },
    );
    if (response.status !== 200) {
      throw new Error();
    }
    return { success: true, ...response.data };
  } catch (error) {
    console.error("error on getMoodleStudentByEmail", error);

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
      error: "Unexpected error while getting student by id.",
    };
  }
}

export async function createNewModdleStudent(
  data: Omit<NewStudent, "id">,
): Promise<CreateStudentResult> {
  try {
    // Data validation
    if (
      !data.email ||
      !data.firstname ||
      !data.lastname ||
      !data.username 
    ) {
      return { success: false, error: "Missing required student fields" };
    }

    // Build Moodle request params
    const params = new URLSearchParams();
    // General params
    params.append("wstoken", MOODLE_TOKEN);
    params.append("wsfunction", "core_user_create_users");
    params.append("moodlewsrestformat", "json");
    // User essential keys
    params.append("users[0][username]", data.username);
    params.append("users[0][firstname]", data.firstname);
    params.append("users[0][lastname]", data.lastname);
    params.append("users[0][email]", data.email);
    params.append("users[0][password]", data.password);

    const response = await axios.post<Pick<MoodleUser, "id" | "username">[]>(
      MOODLE_URL,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      },
    );
    console.log(response.data);

    if (response.data.length === 0) {
      throw new Error(
        "Moodle did not return any data for the created student.",
      );
    }

    const student = response.data[0];
    if (!student) {
      throw new Error("Moodle did not return valid student data.");
    }

    return { success: true, data: student };
  } catch (error) {
    console.error("Error in createNewStudentModle", error);

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
      error: "Unexpected error while creating student.",
    };
  }
}

export async function enrolledStudentInMoodleCourse(
  studentId: number,
  courseId: number,
) {
  try {
    const enrolledStudentsPerCourse =
      await axios.get<EnrolledStudentsPerCourse[]>(MOODLE_URL, {
        params: {
          wstoken: MOODLE_TOKEN,
          wsfunction: "core_enrol_get_enrolled_users",
          moodlewsrestformat: "json",
          "criteria[0][value]": `${courseId}`,
        },
        timeout: 30_000,
      });

      const enrolledStudent = enrolledStudentsPerCourse.data.find(student => student.id === studentId)

      console.log(enrolledStudent)
      return Boolean(enrolledStudent) 
    } catch (error) {
    console.error("Error in fetch studentEnrolledInCourse", error);
    return {
      success: false,
      error: "Unexpected error while getting student by course",
    };
  }
}
