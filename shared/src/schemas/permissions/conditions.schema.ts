// admin conditions

import z from "zod";
import { RoleAccessEnum, type RoleAccess } from "../users/users.index";

const availableResourcesEnum = z.enum([
  "ALL",
  "CAMPAIGN",
  "ORDER",
  "LEAD",
  "PRODUCT",
  "COURSE",
  "PROFESSOR",
  "EDITION",
  "CAMPAIGN_SELLER",
  "CAMPAIGN_MEMBER",
  "SELLER_PROFILE",
  "LEAD_INTERACTION",
  "PAYMENT",
]);

export type AvailableResources = z.infer<typeof availableResourcesEnum>;

const availableActions = z.enum([
  "READ",
  "UPDATE",
  "DELETE",
  "MANAGE", // capacity to do everything in whatever subject
  "APPROVE_DISCOUNT",
  "CANCEL_ORDER",
  // sales supervisor
  "REASSIGN_LEAD", // available on campaing subject
  "ASSIGN_LEAD", // available on campaing subject
  "DISABLE_SELLER_ACCESS", // available on SELLER profile subject
  "REASSIGN_SELLERS_CAMPAIGN",
  "ASSIGN_SELLERS_CAMPAIGN",
  "REASSIGN_CAMPAIGN_MEMBERS",
  "ASSIGN_CAMPAIGN_MEMBERS",
]);

// sales supervisor conditions
const salesSupervisorAvailableResourcesEnum = availableResourcesEnum.extract([
  "CAMPAIGN",
  "SELLER_PROFILE",
  "PRODUCT",
  "EDITION",
  "COURSE",
  "ORDER",
  "CAMPAIGN_SELLER",
  "CAMPAIGN_MEMBER",
]);

const salesRepAvailableResourcesEnum = availableResourcesEnum.extract([
  "ORDER",
  "LEAD",
  "LEAD_INTERACTION",
  "PAYMENT",
  "PRODUCT",
  "EDITION",
]);

// ─── Condition Schemas

const permissionsPerRoleSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("SALES_SUPERVISOR" as RoleAccess),
    
  }),
]);