import type { Request, Response } from "express";
import { prisma } from "../config/connection";


export async function getAllCustomers(req: Request, res: Response) {
  try {
    const customers = await prisma.cliente.findMany({
      select: {
        id: true,
        apellido_materno: true,
        apellido_paterno: true,
        nombre: true,
        email: true,
        telefono: true,
        dni: true,
        moodle_user_id: true,
        credentials_sent: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({ error: "Failed to fetch customers" });
  }
}

export async function createNewCustomer(req: Request, res: Response) {
  const { nombre, apellido_paterno, apellido_materno, email, telefono, dni } = req.body;

  try {
    const newCustomer = await prisma.cliente.create({
      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        email,
        telefono,
        dni
      }
    });
    return res.status(201).json(newCustomer);
  } catch (error) {
    console.error("Error in createNewCustomer", error)
    return res.status(500).json({ error: "Failed to create customer" })
  }
}

export async function getSingleCustomer(req: Request, res: Response) {
  const { id } = req.params;
  console.log(typeof id)
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid customer ID" });
  }

  try {
    const customer = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    return res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return res.status(500).json({ error: "Failed to fetch customer" });
  }
}

export async function updateCustomer(req: Request, res: Response) {
  const { id } = req.params;
  const { nombre, apellido_paterno, apellido_materno, email, telefono, dni } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid customer ID" });
  }

  try {
    const updatedCustomer = await prisma.cliente.update({
      where: { id },
      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        email,
        telefono,
        dni
      }
    });
    return res.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(500).json({ error: "Failed to update customer" });
  }
}