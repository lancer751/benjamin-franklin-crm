import type { Request, Response } from "express";
import { prisma } from "../config/connection";

export async function getProducts(req: Request, res: Response) {
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
    return res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error in getProducts", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getProductById(req: Request, res: Response) {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid product ID" });
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
      return res.status(404).json({ message: "Product not found" });
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

    return res.status(200).json(formattedProduct);
  } catch (error) {
    console.error("Error in getProductById", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createProduct(req: Request, res: Response) {
  const {
    precio,
    curso_id,
    fecha_inicio,
    fecha_finalizacion,
    modalidad_id,
    moddle_course_id,
  } = req.body;

  if (!precio || !curso_id || !modalidad_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Create a product and a Edition in the same query
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

    return res.status(201).json(formattedProduct);
  } catch (error) {
    console.error("Error in createProduct", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const {
    precio,
    curso_id,
    fecha_inicio,
    fecha_finalizacion,
    modalidad_id,
    moddle_course_id,
  } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  if (!precio || !curso_id || !modalidad_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (isNaN(Number(moddle_course_id))) {
    return res.status(400).json({ message: "Invalid moddle_course_id" });
  }

  try {
    const existingProduct = await prisma.producto.findUnique({
      where: { id },
    });

    const existingModalidad = await prisma.modalidad.findUnique({
      where: { id: modalidad_id },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!existingModalidad) {
      return res.status(404).json({ message: "Modalidad not found" });
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
    return res.status(200).json(formattedProduct);
  } catch (error) {
    console.error("Error in updateProduct", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
