"use client"

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import { FaWallet, FaEthereum } from "react-icons/fa";
import { getProviderAndSigner, assertCorrectNetwork } from "@/utils/ethereum";
import { ethers } from "ethers";
import Image from "next/image";

const DashboardHeader = (): React.JSX.Element => {
  const router = useRouter();
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    const fetchWalletInfo = async (): Promise<void> => {
      try {
        await assertCorrectNetwork();
        const result = await getProviderAndSigner();
        if (!result) return;
        const { signer, provider } = result;

        const userAddress = await signer.getAddress();
        setAddress(userAddress);

        // ethers v6: provider.getBalance(), not signer.getBalance()
        // ethers.utils.formatEther removed — use ethers.formatEther directly
        const userBalance = await provider.getBalance(userAddress);
        setBalance(parseFloat(ethers.formatEther(userBalance)).toFixed(4));
      } catch (err) {
        console.error("Failed to load wallet info", err);
      }
    };

    fetchWalletInfo();
  }, []);

  return (
    <HeaderContainer>
      <Brand onClick={() => router.push("/dashboard")}>
        <Image src="/images/Truveth-logo.svg" alt="Truveth" width={180} height={70} />
      </Brand>

      <WalletSection>
        <WalletItem>
          <FaWallet />
          <span>
            {address
              ? `${address.substring(0, 6)}...${address.substring(38)}`
              : "Not Connected"}
          </span>
        </WalletItem>
        <WalletItem>
          <FaEthereum />
          <span>{balance || "0.0000"} MATIC</span>
        </WalletItem>
      </WalletSection>
    </HeaderContainer>
  );
};

export default DashboardHeader;

const HeaderContainer = styled.div`
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: 95%;
  max-width: 1400px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  background: var(--glass-bg);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: 50px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: opacity 0.3s;
  &:hover { opacity: 0.8; }
`;

const WalletSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const WalletItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  padding: 0.5rem 1.2rem;
  border-radius: 30px;
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.5);
  svg { color: var(--accent-color); }
`;