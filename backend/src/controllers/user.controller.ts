
// export async function updateUser(req: Request, res: Response) {
//   const userId = req.params.id;
//   const {
//     apellido_materno,
//     apellido_paterno,
//     nombre,
//     email,
//     telefono,
//     roleId,
//     password,
//   } = req.body;

//   if (!userId || typeof userId !== "string") {
//     return res.status(400).json({ error: "Invalid user ID" });
//   }

//   try {
//     const existingUser = await prisma.usuario.findUnique({
//       where: { id: userId },
//     });

//     if(!existingUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const updatedUser = await prisma.usuario.update({
//       where: { id: userId },
//       data: {
//         apellido_materno,
//         apellido_paterno,
//         nombre,
//         email,
//         telefono: telefono ?? null,
//         role: roleId ? { connect: { id: roleId } } : undefined,
//         password,
//       },
//       select: {
//         id: true,
//         apellido_materno: true,
//         apellido_paterno: true,
//         nombre: true,
//         email: true,
//         telefono: true,
//         role: {
//           select: { nombre: true },
//         },
//       },
//     });
//     return res.json(updatedUser);
//   } catch (error) {
//     console.error(`Error updating user with id ${userId}:`, error);
//     return res.status(500).json({ error: "Failed to update user" });
//   }
// }
