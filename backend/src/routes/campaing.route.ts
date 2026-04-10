import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import prisma from "@/lib/prisma";
import {
  createCampaignMemberSchema,
  createCampaingSchema,
  updateCampaingSchema,
} from "@/zod-schemas/campaing.schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { success } from "zod";

export const campaingRoutes = new Hono()
  .get("/", async (c) => {
    const campaings = await prisma.campaing.findMany({});
    return c.json(campaings, 200);
  })
  // campaign details
  .get(UUID_ROUTE, async (c) => {
    const { id } = c.req.param();
    const campaing = await prisma.campaing.findUnique({
      where: { id },
      omit: { edition_id: true },
      include: {
        edition: {
          select: {
            id: true,
            edition_code: true,
            edition_status: true,
            modality: { select: { name: true } },
            course: {
              select: { id: true, name: true },
            },
            edition_number: true,
          },
        },
        members: true,
      },
    });

    if (!campaing) {
      throw new HTTPException(404, { message: "Campaing not found" });
    }
    return c.json<SuccessResponse<typeof campaing>>({
      success: true,
      data: campaing,
      message: "Campaing found successfully",
    });
  })
  .post("/", zValidator("json", createCampaingSchema), async (c) => {
    const campaingData = c.req.valid("json");

    const newCampaing = await prisma.campaing.create({
      data: campaingData,
    });

    return c.json<SuccessResponse<typeof newCampaing>>(
      {
        success: true,
        data: newCampaing,
        message: "Campaing created successfully",
      },
      201,
    );
  })
  // add a lead or customer (campaign member) to the campaing
  .post(
    "/campaignsellers",
    zValidator("json", createCampaignMemberSchema),
    async (c) => {
      const campaignMemberData = c.req.valid("json")

      const campaignMember = await prisma.campaignMember.create({data: campaignMemberData})

      return c.json<SuccessResponse<typeof campaignMember>>({
        success: true,
        message: "lead/customer added to the campaign successfully",
        data: campaignMember
      });
    },
  )
  .put(UUID_ROUTE, zValidator("json", updateCampaingSchema), async (c) => {
    const { id } = c.req.param();
    const campaingData = c.req.valid("json");

    const existingCampaing = await prisma.campaing.findUnique({
      where: { id },
    });

    if (!existingCampaing) {
      throw new HTTPException(404, { message: "Campaing not found" });
    }

    const updatedCampaing = await prisma.campaing.update({
      where: { id },
      data: campaingData,
    });

    return c.json<SuccessResponse<typeof updatedCampaing>>({
      success: true,
      data: updatedCampaing,
      message: "Campaing updated successfully",
    });
  })
  .delete(UUID_ROUTE, async (c) => {
    const { id } = c.req.param();
    const deletedCampaing = await prisma.campaing.delete({
      where: { id },
    });

    return c.json<SuccessResponse<typeof deletedCampaing>>({
      success: true,
      data: deletedCampaing,
      message: "Campaing deleted successfully",
    });
  });
