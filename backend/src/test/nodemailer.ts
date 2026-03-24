import { emailTransporter } from "@/lib/nodemailer";

emailTransporter.verify()
  .then(() => console.log("SMTP READY"))
  .catch(err => console.error("SMTP ERROR:", err));