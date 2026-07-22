import { PhoneType, type PrismaClient } from "@repo/database";
import type {
  CreateLeadInput,
  UpdateLeadInput,
  CreateCampaignMemberInput,
  UpdateCampaignMemberStatusInput,
  ReassignCampaignMemberInput,
  CreateLeadInteractionInput,
  CreateTaskInput,
  UpdateTaskInput,
  LeadQuery,
  CampaignMemberQuery,
  ReassignMultipleCampaignMembersInput,
} from "shared";
import type { LeadWhereInput } from "../../../packages/db/dist/generated/prisma/models";

export function leadRepository(prisma: PrismaClient) {
  return {
    //  Leads
    async lookupExact(phone?: string, email?: string, campaignId?: string) {
      const leadSelect = {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phones: {
          select: {
            number: true,
            type: true,
            isPrincipal: true,
          },
        },
        campaignsEngaging: {
          where: { campaing_id: campaignId ?? "" },
          select: { id: true },
          take: 1,
        },
      } as const;

      const [phoneLead, emailLead] = await Promise.all([
        phone
          ? prisma.lead.findFirst({
              where: {
                deleted_at: null,
                phones: { some: { number: phone } },
              },
              select: leadSelect,
            })
          : null,
        email
          ? prisma.lead.findFirst({
              where: {
                deleted_at: null,
                email: { equals: email, mode: "insensitive" },
              },
              select: leadSelect,
            })
          : null,
      ]);

      if (phoneLead && emailLead && phoneLead.id !== emailLead.id) {
        return { conflict: true as const };
      }

      const lead = phoneLead ?? emailLead;
      if (!lead) {
        return {
          conflict: false as const,
          found: false as const,
          matchedBy: null,
          lead: null,
          campaignMemberId: null,
        };
      }

      const matchedBy = phoneLead && emailLead
        ? "phone_and_email"
        : phoneLead
          ? "phone"
          : "email";

      return {
        conflict: false as const,
        found: true as const,
        matchedBy,
        lead: {
          id: lead.id,
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phones: lead.phones,
        },
        campaignMemberId: lead.campaignsEngaging[0]?.id ?? null,
      };
    },

    async findMany({
      page,
      limit,
      search,
      status,
      assigned_to,
      campaign_id,
      member_status,
      created_from,
      created_to,
    }: LeadQuery) {
      const skip = (page - 1) * limit;
      const andConditions: LeadWhereInput[] = [
        { deleted_at: null },
        { lead_status: status ?? "ACTIVE" },
      ];

      if (created_from || created_to) {
        const createdAtFilter: { gte?: Date; lte?: Date } = {};

        if (created_from) {
          createdAtFilter.gte = /^\d{4}-\d{2}-\d{2}$/.test(created_from)
            ? new Date(`${created_from}T00:00:00.000`)
            : new Date(created_from);
        }

        if (created_to) {
          createdAtFilter.lte = /^\d{4}-\d{2}-\d{2}$/.test(created_to)
            ? new Date(`${created_to}T23:59:59.999`)
            : new Date(created_to);
        }

        andConditions.push({ created_at: createdAtFilter });
      }

      if (search) {
        andConditions.push({
          OR: [
            { first_name: { contains: search, mode: "insensitive" as const } },
            { middle_name: { contains: search, mode: "insensitive" as const } },
            { last_name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { secondary_email: { contains: search, mode: "insensitive" as const } },
            { dni: { contains: search, mode: "insensitive" as const } },
            {
              phones: {
                some: { number: { contains: search, mode: "insensitive" as const } },
              },
            },
          ]
        });
      }

      const campaignMemberFilter = {
        ...(assigned_to && assigned_to !== "unassigned" && { assigned_to }),
        ...(campaign_id && { campaing_id: campaign_id }),
        ...(member_status && { status: member_status }),
      };

      if (assigned_to === "unassigned") {
        andConditions.push({
          campaignsEngaging: {
            none: {}
          }
        });
      } else if (Object.keys(campaignMemberFilter).length > 0) {
        andConditions.push({
          campaignsEngaging: {
            some: campaignMemberFilter,
          }
        });
      }

      const where: LeadWhereInput = {
        AND: andConditions
      };

      const includeMemberFilter = {
        ...(assigned_to && assigned_to !== "unassigned" && { assigned_to }),
        ...(campaign_id && { campaing_id: campaign_id }),
        ...(member_status && { status: member_status }),
      };

      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            phones: true,
            campaignsEngaging: {
              ...(Object.keys(includeMemberFilter).length > 0 && {
                where: includeMemberFilter,
              }),
              select: {
                id: true,
                status: true,
                is_primary: true,
                source: true,
                campaing: { select: { id: true, name: true, platform: true } },
                seller: {
                  select: {
                    id: true,
                    user: { select: { first_name: true, last_name: true } },
                  },
                },
              },
            },
          },
        }),
        prisma.lead.count({ where }),
      ]);

      return { leads, total, page, limit };
    },

    async findById(id: string) {
      return prisma.lead.findUnique({
        where: { id },
        include: {
          phones: true,
          campaignsEngaging: {
            include: {
              campaing: {
                select: { id: true, name: true, platform: true },
              },
              seller: {
                select: {
                  id: true,
                  user: { select: { first_name: true, last_name: true } },
                },
              },
              leadInteractions: {
                orderBy: { id: "desc" },
                include: {
                  seller: {
                    select: {
                      user: { select: { first_name: true, last_name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });
    },
    async create(data: CreateLeadInput) {
      const { phones, ...leadFields } = data;
      const principal = phones.find((p) => p.isPrincipal)!; // Zod guarantees exactly one

      const existing = await prisma.lead.findFirst({
        where: {
          OR: [
            { email: leadFields.email },
            {
              phones: {
                some: { number: principal.number, isPrincipal: true },
              },
            },
          ],
        },
        select: { id: true },
      });

      if (existing)
        throw {
          code: "CONFLICT",
          message: existing
            ? `Email or principal phone number is already registered`
            : undefined,
        };

      return prisma.lead.create({
        data: {
          ...leadFields,
          phones: { create: phones },
        },
        include: { phones: true },
      });
    },
    async update(id: string, data: UpdateLeadInput) {
      const { phones, ...leadFields } = data;

      if (leadFields.email) {
        const conflict = await prisma.lead.findFirst({
          where: { email: leadFields.email, NOT: { id } },
          select: { id: true },
        });
        if (conflict)
          throw {
            code: "CONFLICT",
            message: `Email "${leadFields.email}" is already in use`,
          };
      }

      if (leadFields.dni) {
        const conflict = await prisma.lead.findFirst({
          where: { dni: leadFields.dni, NOT: { id } },
          select: { id: true },
        });
        if (conflict)
          throw {
            code: "CONFLICT",
            message: `DNI "${leadFields.dni}" is already in use`,
          };
      }

      // Principal phone number uniqueness — checked before the transaction
      // so we fail fast without touching any rows
      if (phones) {
        const principal = phones.find((p) => p.isPrincipal);
        // Zod guarantees exactly one exists when `phones` is provided, but guard anyway
        if (principal) {
          const phoneConflict = await prisma.leadPhone.findFirst({
            where: {
              number: principal.number,
              isPrincipal: true,
              lead_id: { not: id },
            },
            select: { id: true, lead_id: true },
          });
          if (phoneConflict)
            throw {
              code: "CONFLICT",
              message: `Phone number "${principal.number}" is already registered as another lead's principal number`,
            };
        }
      }

      return prisma.$transaction(async (tx) => {
        const existingLead = await tx.lead.findUnique({
          where: { id },
          select: { id: true },
        });
        if (!existingLead)
          throw { code: "NOT_FOUND", message: "Lead not found" };

        if (Object.keys(leadFields).length > 0) {
          await tx.lead.update({ where: { id }, data: leadFields });
        }

        if (phones) {
          const existingPhones = await tx.leadPhone.findMany({
            where: { lead_id: id },
            select: { id: true },
          });
          const existingIds = new Set(existingPhones.map((p) => p.id));
          const incomingIds = new Set(
            phones.filter((p) => p.id).map((p) => p.id!),
          );

          const invalidIds = [...incomingIds].filter(
            (pid) => !existingIds.has(pid),
          );
          if (invalidIds.length > 0)
            throw {
              code: "INVALID",
              message: `Phone IDs do not belong to this lead: ${invalidIds.join(", ")}`,
            };

          const idsToDelete = [...existingIds].filter(
            (pid) => !incomingIds.has(pid),
          );
          if (idsToDelete.length > 0) {
            await tx.leadPhone.deleteMany({
              where: { id: { in: idsToDelete } },
            });
          }

          for (const phone of phones.filter((p) => p.id)) {
            await tx.leadPhone.update({
              where: { id: phone.id },
              data: {
                number: phone.number,
                type: phone.type,
                isPrincipal: phone.isPrincipal,
              },
            });
          }

          const newPhones = phones.filter((p) => !p.id);
          if (newPhones.length > 0) {
            await tx.leadPhone.createMany({
              data: newPhones.map((p) => ({
                lead_id: id,
                number: p.number,
                type: p.type,
                isPrincipal: p.isPrincipal,
              })),
            });
          }
        }

        return tx.lead.findUniqueOrThrow({
          where: { id },
          include: { phones: true },
        });
      });
    },
    async remove(id: string) {
      const lead = await prisma.lead.findUnique({
        where: { id },
        select: { id: true, deleted_at: true },
      });

      if (!lead) throw { code: "NOT_FOUND", message: "Lead not found" };
      if (lead.deleted_at)
        throw { code: "CONFLICT", message: "Lead is already deleted" };

      return prisma.lead.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
    },

    async restore(id: string) {
      const lead = await prisma.lead.findUnique({
        where: { id },
        select: { id: true, deleted_at: true },
      });

      if (!lead) throw { code: "NOT_FOUND", message: "Lead not found" };
      if (!lead.deleted_at)
        throw { code: "CONFLICT", message: "Lead is not deleted" };

      return prisma.lead.update({
        where: { id },
        data: { deleted_at: null },
      });
    },
    // ── CampaignMember ───────────────────────────────────────────────────────

    async findMembersByMember(campaignId: string, query: CampaignMemberQuery) {
      const { page, limit, status, assigned_to } = query;
      const skip = (page - 1) * limit;
      const where = {
        campaing_id: campaignId,
        ...(status && { status }),
        ...(assigned_to && { assigned_to }),
      };

      const [data, total] = await Promise.all([
        prisma.campaignMember.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            lead: { include: { phones: true } },
            seller: {
              select: {
                id: true,
                user: { select: { first_name: true, last_name: true } },
              },
            },
            _count: { select: { leadInteractions: true } },
          },
        }),
        prisma.campaignMember.count({ where }),
      ]);

      return { data, total, page, limit };
    },

    async createMember(data: CreateCampaignMemberInput) {
      // Verify lead and campaign exist
      const [lead, campaign, seller] = await Promise.all([
        prisma.lead.findUnique({
          where: { id: data.lead_id },
          select: { id: true },
        }),
        prisma.campaing.findUnique({
          where: { id: data.campaing_id },
          select: { id: true, status: true },
        }),
        prisma.sellerProfile.findUnique({
          where: { id: data.assigned_to },
          select: { id: true },
        }),
      ]);

      if (!lead) throw { code: "NOT_FOUND", message: "Lead not found" };
      if (!campaign) throw { code: "NOT_FOUND", message: "Campaign not found" };
      if (campaign.status !== "ACTIVE")
        throw {
          code: "INVALID",
          message: "Can only add leads to ACTIVE campaigns",
        };
      if (!seller) throw { code: "NOT_FOUND", message: "Seller not found" };

      // Check seller is assigned to this campaign
      const campaignSeller = await prisma.campaignSeller.findUnique({
        where: {
          campaign_id_seller_id: {
            campaign_id: data.campaing_id,
            seller_id: data.assigned_to,
          },
        },
      });
      if (!campaignSeller)
        throw {
          code: "INVALID",
          message: "Seller is not assigned to this campaign",
        };

      const existingMember = await prisma.campaignMember.findUnique({
        where: {
          lead_id_campaing_id: {
            lead_id: data.lead_id,
            campaing_id: data.campaing_id,
          },
        },
        select: { id: true },
      });
      if (existingMember) {
        throw {
          code: "LEAD_ALREADY_IN_CAMPAIGN",
          message: "Este prospecto ya está registrado en esta campaña.",
          campaignMemberId: existingMember.id,
        };
      }

      try {
        return await prisma.campaignMember.create({
          data: {
            lead_id: data.lead_id,
            campaing_id: data.campaing_id,
            assigned_to: data.assigned_to,
            source: data.source,
            is_primary: data.is_primary,
          },
          include: {
            lead: { include: { phones: true } },
            seller: {
              select: {
                id: true,
                user: { select: { first_name: true, last_name: true } },
              },
            },
          },
        });
      } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
          const member = await prisma.campaignMember.findUnique({
            where: {
              lead_id_campaing_id: {
                lead_id: data.lead_id,
                campaing_id: data.campaing_id,
              },
            },
            select: { id: true },
          });
          throw {
            code: "LEAD_ALREADY_IN_CAMPAIGN",
            message: "Este prospecto ya está registrado en esta campaña.",
            campaignMemberId: member?.id,
          };
        }
        throw error;
      }
    },

    async updateMemberStatus(
      memberId: string,
      { status }: UpdateCampaignMemberStatusInput,
    ) {
      return prisma.campaignMember.update({
        where: { id: memberId },
        data: { status },
      });
    },
    async reassignMembersBeforeRemove({
      member_ids,
      assigned_to,
    }: ReassignMultipleCampaignMembersInput) {
      // 1. Fetch all members being reassigned, keep only what's needed
      const members = await prisma.campaignMember.findMany({
        where: { id: { in: member_ids } },
        select: { id: true, campaing_id: true },
      });

      if (members.length !== member_ids.length) {
        const foundIds = new Set(members.map((m) => m.id));
        const missing = member_ids.filter((id) => !foundIds.has(id));
        throw {
          code: "NOT_FOUND",
          message: `Campaign member IDs not found: ${missing.join(", ")}`,
        };
      }

      // 2. Verify the target seller exists and is active
      const seller = await prisma.sellerProfile.findUnique({
        where: { id: assigned_to },
        select: { id: true, user: { select: { is_active: true } } },
      });
      if (!seller) throw { code: "NOT_FOUND", message: "Seller not found" };
      if (!seller.user.is_active)
        throw {
          code: "INVALID",
          message: "Cannot reassign leads to an inactive seller",
        };

      // 3. Verify seller is assigned to every distinct campaign in the selection
      const distinctCampaignIds = [
        ...new Set(members.map((m) => m.campaing_id)),
      ];

      const campaignSellerLinks = await prisma.campaignSeller.findMany({
        where: {
          seller_id: assigned_to,
          campaign_id: { in: distinctCampaignIds },
        },
        select: { campaign_id: true },
      });

      if (campaignSellerLinks.length !== distinctCampaignIds.length) {
        const linkedIds = new Set(
          campaignSellerLinks.map((l) => l.campaign_id),
        );
        const unlinked = distinctCampaignIds.filter((id) => !linkedIds.has(id));
        throw {
          code: "INVALID",
          message: `Seller is not assigned to campaign(s): ${unlinked.join(", ")}`,
        };
      }

      // 4. Perform the bulk reassignment
      await prisma.campaignMember.updateMany({
        where: { id: { in: member_ids } },
        data: { assigned_to },
      });

      return prisma.campaignMember.findMany({
        where: { id: { in: member_ids } },
        include: {
          lead: { include: { phones: true } },
          seller: {
            select: {
              id: true,
              user: { select: { first_name: true, last_name: true } },
            },
          },
        },
      });
    },
    async reassignMember(
      memberId: string,
      { assigned_to }: ReassignCampaignMemberInput,
    ) {
      // Find the member to get the campaign_id for validation
      const member = await prisma.campaignMember.findUnique({
        where: { id: memberId },
        select: { campaing_id: true },
      });
      if (!member)
        throw { code: "NOT_FOUND", message: "Campaign member not found" };

      // Verify new seller is in the campaign
      const campaignSeller = await prisma.campaignSeller.findUnique({
        where: {
          campaign_id_seller_id: {
            campaign_id: member.campaing_id,
            seller_id: assigned_to,
          },
        },
      });
      if (!campaignSeller)
        throw {
          code: "INVALID",
          message: "Target seller is not assigned to this campaign",
        };

      return prisma.campaignMember.update({
        where: { id: memberId },
        data: { assigned_to },
      });
    },

    // ── Interactions ─────────────────────────────────────────────────────────

    async createInteraction(
      memberId: string,
      sellerId: string,
      data: CreateLeadInteractionInput,
    ) {
      const member = await prisma.campaignMember.findUnique({
        where: { id: memberId },
        select: { lead_id: true },
      });
      if (!member)
        throw { code: "NOT_FOUND", message: "Campaign member not found" };

      return prisma.leadInteraction.create({
        data: {
          lead_id: member.lead_id,
          campaing_id: memberId,
          created_by: sellerId,
          notes: data.notes,
          type: data.type,
        },
      });
    },

    async findInteractions(memberId: string) {
      return prisma.leadInteraction.findMany({
        where: { campaing_id: memberId },
        orderBy: { id: "desc" },
        include: {
          seller: {
            select: {
              user: { select: { first_name: true, last_name: true } },
            },
          },
        },
      });
    },

    // ── Tasks ────────────────────────────────────────────────────────────────

    async findTasks(memberId: string) {
      return prisma.tasks.findMany({
        where: { campaign_member_id: memberId },
        orderBy: { due_date: "asc" },
      });
    },

    async createTask(
      memberId: string,
      sellerId: string,
      data: CreateTaskInput,
    ) {
      const member = await prisma.campaignMember.findUnique({
        where: { id: memberId },
        select: { lead_id: true },
      });
      if (!member)
        throw { code: "NOT_FOUND", message: "Campaign member not found" };

      return prisma.tasks.create({
        data: {
          ...data,
          lead_id: member.lead_id,
          campaign_member_id: memberId,
          created_by: sellerId,
        },
      });
    },

    async updateTask(taskId: string, data: UpdateTaskInput) {
      return prisma.tasks.update({
        where: { id: taskId },
        data,
      });
    },

    async deleteTask(taskId: string) {
      return prisma.tasks.delete({ where: { id: taskId } });
    },
  };
}
