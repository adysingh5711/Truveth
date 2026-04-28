import type { HardhatViemHelpers } from "@nomicfoundation/hardhat-viem/dist/src/types.js";

declare module "hardhat/dist/src/types/network.js" {
    interface NetworkConnection<ChainTypeT extends string = "generic"> {
        viem: HardhatViemHelpers<ChainTypeT>;
    }
}