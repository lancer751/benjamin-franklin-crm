import { z } from "zod";
import { UUIDField } from "./helpers";
import { CampaignPlatformSchema } from "./campaing.schema";

// ── Shared date range, reutilizado por los 4 reportes ──────────────────────

const DateRangeFieldsSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

function withDateRangeCheck<T extends typeof DateRangeFieldsSchema>(schema: T) {
  return schema.refine(
    (data) => !data.from || !data.to || data.from <= data.to,
    { message: "'from' date must be before or equal to 'to' date", path: ["to"] },
  );
}

// ── Marketing ────────────────────────────────────────────────────────────

export const MarketingReportQuerySchema = withDateRangeCheck(
  DateRangeFieldsSchema.extend({
    campaign_id: UUIDField.optional(),
    platform: CampaignPlatformSchema.optional(),
  }),
);

// ── Sales ────────────────────────────────────────────────────────────────

export const SalesReportQuerySchema = withDateRangeCheck(
  DateRangeFieldsSchema.extend({
    seller_id: UUIDField.optional(),
    campaign_id: UUIDField.optional(),
  }),
);

// ── Collections ──────────────────────────────────────────────────────────

export const CollectionsReportQuerySchema = withDateRangeCheck(
  DateRangeFieldsSchema.extend({
    seller_id: UUIDField.optional(),
  }),
);

// ── Meta ─────────────────────────────────────────────────────────────────

export const MetaReportQuerySchema = withDateRangeCheck(
  DateRangeFieldsSchema.extend({
    campaign_id: UUIDField.optional(),
  }),
);

export type MarketingReportQuery = z.infer<typeof MarketingReportQuerySchema>;
export type SalesReportQuery = z.infer<typeof SalesReportQuerySchema>;
export type CollectionsReportQuery = z.infer<typeof CollectionsReportQuerySchema>;
export type MetaReportQuery = z.infer<typeof MetaReportQuerySchema>;