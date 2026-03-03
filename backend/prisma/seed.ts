import { Prisma, CompraEstado, PagoEstado, MetodoPago, MatriculaEstado } from "../generated/prisma/client";
import { prisma } from "../src/config/connection";
import { faker } from "@faker-js/faker";

function generateOrderNumber() {
  return faker.string.alphanumeric(10).toUpperCase();
}

async function main() {
  console.log("🌱 Seeding database...");

  /* =======================================================
     ROLES
  ======================================================= */

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { nombre: "ventas" },
      update: {},
      create: { nombre: "ventas", descripcion: "Rol para vendedores" },
    }),
    prisma.role.upsert({
      where: { nombre: "administrador" },
      update: {},
      create: { nombre: "administrador", descripcion: "Rol administrador" },
    }),
    prisma.role.upsert({
      where: { nombre: "finanzas" },
      update: {},
      create: { nombre: "finanzas", descripcion: "Rol finanzas" },
    }),
  ]);

  const ventasRole = roles.find(r => r.nombre === "ventas")!;

  /* =======================================================
     USUARIOS (VENDEDORES)
  ======================================================= */

  const vendedores = await Promise.all(
    Array.from({ length: 3 }).map(() =>
      prisma.usuario.create({
        data: {
          nombre: faker.person.firstName(),
          apellido_paterno: faker.person.lastName(),
          apellido_materno: faker.person.lastName(),
          email: faker.internet.email().toLowerCase(),
          telefono: `9${faker.string.numeric(8)}`,
          password: "hashedpassword",
          role_id: ventasRole.id,
        },
      })
    )
  );

  /* =======================================================
     MODALIDADES
  ======================================================= */

  const modalidades = await Promise.all([
    prisma.modalidad.upsert({
      where: { nombre: "virtual" },
      update: {},
      create: { nombre: "virtual" },
    }),
    prisma.modalidad.upsert({
      where: { nombre: "presencial" },
      update: {},
      create: { nombre: "presencial" },
    }),
    prisma.modalidad.upsert({
      where: { nombre: "hibrido" },
      update: {},
      create: { nombre: "hibrido" },
    }),
  ]);

  /* =======================================================
     CURSOS + EDICIONES + PRODUCTOS
  ======================================================= */

  const productos = [];

  for (let i = 0; i < 5; i++) {
    const curso = await prisma.curso.create({
      data: {
        nombre: faker.company.catchPhrase(),
        descripcion: faker.lorem.sentence(),
        duracion_semanas: faker.number.int({ min: 4, max: 16 }),
        status: "activo",
      },
    });

    const fechaInicio = faker.date.future();
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 60);

    const edicion = await prisma.edicion.create({
      data: {
        curso_id: curso.id,
        modalidad_id: faker.helpers.arrayElement(modalidades).id,
        fecha_inicio: fechaInicio,
        fecha_finalizacion: fechaFin,
        moodle_course_id: faker.string.uuid(),
      },
    });

    const producto = await prisma.producto.create({
      data: {
        edicion_id: edicion.id,
        precio: new Prisma.Decimal(
          faker.number.float({ min: 200, max: 1500, fractionDigits: 2 })
        ),
      },
    });

    productos.push({ producto, edicion });
  }

  /* =======================================================
     CLIENTES
  ======================================================= */

  const clientes = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.cliente.create({
        data: {
          nombre: faker.person.firstName(),
          apellido_paterno: faker.person.lastName(),
          apellido_materno: faker.person.lastName(),
          telefono: `9${faker.string.numeric(8)}`,
          email: faker.internet.email().toLowerCase(),
          dni: faker.string.numeric(8),
          credentials_sent: faker.datatype.boolean(),
        },
      })
    )
  );

  /* =======================================================
     COMPRAS + DETALLES + PAGOS + MATRICULAS
  ======================================================= */

  for (let i = 0; i < 15; i++) {
    const cliente = faker.helpers.arrayElement(clientes);
    const vendedor = faker.helpers.arrayElement(vendedores);
    const { producto, edicion } = faker.helpers.arrayElement(productos);

    const estadoCompra = faker.helpers.arrayElement(Object.values(CompraEstado));
    const precio = producto.precio;

    const compra = await prisma.compra.create({
      data: {
        cliente_id: cliente.id,
        vendedor_id: vendedor.id,
        costo_total: precio,
        estado_order: estadoCompra,
        numero_order: generateOrderNumber(),
      },
    });

    await prisma.detalleCompra.create({
      data: {
        producto_id: producto.id,
        compra_id: compra.id,
        costo_unitario: precio,
      },
    });

    const estadoPago = faker.helpers.arrayElement(Object.values(PagoEstado));
    const metodo = faker.helpers.arrayElement(Object.values(MetodoPago));

    await prisma.pago.create({
      data: {
        orden_id: compra.id,
        cantidad: precio,
        estado: estadoPago,
        metodo_pago: metodo,
        codigo_transaccion: faker.string.alphanumeric(12).toUpperCase(),
        fecha_pago: faker.date.recent(),
      },
    });

    // If paid → create matrícula
    if (estadoCompra === "pagado") {
      await prisma.matricula.create({
        data: {
          cliente_id: cliente.id,
          edicion_id: edicion.id,
          estado: MatriculaEstado.activo,
        },
      });
    }
  }

  console.log("✅ Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });