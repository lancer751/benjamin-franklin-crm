export type MoodleErrorResponse = {
    exception?: string;
    errorcode?: string;
    message?: string;
};

export interface EnrolledStudentsPerCourse {
    id:                   number;
    username:             string;
    firstname:            string;
    lastname:             string;
    fullname:             string;
    email:                string;
    department:           Department;
    firstaccess:          number;
    lastaccess:           number;
    lastcourseaccess:     number;
    description?:         string;
    descriptionformat?:   number;
    profileimageurlsmall: string;
    profileimageurl:      string;
    roles:                string[];
    city?:                string;
    country?:             Country;
    enrolledcourses?:     Enrolledcourse[];
    idnumber?:            string;
    institution?:         Institution;
    preferences?:         Preference[];
}

export enum Country {
    Ax = "AX",
    Ch = "CH",
    Fi = "FI",
    Fr = "FR",
    Mq = "MQ",
    PE = "PE",
    Us = "US",
    Ws = "WS",
}

export enum Department {
    Empty = "",
    Lima = "LIMA",
}

export interface Enrolledcourse {
    id:        number;
    fullname:  string;
    shortname: string;
}

export enum Institution {
    Bf = "BF",
    CebaBf = "CEBA BF",
    Cebabbf = "CEBABBF",
}

export interface Preference {
    name:  string;
    value: number | string;
}
