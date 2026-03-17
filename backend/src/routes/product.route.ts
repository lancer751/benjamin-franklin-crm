import { Hono } from "hono";
import prisma from "../lib/prisma";

export const productRoutes = new Hono()
  .get("/", async (c) => {
    try {
      const products = await prisma.producto.findMany({
        include: {
          edicion: {
            select: {
              curso: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true,
                  duracion_semanas: true,
                },
              },
              modalidad: {
                select: { nombre: true },
              },
              fecha_inicio: true,
              fecha_finalizacion: true,
            },
          },
        },
      });

      const formattedProducts = products.map((pr) => ({
        id: pr.id,
        precio: pr.precio,
        coursename: pr.edicion.curso.nombre,
        edicion_id: pr.edicion_id,
        duracion_semanas: pr.edicion.curso.duracion_semanas,
        modalidad: pr.edicion.modalidad.nombre,
        fecha_inicio: pr.edicion.fecha_inicio,
        fecha_finalizacion: pr.edicion.fecha_finalizacion,
        createdAt: pr.createdAt,
        updatedAt: pr.updatedAt,
      }));
      return c.json(formattedProducts, 200);
    } catch (error) {
      console.error("Error in getProducts", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    if (!id || typeof id !== "string") {
      return c.json({ message: "Invalid product ID" }, 400);
    }

    try {
      const existingProduct = await prisma.producto.findUnique({
        where: { id },
        include: {
          edicion: {
            include: {
              curso: true,
              modalidad: true,
            },
          },
        },
      });

      if (!existingProduct) {
        return c.json({ message: "Product not found" }, 404);
      }

      const formattedProduct = {
        id: existingProduct.id,
        coursename: existingProduct.edicion.curso.nombre,
        edicion_id: existingProduct.edicion.id,
        modalidad: existingProduct.edicion.modalidad.nombre,
        precio: existingProduct.precio,
        fecha_inicio: existingProduct.edicion.fecha_inicio,
        fecha_finalizacion: existingProduct.edicion.fecha_finalizacion,
        duracion_semanas: existingProduct.edicion.curso.duracion_semanas,
        moddle_course_id: existingProduct.edicion.moodle_course_id,
        createdAt: existingProduct.createdAt,
        updatedAt: existingProduct.updatedAt,
      };

      return c.json(formattedProduct, 200);
    } catch (error) {
      console.error("Error in getProductById", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  })
  .post("/", async (c) => {
    const {
      precio,
      curso_id,
      fecha_inicio,
      fecha_finalizacion,
      modalidad_id,
      moddle_course_id,
    } = await c.req.json();

    if (!precio || !curso_id || !modalidad_id) {
      return c.json({ message: "Missing required fields" }, 400);
    }

    try {
      const product = await prisma.producto.create({
        data: {
          precio: precio,
          edicion: {
            create: {
              curso_id: curso_id,
              modalidad_id: modalidad_id,
              fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
              fecha_finalizacion: fecha_finalizacion
                ? new Date(fecha_finalizacion)
                : null,
              moodle_course_id:
                moddle_course_id && moddle_course_id.length > 0
                  ? moddle_course_id
                  : null,
            },
          },
        },
        include: {
          edicion: {
            include: {
              curso: true,
              modalidad: true,
            },
          },
        },
      });

      const formattedProduct = {
        id: product.id,
        precio: product.precio,
        coursename: product.edicion.curso.nombre,
        edicion_id: product.edicion_id,
        duracion_semanas: product.edicion.curso.duracion_semanas,
        modalidad: product.edicion.modalidad.nombre,
        fecha_inicio: product.edicion.fecha_inicio,
        fecha_finalizacion: product.edicion.fecha_finalizacion,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      return c.json(formattedProduct, 201);
    } catch (error) {
      console.error("Error in createProduct", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  })
  .put("/:id", async (c) => {
    const id = c.req.param("id");
    const {
      precio,
      curso_id,
      fecha_inicio,
      fecha_finalizacion,
      modalidad_id,
      moddle_course_id,
    } = await c.req.json();

    if (!id || typeof id !== "string") {
      return c.json({ message: "Invalid product ID" }, 400);
    }

    if (!precio || !curso_id || !modalidad_id) {
      return c.json({ message: "Missing required fields" }, 400);
    }

    if (isNaN(Number(moddle_course_id))) {
      return c.json({ message: "Invalid moddle_course_id" }, 400);
    }

    try {
      const existingProduct = await prisma.producto.findUnique({
        where: { id },
      });

      const existingModalidad = await prisma.modalidad.findUnique({
        where: { id: modalidad_id },
      });

      if (!existingProduct) {
        return c.json({ message: "Product not found" }, 404);
      }

      if (!existingModalidad) {
        return c.json({ message: "Modalidad not found" }, 404);
      }

      console.log(moddle_course_id);
      const updatedProduct = await prisma.producto.update({
        where: { id },
        data: {
          precio: precio,
          edicion: {
            update: {
              curso_id: curso_id,
              modalidad_id: modalidad_id,
              fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
              fecha_finalizacion: fecha_finalizacion
                ? new Date(fecha_finalizacion)
                : null,
              moodle_course_id: Number(moddle_course_id),
            },
          },
        },
        include: {
          edicion: {
            include: {
              curso: true,
              modalidad: true,
            },
          },
        },
      });

      const formattedProduct = {
        id: updatedProduct.id,
        precio: updatedProduct.precio,
        coursename: updatedProduct.edicion.curso.nombre,
        duracion_semanas: updatedProduct.edicion.curso.duracion_semanas,
        modalidad: updatedProduct.edicion.modalidad.nombre,
        fecha_inicio: updatedProduct.edicion.fecha_inicio,
        fecha_finalizacion: updatedProduct.edicion.fecha_finalizacion,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt,
      };
      return c.json(formattedProduct, 200);
    } catch (error) {
      console.error("Error in updateProduct", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  });