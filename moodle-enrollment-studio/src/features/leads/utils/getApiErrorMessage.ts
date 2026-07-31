type ErrorRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is ErrorRecord => (
  typeof value === "object" && value !== null
);

const isTechnicalMessage = (message: string) => (
  /prisma|stack trace|constraint|database|\bP\d{4}\b|SQL/i.test(message)
);

const readableMessage = (value: unknown): string | null => {
  if (typeof value === "string") {
    const message = value.trim();
    return message && !isTechnicalMessage(message) ? message : null;
  }
  if (value instanceof Error) return readableMessage(value.message);
  if (!isRecord(value)) return null;
  return readableMessage(value.message) || readableMessage(value.error);
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => (
  readableMessage(error) || fallback
);
