# Truveth

**Blockchain-based Certificate Generation & Verification System**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Network](https://img.shields.io/badge/Network-Polygon_Amoy-8247e5)](https://amoy.polygonscan.com)
[![Live](https://img.shields.io/badge/Live-truveth.vercel.app-brightgreen)](https://truveth.vercel.app)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.34-363636)](./contracts/Main.sol)

Truveth eliminates fake certificates by anchoring credential issuance to an immutable smart contract on Polygon. Every certificate is stored on-chain as a keccak256-hashed record, verifiable by anyone without trusting any central authority.

---

## Live Demo

[https://truveth.vercel.app](https://truveth.vercel.app)

---

## How It Works

```
Issuer (onlyOwner)
    |
    v
generateCertificate(id, name, org, course, batch_year)
    |
    +-- keccak256(id) --> bytes32 key
    |
    +-- stores Certificate struct on-chain
    |
    +-- emits certificateGenerated(bytes32 indexed _certificateId)
         |
         v
    Anyone calls getData(id)
         |
         v
    Returns: candidate_name, org_name, course_name, batch_year, blockNumber
```

The event `certificateGenerated` is the canonical source of truth for the transaction hash. The `blockNumber` stored in the struct allows reconstructing the on-chain timestamp without relying on mutable state.

---

## Smart Contract

**Contract:** `Certification` — [`contracts/Main.sol`](./contracts/Main.sol)

| Function | Access | Description |
|---|---|---|
| `generateCertificate(id, name, org, course, batch_year)` | `onlyOwner` | Issues a new certificate; reverts if ID already exists |
| `getData(id)` | `public view` | Returns all certificate fields + block number |

- Certificate IDs are hashed via `keccak256(abi.encodePacked(_id))` before storage
- `batch_year` must be >= 2026 (enforced at contract level)
- Duplicate issuance is rejected at the contract layer, not application layer

**Verified Contract on Polygon Amoy:**


> Contract Address: [0x2abab414ff2ece486f654f3e564c20e8d1cca1ee](https://amoy.polygonscan.com/address/0x2abab414ff2ece486f654f3e564c20e8d1cca1ee)

> Network: Polygon Amoy Testnet (Chain ID: 80002)

> Explorer: [https://amoy.polygonscan.com/address/0x2abab414ff2ece486f654f3e564c20e8d1cca1ee](https://amoy.polygonscan.com/address/0x2abab414ff2ece486f654f3e564c20e8d1cca1ee)


---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React) |
| Blockchain Client | Ethers.js |
| Smart Contract | Solidity ^0.8.34 |
| Dev Toolchain | Hardhat, Remix IDE |
| Network | Polygon Amoy Testnet |
| Deployment | Vercel |

---

## Project Structure

```
Truveth/
├── contracts/
│   └── Main.sol             # Certification smart contract
├── scripts/                 # Hardhat deploy scripts
├── test/                    # Contract test suite
├── src/                     # Next.js frontend
├── public/                  # Static assets
├── hardhat.config.js        # Hardhat + network config
├── next.config.js           # Next.js config
└── package.json
```

---

## Local Setup

### Prerequisites

- Node.js >= 18
- A wallet private key (for contract deployment)
- Polygon Amoy RPC endpoint (e.g., from Alchemy or Infura)

### Install & Run

```bash
git clone https://github.com/adysingh5711/Truveth.git
cd Truveth
npm install
npm run dev
```

### Deploy Contract

```bash
cp .env.example .env
# Add POLYGON_AMOY_PRIVATE_KEY, POLYGON_AMOY_RPC_URL and POLYGONSCAN_API_KEY to .env

npx hardhat compile
npx hardhat run scripts/deploy.js --network amoy
```

After deployment, verify on Polygonscan:

```bash
npx hardhat verify --network amoy <DEPLOYED_ADDRESS>
```

### Run Tests

```bash
npx hardhat test
```

---

## Environment Variables

```env
POLYGON_AMOY_PRIVATE_KEY=0xYourFull64HexPrivateKeyHere
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
POLYGONSCAN_API_KEY=YourPolygonscanApiKeyHere
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_CONTRACT_ADDRESS=<fill after deploy>
NEXT_PUBLIC_OWNER_ADDRESS=0xYourOwnerAddressHere
```

> Never commit `.env` to version control. It is already in `.gitignore`.

---

## Security Notes

- `onlyOwner` restricts issuance to the deployer (`creator`). For multi-issuer setups, replace with OpenZeppelin `AccessControl`.
- Original certificate ID strings are never stored in contract storage, only in calldata.
- No `deleteCertificate` by design. Revocation requires a separate on-chain flag.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: describe your change"`
4. Push and open a PR against `main`

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Author

Built by [adysingh5711](https://github.com/adysingh5711).  
If you find this useful, give it a star on [GitHub](https://github.com/adysingh5711/Truveth).