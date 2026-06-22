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
} from "shared";
import type { LeadWhereInput } from "../../../packages/db/dist/generated/prisma/models";

export function leadRepository(prisma: PrismaClient) {
  return {
    //  Leads
    async findMany({ page, limit, search, status }: LeadQuery) {
      const skip = (page - 1) * limit;
      const where: LeadWhereInput = search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" as const } },
              {
                first_name: { contains: search, mode: "insensitive" as const },
              },
              { last_name: { contains: search, mode: "insensitive" as const } },
              
            ],
            AND: [
              {lead_status: status ?? "ACTIVE"}
            ]
          }
        : {};

      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            phones: true,
            campaignsEngaging: {
              select: {
                id: true,
                status: true,
                is_primary: true,
                campaing: { select: { id: true, name: true } },
                seller: {
                  select: {
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
      // Check phone type telephone uniqueness
      const existing = await prisma.lead.findFirst({
        where: {
          OR: [
            { email: data.email },
            ...data.phones
              .filter((p) => p.type === "TELEPHONE")
              .map((p) => ({
                phones: {
                  some: {
                    number: p.number,
                    type:  PhoneType.TELEPHONE,
                  },
                },
              })),
          ],
        },
        select: { id: true },
      });

      if (existing)
        throw {
          code: "CONFLICT",
          message: `Email "${data.email}" is already registered`,
        };

      const { phones, ...leadFields } = data;
      return prisma.lead.create({
        data: {
          ...leadFields,
          phones: { create: phones },
        },
        include: { phones: true },
      });
    },

    async update(id: string, data: UpdateLeadInput) {
      if (data.email) {
        const conflict = await prisma.lead.findFirst({
          where: { email: data.email, NOT: { id } },
          select: { id: true },
        });
        if (conflict)
          throw {
            code: "CONFLICT",
            message: `Email "${data.email}" is already in use`,
          };
      }
      return prisma.lead.update({ where: { id }, data });
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

      return prisma.campaignMember.create({
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
