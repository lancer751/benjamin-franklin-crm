import { describe, expect, it } from "vitest";
import { adaptSingleOrderResponse } from "./orderAdapter";

describe("order detail adapter", () => {
  it("normalizes data.orders, member.lead and orderDetails product data", () => {
    const response = adaptSingleOrderResponse({
      success: true,
      message: "Orders retrieved",
      data: {
        orders: [{
          id: "8b572281-cacd-4e09-9d82-d3ab3f92faea",
          member_id: "b7601f11-b7e1-4c42-9a9f-5fc9418bcad2",
          generated_by: "893094d6-8002-4a70-b9cd-97245779d812",
          assigned_to: "893094d6-8002-4a70-b9cd-97245779d812",
          sub_total: "2700",
          total_amount: "2700",
          discount: "0",
          order_status: "PENDING",
          order_code: "DIYIDTZ",
          created_at: "2026-08-05T15:22:06.583Z",
          updated_at: "2026-08-05T15:22:06.583Z",
          orderDetails: [{
            base_price: "2700",
            discount_amount: "0",
            price: "2700",
            payment_modality: "FULL",
            product: {
              id: "9babcb55-226f-4f53-871e-ab96517b9ea2",
              name: "CONTROL DE CALIDAD EN LA INDUSTRIA TEXTIL",
              category: { name: "Construcción e Ingeniería" },
              image_url: "https://example.com/product.jpg",
            },
            discountCode: null,
            paymentPlan: null,
          }],
          member: {
            id: "b7601f11-b7e1-4c42-9a9f-5fc9418bcad2",
            campaing_id: "72071c4e-9961-4a1d-b37b-cfbe10911a22",
            lead: {
              id: "5b267ce0-43a2-4684-a38b-28f1050e3336",
              first_name: "Angel",
              last_name: "Gallardo",
            },
          },
          userCreator: {
            id: "893094d6-8002-4a70-b9cd-97245779d812",
            first_name: "Ana ",
            last_name: "Romero Romero",
          },
          assignedUser: {
            id: "893094d6-8002-4a70-b9cd-97245779d812",
            first_name: "Ana ",
            last_name: "Romero Romero",
          },
        }],
      },
    });

    expect(response.data).toMatchObject({
      id: "8b572281-cacd-4e09-9d82-d3ab3f92faea",
      orderCode: "DIYIDTZ",
      status: "PENDING",
      subtotal: "2700",
      discountAmount: "0",
      total: "2700",
      memberId: "b7601f11-b7e1-4c42-9a9f-5fc9418bcad2",
      campaignId: "72071c4e-9961-4a1d-b37b-cfbe10911a22",
      leadId: "5b267ce0-43a2-4684-a38b-28f1050e3336",
      leadName: "Angel Gallardo",
      assignedUserName: "Ana Romero Romero",
      creatorName: "Ana Romero Romero",
    });
    expect(response.data.items).toEqual([expect.objectContaining({
      productId: "9babcb55-226f-4f53-871e-ab96517b9ea2",
      productName: "CONTROL DE CALIDAD EN LA INDUSTRIA TEXTIL",
      categoryName: "Construcción e Ingeniería",
      imageUrl: "https://example.com/product.jpg",
      basePrice: "2700",
      discountAmount: "0",
      finalPrice: "2700",
      paymentModality: "FULL",
      discountCode: null,
      paymentPlan: null,
    })]);
  });
});
