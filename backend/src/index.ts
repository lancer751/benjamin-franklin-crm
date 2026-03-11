import app from "./app";

const port = Number(Bun.env.PORT ?? 5000);

const server = Bun.serve({
  port: port,
  fetch: app.fetch
});

console.log(`Server running at ${server.url}`);
console.log("NODE_ENV:", Bun.env.NODE_ENV);
// import express from "express";
// import dotevn from "dotenv";
// import cors from "cors";
// import nodemailer from "nodemailer";
// import userRoutes from "./routes/user.route";
// import courseRoutes from "./routes/course.route";
// import enrollmentRoutes from "./routes/enrollment.route";
// import webhookRoutes from "./routes/webhook.route";
// import customerRoutes from "./routes/customer.route";
// import orderRoutes from "./routes/order.route";
// import productRoutes from "./routes/product.route";
// import paymentRoutes from "./routes/payment.route";
// import dashboardRoutes from "./routes/dashboard.route";
// import reportRoutes from "./routes/report.route";
// import { prismaDBConnection } from "./config/connection";
// import path from "node:path";



// dotevn.config();
// const app = express();
// const PORT = process.env.PORT || 8000

// // middlewares
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// app.use("/api/users", userRoutes);
// app.use("/api/customers", customerRoutes);
// app.use("/api/courses", courseRoutes);
// app.use("/api/enrollments", enrollmentRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/payments", paymentRoutes);

// // Payment webhook for online payment using CULQUI
// app.use("/api/webhooks", webhookRoutes);

// // Dashboard & reports
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/reports", reportRoutes);

// export const emailTransporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.ethereal.email",
//   port: Number(process.env.SMTP_PORT) || 587,
//   secure: true,
//   auth: {
//     user: process.env.SMTP_USER || "ntgxltiwmeozkzp5@ethereal.email",
//     pass: process.env.SMTP_PASS || "ayd5NtbEM1gBn3D78p",
//   },
//   tls: { rejectUnauthorized: false },
// });

// prismaDBConnection();

// // Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, '../frontend/dist')));

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });
// export default app;