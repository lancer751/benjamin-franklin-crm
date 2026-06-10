export interface MockCampaign {
  id: string;
  campaing_name: string;
  platform: string;
  initial_budget: number;
  total_spent: number;
  status: "ACTIVE" | "PAUSED" | "INACTIVE";
  start_date: string;
  end_date: string | null;
  is_organic: boolean;
  product_id: string;
  relatedProduct?: {
    id: string;
    name: string;
    slug: string;
    sales_status: string;
  };
  sellers?: Array<{
    id: string;
    seller_id: string;
    campaign_id: string;
  }>;
}

export const mockCampaigns: MockCampaign[] = [
  {
    id: "camp-mock-001",
    campaing_name: "Meta Ads - Especialización React Frontend",
    platform: "FACEBOOK",
    initial_budget: 1500,
    total_spent: 650,
    status: "ACTIVE",
    start_date: "2026-05-01T00:00:00.000Z",
    end_date: "2026-08-30T00:00:00.000Z",
    is_organic: false,
    product_id: "prod-mock-1",
    relatedProduct: {
      id: "prod-mock-1",
      name: "Especialización React Frontend",
      slug: "react-frontend",
      sales_status: "ACTIVE"
    },
    sellers: []
  },
  {
    id: "camp-mock-002",
    campaing_name: "Instagram Ads - UX/UI Design Academy",
    platform: "INSTAGRAM",
    initial_budget: 1200,
    total_spent: 1200,
    status: "PAUSED",
    start_date: "2026-04-10T00:00:00.000Z",
    end_date: "2026-06-10T00:00:00.000Z",
    is_organic: false,
    product_id: "prod-mock-2",
    relatedProduct: {
      id: "prod-mock-2",
      name: "UX/UI Design Academy",
      slug: "ux-ui-design",
      sales_status: "ACTIVE"
    },
    sellers: []
  },
  {
    id: "camp-mock-003",
    campaing_name: "TikTok Leads - Introducción a Node.js",
    platform: "TIKTOK",
    initial_budget: 800,
    total_spent: 0,
    status: "INACTIVE",
    start_date: "2026-06-01T00:00:00.000Z",
    end_date: "2026-07-01T00:00:00.000Z",
    is_organic: false,
    product_id: "prod-mock-3",
    relatedProduct: {
      id: "prod-mock-3",
      name: "Curso de Node.js",
      slug: "intro-nodejs",
      sales_status: "ACTIVE"
    },
    sellers: []
  }
];
