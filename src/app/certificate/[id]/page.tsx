"use client"

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useRouter } from "next/navigation";
import { Certification__factory } from "@/typechain-types";
import { JsonRpcProvider } from "ethers";
import { getProviderAndSigner, getBlockUrl } from "../../../utils/ethereum";
import {
  PageContainer,
  GlassCard,
  GlassButton,
  BackButton,
  Title,
  SubTitle,
} from "../../../components/common/GlassComponents";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaExternalLinkAlt, FaSpinner } from "react-icons/fa";
import Image from "next/image";
import { clientConfig } from "@/lib/env.client";

interface CertificateData {
  candidateName: string;
  orgName: string;
  courseName: string;
  batchYear: string;
  blockNumber: string;
}

const CONTRACT_ADDRESS = clientConfig.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certData, setCertData] = useState<CertificateData | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCertificate = async () => {
      setLoading(true);
      setError("");
      try {
        let contract;
        try {
          const rpcUrl = "https://rpc-amoy.polygon.technology/";
          const provider = new JsonRpcProvider(rpcUrl);
          contract = Certification__factory.connect(CONTRACT_ADDRESS, provider);
        } catch (rpcErr) {
          console.warn("Failed to connect via public RPC, falling back to MetaMask provider", rpcErr);
          const walletConnection = await getProviderAndSigner();
          if (!walletConnection) {
            throw new Error("Could not initialize connection. Please connect wallet.");
          }
          contract = Certification__factory.connect(CONTRACT_ADDRESS, walletConnection.signer);
        }

        const data = await contract.getData(id);
        
        // If empty data returned
        if (!data[0] || data[0].trim() === "") {
          throw new Error("Certificate not found or invalid ID.");
        }

        setCertData({
          candidateName: data[0],
          orgName: data[1],
          courseName: data[2],
          batchYear: data[3].toString(),
          blockNumber: data[4].toString(),
        });
      } catch (err) {
        console.error("Error fetching certificate:", err);
        setError("This certificate could not be verified. Please check the ID and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => router.push("/")}>
          <FaArrowLeft /> Back to Home
        </BackButton>
        <LogoWrapper onClick={() => router.push("/")}>
          <Image
            src="/images/Truveth-logo.svg"
            alt="Truveth Logo"
            width={120}
            height={50}
            style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.1))", cursor: "pointer" }}
          />
        </LogoWrapper>
      </Header>

      <ContentWrapper>
        {loading ? (
          <GlassCard>
            <LoadingState>
              <FaSpinner className="spin" />
              <h3>Verifying Credential...</h3>
              <p>Fetching authenticity proof from the blockchain.</p>
            </LoadingState>
          </GlassCard>
        ) : error ? (
          <GlassCard>
            <StatusIcon className="error">
              <FaTimesCircle />
            </StatusIcon>
            <Title style={{ color: "var(--danger-color)" }}>Verification Failed</Title>
            <SubTitle style={{ marginBottom: "2rem" }}>
              {error}
            </SubTitle>
            <CertificateIdDisplay className="error">
              ID: <span>{id}</span>
            </CertificateIdDisplay>
            <GlassButton $secondary onClick={() => router.push("/")} $fullWidth>
              Go to Home Page
            </GlassButton>
          </GlassCard>
        ) : (
          certData && (
            <Grid>
              <GlassCard maxWidth="100%">
                <StatusIcon className="success">
                  <FaCheckCircle />
                </StatusIcon>
                <BadgeText>Verified Credential</BadgeText>
                
                <Title style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Blockchain Authenticated</Title>
                
                <DetailsList>
                  <DetailItem>
                    <Label>Candidate Name</Label>
                    <Value className="highlight">{certData.candidateName}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>Issuing Organization</Label>
                    <Value>{certData.orgName}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>Course / Field</Label>
                    <Value>{certData.courseName}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>Batch / Year</Label>
                    <Value>{certData.batchYear}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>Certificate ID</Label>
                    <Value style={{ fontFamily: "monospace" }}>{id}</Value>
                  </DetailItem>
                </DetailsList>

                <Divider />

                <BlockchainMeta>
                  <MetaRow>
                    <span>Status</span>
                    <StatusBadge>Secured on Polygon</StatusBadge>
                  </MetaRow>
                  <MetaRow>
                    <span>Block Number</span>
                    <span style={{ fontWeight: 600 }}>{certData.blockNumber}</span>
                  </MetaRow>
                </BlockchainMeta>

                <ActionGroup>
                  <a
                    href={getBlockUrl(certData.blockNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: "100%", textDecoration: "none" }}
                  >
                    <GlassButton $fullWidth style={{ background: "var(--accent-gradient)" }}>
                      <Image src="/images/polygon-matic-logo.svg" alt="Polygon" width={20} height={20} />
                      View On-Chain Proof <FaExternalLinkAlt style={{ fontSize: "0.85rem" }} />
                    </GlassButton>
                  </a>
                  <GlassButton $secondary onClick={() => router.push(`/download?id=${id}`)} $fullWidth>
                    Download PDF Certificate
                  </GlassButton>
                </ActionGroup>
              </GlassCard>
            </Grid>
          )
        )}
      </ContentWrapper>
    </PageContainer>
  );
}

const Header = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding: 0 1rem;
  z-index: 10;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  margin-bottom: 4rem;
  z-index: 5;
`;

const Grid = styled.div`
  width: 100%;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;

  .spin {
    font-size: 3rem;
    color: var(--accent-color);
    margin-bottom: 1.5rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
`;

const StatusIcon = styled.div`
  font-size: 4.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.success {
    color: var(--success-color);
    filter: drop-shadow(0 0 15px rgba(0, 200, 83, 0.3));
  }

  &.error {
    color: var(--danger-color);
    filter: drop-shadow(0 0 15px rgba(255, 75, 43, 0.3));
  }
`;

const BadgeText = styled.span`
  background: rgba(0, 200, 83, 0.1);
  color: var(--success-color);
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid rgba(0, 200, 83, 0.2);
  margin-bottom: 1.5rem;
`;

const DetailsList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 0.75rem;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const Value = styled.span`
  font-size: 1.15rem;
  color: var(--text-primary);
  font-weight: 500;

  &.highlight {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-primary);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed rgba(255, 255, 255, 0.15);
  width: 100%;
  margin: 1.5rem 0;
`;

const BlockchainMeta = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const StatusBadge = styled.span`
  background: rgba(0, 200, 83, 0.15);
  color: var(--success-color);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

const CertificateIdDisplay = styled.div`
  background: rgba(255, 75, 43, 0.1);
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  color: var(--danger-color);
  font-weight: 600;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  border: 1px dashed var(--danger-color);
  text-align: center;
  width: 100%;

  span {
    color: var(--text-primary);
    margin-left: 0.5rem;
    font-weight: 700;
  }
`;