import { Prisma } from "@repo/database";
import { ConflictError, NotFoundError, type AppError } from "./app-error";

const FIELD_LABELS: Record<string, string> = {
  email: "correo electrónico",
  dni: "DNI",
  code: "código",
  edition_code: "código de edición",
  corporate_email: "correo corporativo",
};

export function mapPrismaError(err: unknown): AppError | null {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return null;

  switch (err.code) {
    case "P2002": {
      const target = (err.meta?.target as string[] | undefined) ?? [];
      const label = target[0] ? (FIELD_LABELS[target[0]] ?? target[0]) : "campo";
      return new ConflictError(`Ya existe un registro con ese ${label}`);
    }
    case "P2003":
      return new ConflictError(
        "No se puede completar la operación: el registro está referenciado por otros datos",
      );
    case "P2025":
      return new NotFoundError("Registro no encontrado");
    default:
      return null;
  }
}