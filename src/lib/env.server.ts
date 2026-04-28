import { z } from "zod";

// Runtime guard — throws if accessed from browser bundle
if (typeof window !== "undefined") {
  throw new Error("env.server.ts must not be imported in client-side code.");
}

const schema = z.object({
  POLYGON_AMOY_PRIVATE_KEY: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Private key must be 0x + 64 hex chars"),
  POLYGON_AMOY_RPC_URL: z
    .string()
    .url()
    .startsWith("https://"),
  POLYGONSCAN_API_KEY: z
    .string()
    .min(10),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid server environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Fix server env variables before starting.");
}

export const serverConfig = parsed.data;