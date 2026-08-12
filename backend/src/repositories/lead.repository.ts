import { type CampaignMemberWhereInput, type LeadWhereInput, type PrismaClient } from "@repo/database";
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



export function leadRepository(prisma: PrismaClient) {
  // TODO
  // create a repository for the sellers module in order to encapsulate the database logic and provide a clean interface for the rest of the application  

  // method to resolve the assigned user and check if the user is a seller and active
  const resolveAssignedUser = async (userId: string) => {
    const seller = await prisma.sellerProfile.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        user_id: true,
        user: {
          select: {
            is_active: true,
          },
        },
      },
    });

    if (!seller) {
      throw {
        code: "NOT_FOUND",
        message: "Seller profile not found for the selected user",
      };
    }

    return seller;
  };
  return {
    //  Leads generated from any source without being assigned to a campaign or a seller
    async findMany({ page, limit, search, status, campaign_id, assigned_to, from_date, to_date }: LeadQuery) {
      const skip = (page - 1) * limit;

      const fromDate = from_date ? new Date(from_date) : undefined;
      const toDateExclusive = to_date ? new Date(to_date) : undefined;
      if (toDateExclusive) {
        toDateExclusive.setUTCDate(toDateExclusive.getUTCDate() + 1);
      }

      const where: LeadWhereInput = {
        lead_status: status ?? "ACTIVE",
        ...(search && {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { first_name: { contains: search, mode: "insensitive" } },
            { last_name: { contains: search, mode: "insensitive" } },
            { phones: { some: { number: { contains: search } } } }
          ],
        }),
        ...((campaign_id || assigned_to) && {
          campaignsEngaging: {
            some: {
              ...(campaign_id && { campaing_id: campaign_id }),
              ...(assigned_to && { assigned_to }),
            }
          }
        }),
        ...((fromDate || toDateExclusive) && {
          created_at: {
            ...(fromDate && { gte: fromDate }),
            ...(toDateExclusive && { lt: toDateExclusive }),
          },
        }),
      };

      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            phones: true,
            _count: { select: { campaignsEngaging: true } },
          },
        }),
        prisma.lead.count({ where }),
      ]);

      const formattedLeads = leads.map(lead => ({ ...lead, assignedToCampaign: lead._count.campaignsEngaging > 0 }))
      return { leads: formattedLeads, total, page, limit };
    },
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

      const matchedBy =
        phoneLead && emailLead
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
              assignedUser: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                },
              },
              orders: {
                include: {
                  orderDetails: true
                }
              },
              leadInteractions: {
                orderBy: { id: "desc" },
                include: {
                  userCreator: {
                    select: {
                      id: true,
                      first_name: true,
                      last_name: true,
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
    async findManyMembers(query: CampaignMemberQuery) {
      const { page, limit, campaign_member_status, assigned_to } = query;
      const skip = (page - 1) * limit;
      const where: CampaignMemberWhereInput = {
        ...(campaign_member_status && { status: campaign_member_status }),
        ...(assigned_to && { assigned_to }),
      };

      const [members, total] = await Promise.all([
        prisma.campaignMember.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            lead: { include: { phones: true } },
            assignedUser: {
              select: {
                id: true,
                first_name: true,


                last_name: true,
              },
            },

            _count: { select: { leadInteractions: true } },
          },
        }),
        prisma.campaignMember.count({ where }),
      ]);

      return { members, total, page, limit };
    },
    async findMembersOnCampaign(campaignId: string, query: CampaignMemberQuery) {
      const { page, limit, campaign_member_status, assigned_to, from_date, to_date } = query;
      const skip = (page - 1) * limit;

      const fromDate = from_date ? new Date(from_date) : undefined;
      const toDateExclusive = to_date ? new Date(to_date) : undefined;
      if (toDateExclusive) {
        toDateExclusive.setUTCDate(toDateExclusive.getUTCDate() + 1);
      }

      const where: CampaignMemberWhereInput = {
        campaing_id: campaignId,
        ...(campaign_member_status && { status: campaign_member_status }),
        ...(assigned_to && { assigned_to }),
        ...((fromDate || toDateExclusive) && {
          created_at: {
            ...(fromDate && { gte: fromDate }),
            ...(toDateExclusive && { lt: toDateExclusive }),
          },
        }),
      };

      const [members, total] = await Promise.all([
        prisma.campaignMember.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            lead: { include: { phones: true } },
            assignedUser: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
            _count: { select: { leadInteractions: true } },
          },
        }),
        prisma.campaignMember.count({ where }),
      ]);

      return { members, total, page, limit };
    },
    async createMember(data: CreateCampaignMemberInput) {
      const [lead, campaign, seller] = await Promise.all([
        prisma.lead.findUnique({
          where: { id: data.lead_id },
          select: { id: true },
        }),
        prisma.campaing.findUnique({
          where: { id: data.campaing_id },
          select: { id: true, status: true },
        }),
        resolveAssignedUser(data.assigned_to),
      ]);

      if (!lead) {
        throw {
          code: "NOT_FOUND",
          message: "Lead not found",
        };
      }

      if (!campaign) {
        throw {
          code: "NOT_FOUND",
          message: "Campaign not found",
        };
      }

      if (campaign.status !== "ACTIVE") {
        throw {
          code: "INVALID",
          message: "Can only add leads to ACTIVE campaigns",
        };
      }

      if (!seller.user.is_active) {
        throw {
          code: "INVALID",
          message: "Cannot assign a lead to an inactive seller",
        };
      }

      // verify that the seller was assigned to the campaign
      const campaignSeller = await prisma.campaignSeller.findUnique({
        where: {
          campaign_id_seller_id: {
            campaign_id: data.campaing_id,
            seller_id: seller.id,
          },
        },
        select: {
          id: true,
        },
      });

      if (!campaignSeller) {
        throw {
          code: "INVALID",
          message: "Seller is not assigned to this campaign",
        };
      }

      const isLeadFirstCampaign = await prisma.lead.count({
        where: {
          campaignsEngaging: {
            some: {
              lead_id: data.lead_id,
            }
          }
        }
      })

      return prisma.campaignMember.create({
        data: {
          lead_id: data.lead_id,
          campaing_id: data.campaing_id,
          assigned_to: data.assigned_to,
          source: data.source,
          is_primary: isLeadFirstCampaign === 0,
        },
        include: {
          lead: {
            include: {
              phones: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
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
    async reassignMembersBeforeRemove({
      member_ids,
      assigned_to,
    }: ReassignMultipleCampaignMembersInput) {
      const [members, seller] = await Promise.all([
        prisma.campaignMember.findMany({
          where: {
            id: {
              in: member_ids,
            },
          },
          select: {
            id: true,
            campaing_id: true,
          },
        }),

        resolveAssignedUser(assigned_to),
      ]);

      if (members.length !== member_ids.length) {
        const foundIds = new Set(members.map((member) => member.id));
        const missingIds = member_ids.filter((id) => !foundIds.has(id));

        throw {
          code: "NOT_FOUND",
          message: `Campaign member IDs not found: ${missingIds.join(", ")}`,
        };
      }

      if (!seller.user.is_active) {
        throw {
          code: "INVALID",
          message: "Cannot reassign leads to an inactive seller",
        };
      }

      const distinctCampaignIds = [
        ...new Set(members.map((member) => member.campaing_id)),
      ];

      const campaignSellerLinks = await prisma.campaignSeller.findMany({
        where: {
          seller_id: seller.id,
          campaign_id: {
            in: distinctCampaignIds,
          },
        },
        select: {
          campaign_id: true,
        },
      });

      if (campaignSellerLinks.length !== distinctCampaignIds.length) {
        const assignedCampaignIds = new Set(
          campaignSellerLinks.map((link) => link.campaign_id),
        );

        const unassignedCampaignIds = distinctCampaignIds.filter(
          (campaignId) => !assignedCampaignIds.has(campaignId),
        );

        throw {
          code: "INVALID",
          message: `Seller is not assigned to campaign(s): ${unassignedCampaignIds.join(", ")}`,
        };
      }

      await prisma.campaignMember.updateMany({
        where: {
          id: {
            in: member_ids,
          },
        },
        data: {
          assigned_to,
        },
      });

      return prisma.campaignMember.findMany({
        where: {
          id: {
            in: member_ids,
          },
        },
        include: {
          lead: {
            include: {
              phones: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });
    },
    async reassignMember(
      memberId: string,
      { assigned_to }: ReassignCampaignMemberInput,
    ) {
      const [member, seller] = await Promise.all([
        prisma.campaignMember.findUnique({
          where: { id: memberId },
          select: {
            id: true,
            campaing_id: true,
          },
        }),

        resolveAssignedUser(assigned_to),
      ]);

      if (!member) {
        throw {
          code: "NOT_FOUND",
          message: "Campaign member not found",
        };
      }

      if (!seller.user.is_active) {
        throw {
          code: "INVALID",
          message: "Cannot reassign a lead to an inactive seller",
        };
      }

      const campaignSeller = await prisma.campaignSeller.findUnique({
        where: {
          campaign_id_seller_id: {
            campaign_id: member.campaing_id,
            seller_id: seller.id,
          },
        },
        select: {
          id: true,
        },
      });

      if (!campaignSeller) {
        throw {
          code: "INVALID",
          message: "Target seller is not assigned to this campaign",
        };
      }

      return prisma.campaignMember.update({
        where: {
          id: memberId,
        },
        data: {
          assigned_to,
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
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
          userCreator: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });
    },
    async findTasks(memberId: string) {
      return prisma.tasks.findMany({
        where: { campaign_member_id: memberId },
        select: {
          id: true,
          title: true,
          content: true,
          is_done: true,
          due_date: true,
          campaign_member_id: true,
          created_by: true,
          author: {
            select: {
              first_name: true,
              last_name: true
            }
          },
          created_at: true,
          updated_at: true
        },
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
