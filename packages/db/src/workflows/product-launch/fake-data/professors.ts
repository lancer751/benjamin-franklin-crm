import { prisma } from "../../..";

export async function fakeProfessors() {
  return await Promise.all([
    prisma.professor.upsert({
      where: { email: "christiantorres@gmail.com" },
      update: {},
      create: {
        name: "Cristian",
        lastname: "Torres",
        cellphone: "987789534",
        email: "christiantorres@gmail.com",
        corporate_email: "bfprofe07@bf.edu.pe",
        moddle_account_id: 43,
      },
    }),
    prisma.professor.upsert({
      where: { email: "benitograbiel@gmail.com" },
      update: {},
      create: {
        name: "Benito",
        lastname: "Camelo",
        cellphone: "987124567",
        email: "benitograbiel@gmail.com",
        corporate_email: "bfprofe04@bf.edu.pe",
        moddle_account_id: 65,
      },
    }),
    prisma.professor.upsert({
      where: { email: "mariagomez@gmail.com" },
      update: {},
      create: {
        name: "Maria",
        lastname: "Gomez",
        cellphone: "912345678",
        email: "mariagomez@gmail.com",
        corporate_email: "bfprofe02@bf.edu.pe",
        moddle_account_id: 12,
      },
    }),
  ]);
}
