import {hcWithType} from "backend" 

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
export const benjaminCrmApi = hcWithType(SERVER_URL).api