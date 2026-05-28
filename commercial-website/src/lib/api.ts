import {hcWithType} from "backend" 
import {ECOMMERCE_API_URL} from "astro:env/client"

const SERVER_URL = ECOMMERCE_API_URL
export const benjaminCrmApi = hcWithType(SERVER_URL).api