"use client"

import React, { useState, useRef } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import certification from "../../lib/abi/certification.json";
import Image from "next/image";
import polygonIcon from "../images/polygon-matic-logo.svg";
import {
  FaSearch, FaFileContract, FaUserGraduate, FaBuilding,
  FaBook, FaCalendarAlt, FaArrowLeft, FaCheck, FaTimes, FaCheckCircle,
} from "react-icons/fa";
import { getProviderAndSigner } from "../../utils/ethereum";
import {
  PageContainer, GlassCard, GlassInput, GlassInputGroup,
  GlassButton, BackButton,
} from "../../components/common/GlassComponents";
import DashboardHeader from "../../components/common/DashboardHeader";
import { clientConfig } from "@/lib/env.client";

interface CertificateData {
  candidateName: string;
  orgName: string;
  courseName: string;
  batchYear: string;
  blockNumber: string;
}

interface ValidationItemProps {
  isValid: boolean;
}

const CONTRACT_ADDRESS = clientConfig.NEXT_PUBLIC_CONTRACT_ADDRESS;
const OWNER = clientConfig.NEXT_PUBLIC_OWNER_ADDRESS;

function Register(): React.JSX.Element {
  const router = useRouter();

  const [gotError, setGotError] = useState<string>("");
  const [gotError1, setGotError1] = useState<string>("");
  const [ownerRight, setOwnerRight] = useState<string>("");
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [certId, setCertId] = useState<string>("");
  const [batchYear, setBatchYear] = useState<string>("");
  const [showIdChecks, setShowIdChecks] = useState<boolean>(false);
  const [showBatchChecks, setShowBatchChecks] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [createdCertId, setCreatedCertId] = useState<string>("");

  const nameOfStudentRef = useRef<HTMLInputElement>(null);
  const nameOfOrgRef = useRef<HTMLInputElement>(null);
  const nameOfCourseRef = useRef<HTMLInputElement>(null);
  const certId1Ref = useRef<HTMLInputElement>(null);

  const isIdLengthValid = certId.length > 5;
  const isIdAlphasValid = /^[a-zA-Z]{3}/.test(certId);
  const isIdNumbersValid = /^[0-9]+$/.test(certId.slice(3)) && certId.length > 3;
  const isBatchValid = /^\d{4}$/.test(batchYear);

  const generateCertificate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!isIdLengthValid || !isIdAlphasValid || !isIdNumbersValid) {
      const errorDetails: string[] = [];
      if (!isIdLengthValid) errorDetails.push("ID length > 5");
      if (!isIdAlphasValid) errorDetails.push("First 3 chars must be alphabets");
      if (!isIdNumbersValid) errorDetails.push("Ending chars must be numbers");
      setGotError(`Invalid Certificate ID: ${errorDetails.join(", ")}`);
      return;
    }

    if (!isBatchValid) {
      setGotError("Batch Year must be exactly 4 digits.");
      return;
    }

    try {
      const result = await getProviderAndSigner();
      if (!result) throw new Error("Wallet not connected");
      const { signer } = result;

      const contract = new ethers.Contract(CONTRACT_ADDRESS, certification.abi, signer);
      const currentAddress = await signer.getAddress();

      if (currentAddress.toLowerCase() !== OWNER.toLowerCase()) {
        setOwnerRight(`Access Denied: Admin Rights Required. Login with Admin Wallet: ${OWNER}`);
        return;
      }

      const tx = await contract.generateCertificate(
        certId,
        nameOfStudentRef.current?.value ?? "",
        nameOfOrgRef.current?.value ?? "",
        nameOfCourseRef.current?.value ?? "",
        batchYear,
      );
      await tx.wait();

      setGotError("");
      setOwnerRight("");
      setCreatedCertId(certId);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      const error = err as { reason?: string; data?: { message?: string }; message?: string };
      const reason = error.reason ?? error.data?.message ?? error.message ?? "Unknown Error";
      let displayError = reason;
      if (reason.includes("user rejected")) {
        displayError = "Transaction rejected by user.";
      } else if (reason.includes("Certificate with this ID already exists")) {
        displayError = "Error: Certificate ID already exists!";
      } else {
        displayError = displayError.length > 100 ? displayError.substring(0, 100) + "..." : displayError;
      }
      setGotError(`Transaction Failed: ${displayError}`);
    }
  };

  const getData = async (): Promise<void> => {
    const id = certId1Ref.current?.value ?? "";
    if (!id.trim()) {
      setGotError1("Please enter a Certificate ID");
      return;
    }
    try {
      const result = await getProviderAndSigner();
      if (!result) throw new Error("Wallet not connected");
      const { signer } = result;

      const contract = new ethers.Contract(CONTRACT_ADDRESS, certification.abi, signer);
      const data = await contract.getData(id) as string[];

      setCertificateData({
        candidateName: data[0],
        orgName: data[1],
        courseName: data[2],
        batchYear: data[3].toString(),
        blockNumber: data[4].toString(),
      });
      setGotError1("");
    } catch (err) {
      console.error(err);
      setGotError1("Certificate not found or invalid ID.");
    }
  };

  return (
    <PageContainer>
      <DashboardHeader />
      <MainGrid>
        <BackButton
          onClick={() => router.push("/dashboard")}
          style={{ gridColumn: "1 / -1", marginBottom: "1rem", width: "fit-content" }}
        >
          <FaArrowLeft /> Back
        </BackButton>

        <GlassCard maxWidth="100%">
          <SectionTitle>Generate Certificate</SectionTitle>
          <Form onSubmit={generateCertificate}>
            <GlassInputGroup>
              <FaFileContract className="icon" />
              <GlassInput
                type="text"
                placeholder="Certificate ID"
                required
                value={certId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCertId(e.target.value)}
                onFocus={() => setShowIdChecks(true)}
              />
            </GlassInputGroup>
            {showIdChecks && (
              <ValidationContainer>
                <ValidationItem isValid={isIdLengthValid}>
                  {isIdLengthValid ? <FaCheck /> : <FaTimes />} More than 5 characters (e.g. ABC123)
                </ValidationItem>
                <ValidationItem isValid={isIdAlphasValid}>
                  {isIdAlphasValid ? <FaCheck /> : <FaTimes />} First 3 characters should be alphabets
                </ValidationItem>
                <ValidationItem isValid={isIdNumbersValid}>
                  {isIdNumbersValid ? <FaCheck /> : <FaTimes />} Remaining characters should be numbers
                </ValidationItem>
              </ValidationContainer>
            )}
            <GlassInputGroup>
              <FaUserGraduate className="icon" />
              <GlassInput ref={nameOfStudentRef} type="text" placeholder="Student Name" required />
            </GlassInputGroup>
            <GlassInputGroup>
              <FaBuilding className="icon" />
              <GlassInput ref={nameOfOrgRef} type="text" placeholder="Organization" required />
            </GlassInputGroup>
            <GlassInputGroup>
              <FaBook className="icon" />
              <GlassInput ref={nameOfCourseRef} type="text" placeholder="Course Name" required />
            </GlassInputGroup>
            <GlassInputGroup>
              <FaCalendarAlt className="icon" />
              <GlassInput
                type="text"
                placeholder="Batch Year"
                required
                value={batchYear}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBatchYear(e.target.value)}
                onFocus={() => setShowBatchChecks(true)}
              />
            </GlassInputGroup>
            {showBatchChecks && (
              <ValidationContainer>
                <ValidationItem isValid={isBatchValid}>
                  {isBatchValid ? <FaCheck /> : <FaTimes />} Exact 4 digits
                </ValidationItem>
              </ValidationContainer>
            )}
            {gotError && <ErrorMessage>{gotError}</ErrorMessage>}
            {ownerRight && <ErrorMessage>{ownerRight}</ErrorMessage>}
            <GlassButton type="submit" $fullWidth>Create Certificate</GlassButton>
            <GlassButton
              type="button" $secondary $fullWidth
              onClick={() => router.push("/down")}
              style={{ marginTop: "10px" }}
            >
              Go to Download
            </GlassButton>
          </Form>
        </GlassCard>

        <GlassCard maxWidth="100%">
          <SectionTitle>Verify Certificate</SectionTitle>
          <VerificationBox>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
              <SearchBox>
                <GlassInputGroup style={{ flex: 1 }}>
                  <FaFileContract className="icon" />
                  <GlassInput
                    ref={certId1Ref}
                    type="text"
                    placeholder="Enter Certificate ID to Verify"
                  />
                </GlassInputGroup>
                <IconButton type="button" onClick={getData}><FaSearch /></IconButton>
              </SearchBox>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginLeft: "0.5rem" }}>
                Example: <strong>Ver123</strong>
              </span>
            </div>

            {gotError1 && <ErrorMessage>{gotError1}</ErrorMessage>}

            {certificateData?.candidateName && (
              <ResultCard>
                <h3>Certificate Details</h3>
                <ResultRow><span>Candidate:</span> {certificateData.candidateName}</ResultRow>
                <ResultRow><span>Organization:</span> {certificateData.orgName}</ResultRow>
                <ResultRow><span>Course:</span> {certificateData.courseName}</ResultRow>
                <ResultRow><span>Year:</span> {certificateData.batchYear}</ResultRow>
                <ResultRow>
                  <span>Verification:</span>
                  <a
                    href={`https://amoy.polygonscan.com/block/${certificateData.blockNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--accent-color)", textDecoration: "underline", display: "flex", alignItems: "center", gap: "5px" }}
                  >
                    <Image src={polygonIcon} alt="Polygon" width={20} height={20} />
                    View on Polygonscan
                  </a>
                </ResultRow>
              </ResultCard>
            )}
          </VerificationBox>
        </GlassCard>
      </MainGrid>

      {showSuccessModal && (
        <ModalOverlay>
          <ModalContent>
            <FaCheckCircle style={{ color: "var(--success-color)", fontSize: "3rem", marginBottom: "1rem" }} />
            <SectionTitle style={{ textAlign: "center", borderBottom: "none", marginBottom: "0.5rem" }}>
              Success!
            </SectionTitle>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Certificate generated successfully.
            </p>
            <CertificateIdDisplay>ID: <span>{createdCertId}</span></CertificateIdDisplay>
            <GlassButton onClick={() => setShowSuccessModal(false)} $fullWidth>Back</GlassButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}

export default Register;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 480px));
  justify-content: center;
  gap: 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    max-width: 480px;
  }
`;

const SectionTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 1rem;
  color: var(--text-primary);
  width: 100%;
  text-align: left;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const VerificationBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const SearchBox = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
`;

const IconButton = styled.button`
  background: var(--accent-gradient);
  border: none;
  width: 50px;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;

  &:hover {
    transform: scale(1.05);
  }
`;

const ResultCard = styled.div`
  background: rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid var(--success-color);

  h3 {
    margin-top: 0;
    color: var(--success-color);
  }
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  span {
    color: var(--text-secondary);
    font-weight: 500;
    margin-right: 10px;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ValidationContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 0.25rem;
  padding-left: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ValidationItem = styled.div<ValidationItemProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: ${(props) => props.isValid ? "var(--success-color)" : "var(--text-secondary)"};
  margin-bottom: 4px;
  transition: color 0.3s;

  svg {
    font-size: 0.75rem;
    color: ${(props) => props.isValid ? "var(--success-color)" : "#999"};
  }
`;

const ErrorMessage = styled.div`
  color: var(--danger-color);
  background: rgba(255, 75, 43, 0.1);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--danger-color);
  margin-bottom: 1rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CertificateIdDisplay = styled.div`
  background: rgba(0, 200, 83, 0.1);
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  color: var(--success-color);
  font-weight: 600;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  border: 1px dashed var(--success-color);

  span {
    color: var(--text-primary);
    margin-left: 0.5rem;
    font-weight: 700;
  }
`;