import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address"),
  NEXT_PUBLIC_OWNER_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid owner address"),
  NEXT_PUBLIC_CHAIN_ID: z
    .string()
    .regex(/^\d+$/, "Chain ID must be a number")
    .transform(Number),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  NEXT_PUBLIC_OWNER_ADDRESS:    process.env.NEXT_PUBLIC_OWNER_ADDRESS,
  NEXT_PUBLIC_CHAIN_ID:       process.env.NEXT_PUBLIC_CHAIN_ID,
});

if (!parsed.success) {
  console.error("❌ Invalid client environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Fix NEXT_PUBLIC_ env variables before starting.");
}

export const clientConfig = parsed.data;