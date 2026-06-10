import { Hono } from "hono";
import { read, utils } from "xlsx";
import { prisma } from "@repo/database";

export const bulkRouter = new Hono();

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Raw row shape coming from SheetJS.
 * Column headers may have trailing spaces (e.g. "Nombre ") — we handle
 * that in the helpers below rather than relying on exact key names.
 */
type ExcelRow = {
  [key: string]: unknown;
};

type SkippedRow = { rowIndex: number; reason: string };

type SheetResult = {
  sheet: string;
  created: number;
  existing: number;
  skipped: number;
  skippedRows: SkippedRow[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Trim a value to a string; return null if empty. */
const nullable = (v: unknown): string | null => {
  const s = String(v ?? "").trim();
  return s.length > 0 ? s : null;
};

/**
 * Case-insensitive column lookup with optional trailing-space tolerance.
 * Tries every key in the row whose normalised form matches any of the
 * provided candidate names.
 *
 * Example: getCol(row, ["nombre", "nombre "]) handles both "Nombre" and "Nombre "
 */
const getCol = (row: ExcelRow, candidates: string[]): unknown => {
  const lower = candidates.map((c) => c.toLowerCase().trim());
  for (const key of Object.keys(row)) {
    if (lower.includes(key.toLowerCase().trim())) {
      return row[key];
    }
  }
  return undefined;
};

/**
 * Digits-only phone; returns null if fewer than 7 digits (not a real number).
 */
const sanitisePhone = (raw: unknown): string | null => {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.length >= 7 ? digits : null;
};

/**
 * Synthetic email derived from phone number.
 *
 * Lead.email is @unique NOT NULL but the Excel has no email column.
 * Deriving it from the phone keeps the value stable across re-imports
 * and trivially identifiable as synthetic.
 */
const syntheticEmail = (phone: string): string => `lead_${phone}@import.local`;

// ─── Row processor ────────────────────────────────────────────────────────────

async function processRow(
  row: ExcelRow,
  rowIndex: number,
): Promise<
  { status: "created" | "existing" } | { status: "skipped"; reason: string }
> {
  // 1. Phone — the only hard requirement; used as deduplication key
  const rawPhone = getCol(row, ["celular", "celular ", "telefono", "phone"]);
  const phone = sanitisePhone(rawPhone);

  if (!phone) {
    return { status: "skipped", reason: "Missing or invalid phone number" };
  }

  const email = syntheticEmail(phone);

  // 2. Name fields — fall back to placeholders so the NOT NULL constraint is met
  const firstName =
    nullable(getCol(row, ["nombre", "nombre "])) ?? "Sin Nombre";
  const lastName =
    nullable(getCol(row, ["apellido", "apellidos"])) ?? "Sin Apellido";

  // 3. Check if lead already exists (by synthetic email = by phone)
  const existing = await prisma.lead.findUnique({ where: { email } });

  if (existing) {
    // On re-import, update placeholder names if real data is now available
    const needsUpdate =
      (existing.first_name === "Sin Nombre" && firstName !== "Sin Nombre") ||
      (existing.last_name === "Sin Apellido" && lastName !== "Sin Apellido");

    if (needsUpdate) {
      await prisma.lead.update({
        where: { email },
        data: {
          first_name:
            existing.first_name === "Sin Nombre" ? firstName : undefined,
          last_name:
            existing.last_name === "Sin Apellido" ? lastName : undefined,
        },
      });
    }

    return { status: "existing" };
  }

  // 4. Create new lead + phone record
  await prisma.lead.create({
    data: {
      first_name: firstName,
      middle_name: "", // NOT NULL in schema; no Excel source
      last_name: lastName,
      email,
      lead_status: "ACTIVE",
      phones: {
        create: {
          number: phone,
          type: "WHATSAPP",
        },
      },
    },
  });

  return { status: "created" };
}

// ─── Route ────────────────────────────────────────────────────────────────────

bulkRouter.post("/", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!(file instanceof Blob)) {
    return c.json({ error: "A file field named 'file' is required." }, 400);
  }

  const arrayBuffer = await file.arrayBuffer();

  let workbook;
  try {
    workbook = read(arrayBuffer, {
      type: "array",
      cellDates: false, // keep raw serial numbers; we don't need dates here
    });
  } catch {
    return c.json(
      { error: "Could not parse the Excel file. Is it a valid .xlsx / .xls?" },
      400,
    );
  }

  if (!workbook.SheetNames.length) {
    return c.json({ error: "The workbook contains no sheets." }, 400);
  }

  const results: SheetResult[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    const rows = utils.sheet_to_json<ExcelRow>(worksheet, {
      defval: null, // missing cells → null instead of undefined
      blankrows: false, // skip rows where every cell is empty
    });

    let created = 0;
    let existing = 0;
    let skipped = 0;
    const skippedRows: SkippedRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rowIndex = i + 2; // +1 for 1-based, +1 for header row

      const result = await processRow(row, rowIndex);

      if (result.status === "created") {
        created++;
      } else if (result.status === "existing") {
        existing++;
      } else if (result.status === "skipped") {
        skipped++;
        skippedRows.push({ rowIndex, reason: result.reason });
      }
    }

    results.push({ sheet: sheetName, created, existing, skipped, skippedRows });
  }

  const totals = results.reduce(
    (acc, r) => ({
      created: acc.created + r.created,
      existing: acc.existing + r.existing,
      skipped: acc.skipped + r.skipped,
    }),
    { created: 0, existing: 0, skipped: 0 },
  );

  return c.json({
    file: {
      name: (file as File).name ?? "unknown",
      sizeKb: +(file.size / 1024).toFixed(2),
    },
    summary: {
      sheetsProcessed: results.length,
      ...totals,
    },
    sheets: results,
  });
});

export default bulkRouter;
