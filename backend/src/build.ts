await Bun.build({
  entrypoints: [
    "./src/index.ts",
    "./src/controllers/course.controller.ts",
    "./src/controllers/user.controller.ts",
    "./src/controllers/customer.controller.ts",
    "./src/controllers/dashboard.controller.ts",
    "./src/controllers/enrollment.controller.ts",
    "./src/controllers/order.controller.ts",
    "./src/controllers/payment.controller.ts",
    "./src/controllers/product.controller.ts",
    /**routes */
    "./src/routes/course.route.ts",
    "./src/routes/user.route.ts",
    "./src/routes/customer.route.ts",
    "./src/routes/dashboard.route.ts",
    "./src/routes/enrollment.route.ts",
    "./src/routes/order.route.ts",
    "./src/routes/payment.route.ts",
    "./src/routes/product.route.ts",
    /**services */
    "./src/services/email.service.ts",
    "./src/services/enrollment.service.ts",
    "./src/services/moodle.service.ts",
    "./src/services/payment.service.ts",
    /**types */
    "./src/types/course.ts",
    "./src/types/moodle.ts",
    "./src/types/order.type.ts",
    "./src/types/user.ts",
    /**middleware */
    "./src/middleware/admin.middleware",
    /**helpers */
    "./src/helpers/course.helper.ts",
    "./src/helpers/moodle.helper.ts",
    "./src/helpers/user.helper.ts",
    /**config */
    "./src/config/connection.ts",

  ],
  packages: "external",
  outdir: "./dist",
  target: "bun",
  format: "esm",
  env: "disable",
  sourcemap: "external",
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true,
  },
  external: ["*"],
  root: "./src"
});
