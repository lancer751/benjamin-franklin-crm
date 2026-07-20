// scripts/simulate-webhook.ts
import { envParsed } from "@/env";
import crypto from "crypto";

const APP_SECRET = envParsed.META_APP_SECRET;

const payload = {
  entry: [
    {
      id: "816432748447497",
      time: Math.floor(Date.now() / 1000),
      changes: [
        {
          field: "leadgen",
          value: {
            leadgen_id: "1064456686141869", // usa un ID real si quieres probar getLeadgenData
            form_id: "2785470368500268",
            page_id: "816432748447497",
            created_time: Math.floor(Date.now() / 1000),
          },
        },
      ],
    },
  ],
  object: "page",
};

const rawBody = JSON.stringify(payload);
const signature =
  "sha256=" + crypto.createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");

fetch("https://benjamin-franklin-crm-production-0f6b.up.railway.app/api/webhooks/meta/leadgen", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-hub-signature-256": signature,
  },
  body: rawBody,
}).then(async (res) => {
  console.log(res.status, await res.text());
});