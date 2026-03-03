export interface MoodleUser {
    id: number,
    username: string,
    firstname: string,
    lastname: string,
    fullname: string,
    email: string,
    department: string,
    firstaccess: number,
    lastaccess: number,
    auth: string,
    suspended: boolean,
    confirmed: boolean,
    lang: string,
    theme: string,
    timezone: string,
    mailformat: number,
    city: string,
    country: string,
    profileimageurlsmall: string,
    profileimageurl: string
}

export type RawUserMoodle = {
    id: number,
    username: string,
    firstName: string,
    lastName: string,
    fullName: string,
    email: string,
    moodleId: number
}

export interface Student extends RawUserMoodle {
    dni: string | null;
    phone: string | null;
}

export type NewStudent = Pick<MoodleUser, "id" | "username" | "email" | "firstname" | "lastname"> & { "password": string }

export type EnrollmentRequest = {
    userid: number;
    courseid: number;
    roleid?: number; // Optional, defaults to 5 (student role)
};

export type CreateAndEnrollRequest = Omit<NewStudent, "id"> & {
    courseid: number;
    roleid?: number; // Optional, defaults to 5 (student role)
};