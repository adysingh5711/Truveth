"use client"

import React, { useState, useRef } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import certification from "../../lib/abi/certification.json";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";
import { getProviderAndSigner } from "../../utils/ethereum";
import {
  PageContainer,
  GlassInput,
  GlassInputGroup,
  GlassButton,
  BackButton,
} from "../../components/common/GlassComponents";
import {
  FaDownload,
  FaSearch,
  FaArrowLeft,
  FaSpinner,
  FaFileContract,
} from "react-icons/fa";
import DashboardHeader from "../../components/common/DashboardHeader";
import { clientConfig } from "@/lib/env.client";

// --- DEV PREVIEW CONFIG ---
const DEV_PREVIEW = true; // flip to false when done testing

const DEV_DATA: CertificateData[] = [
  {
    candidateName: "Aditya Singh",
    orgName: "IIIT Ranchi",
    courseName: "Blockchain Development",
    batchYear: "2026",
    id: "CERT-0xABC123DEF456",
  },
  {
    candidateName: "Saksham",
    orgName: "Rubrik",
    courseName: "AIDS",
    batchYear: "2026",
    id: "CERT-0xDEF789GHI012",
  },
];
// --------------------------

interface CertificateData {
  candidateName: string;
  orgName: string;
  courseName: string;
  batchYear: string;
  id: string;
}

interface OverlayTextProps {
  $top: string;
  $left: string;
  $transform?: string;
  $size: string;
  $font?: string;
  $color?: string;
  $weight?: string;
  $align?: string;
}

const CONTRACT_ADDRESS = clientConfig.NEXT_PUBLIC_CONTRACT_ADDRESS;

const CertificateGenerator = (): React.JSX.Element => {
  const router = useRouter();
  const [certificateData, setCertificateData] = useState<CertificateData | null>(
    DEV_PREVIEW ? DEV_DATA[0] : null
  );
  const [inputCertId, setInputCertId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const certificateRef = useRef<HTMLDivElement>(null);

  const getData = async (): Promise<void> => {
    if (!inputCertId.trim()) {
      setError("Please enter a Certificate ID");
      return;
    }

    setIsLoading(true);
    setError("");
    setCertificateData(null);

    try {
      const result = await getProviderAndSigner();
      if (!result) throw new Error("Wallet not connected");
      const { signer } = result;

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        certification.abi,
        signer
      );

      const data = await contract.getData(inputCertId) as string[];
      setCertificateData({
        candidateName: data[0],
        orgName: data[1],
        courseName: data[2],
        batchYear: data[3].toString(),
        id: inputCertId,
      });
    } catch (err) {
      console.error("Error getting certificate data:", err);
      const error = err as { reason?: string };
      if (error.reason?.includes("No data exists")) {
        setError("Certificate ID not found. Please check and try again.");
      } else {
        setError("Failed to fetch certificate. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async (): Promise<void> => {
    if (!certificateData || !certificateRef.current) return;

    try {
      await document.fonts.ready;

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `Truveth_Certificate_${certificateData.candidateName.replace(/\s+/g, "_")}.pdf`
      );
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <PageContainer>
      <DashboardHeader />
      <Header>
        <BackButton onClick={() => router.push("/dashboard")}>
          <FaArrowLeft /> Back
        </BackButton>
        <Title>Certificate Download</Title>
      </Header>

      <ControlPanel>
        <InputGroup>
          <GlassInputGroup style={{ maxWidth: "400px" }}>
            <FaFileContract className="icon" />
            <GlassInput
              type="text"
              value={inputCertId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setInputCertId(e.target.value);
                setError("");
              }}
              placeholder="Enter Certificate ID"
            />
          </GlassInputGroup>
          <GlassButton
            onClick={getData}
            disabled={isLoading}
            style={{ minWidth: "120px" }}
          >
            {isLoading ? <FaSpinner className="spin" /> : <><FaSearch /> Fetch</>}
          </GlassButton>
          <GlassButton
            onClick={generatePDF}
            disabled={!certificateData}
            style={{
              opacity: certificateData ? 1 : 0.5,
              cursor: certificateData ? "pointer" : "not-allowed",
              minWidth: "160px",
            }}
          >
            <FaDownload /> Download PDF
          </GlassButton>
        </InputGroup>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </ControlPanel>

      {certificateData && (
        <PreviewSection>
          <h3>Preview</h3>
          {DEV_PREVIEW && (
            <DevToolbar>
              {DEV_DATA.map((d, i) => (
                <button key={i} onClick={() => setCertificateData(DEV_DATA[i])}>
                  Case {i + 1}: {d.candidateName}
                </button>
              ))}
            </DevToolbar>
          )}
          <CertificateWrapper ref={certificateRef}>
            <img src="/images/Truveth-Certificate.png" alt="Certificate Background" />

            {/* Candidate Name */}
            <OverlayText $top="51%" $left="50%" $transform="translate(-50%, -50%)"
              $size="58px" $font="'Great Vibes', cursive" $color="#b8960c" $align="center">
              {certificateData.candidateName}
            </OverlayText>

            {/* Organisation */}
            <OverlayText $top="59.7%" $left="39%" $transform="translate(0, -50%)"
              $size="18px" $font="'Zenaida', 'Outfit', sans-serif" $weight="500" $color="#2c2c2c" $align="left">
              {certificateData.orgName}
            </OverlayText>

            {/* Course Name */}
            <OverlayText $top="63.5%" $left="50%" $transform="translate(0, -50%)"
              $size="18px" $font="'Zenaida', 'Outfit', sans-serif" $weight="500" $color="#2c2c2c" $align="left">
              {certificateData.courseName}
            </OverlayText>

            {/* Batch Year */}
            <OverlayText $top="67.3%" $left="37%" $transform="translate(0, -50%)"
              $size="18px" $font="'Zenaida', 'Outfit', sans-serif" $weight="600" $color="#2c2c2c" $align="left">
              {certificateData.batchYear}
            </OverlayText>

            {/* Certificate ID */}
            <OverlayText $top="78%" $left="29%" $transform="translate(-50%, -50%)"
              $size="13px" $font="'Courier New', monospace" $color="#3f3e3e" $align="center">
              {certificateData.id}
            </OverlayText>

            {/* Authority */}
            <OverlayText $top="78%" $left="68%" $transform="translate(-50%, -50%)"
              $size="15px" $font="'Amsterdam-Three', 'Great Vibes', cursive" $color="#b8960c" $align="center">
              Aditya Singh
            </OverlayText>
          </CertificateWrapper>
        </PreviewSection>
      )}
    </PageContainer>
  );
};

export default CertificateGenerator;

const Header = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  color: var(--text-primary);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
  text-align: center;
`;

const ControlPanel = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  width: 100%;
  max-width: 800px;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;

  @media (max-width: 600px) {
    flex-direction: column;

    input,
    button {
      width: 100% !important;
    }
  }
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  margin-top: 1rem;
  font-weight: 500;
`;
const PreviewSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 3rem;
  margin-bottom: 3rem;

  h3 {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  /* Animation for appearing */
  animation: fadeIn 0.5s ease-out;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
const CertificateWrapper = styled.div`
  position: relative;
  width: 900px;
  height: 636px;
  background: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border-radius: 4px; /* Slight round for paper feel */
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Ensure entire template is visible */
  }

  /* Responsive scaling */
  @media (max-width: 950px) {
    transform: scale(0.8);
    transform-origin: top center;
    margin-bottom: -15%;
  }
  @media (max-width: 768px) {
    transform: scale(0.6);
    margin-bottom: -30%;
  }
  @media (max-width: 500px) {
    transform: scale(0.4);
    margin-bottom: -50%;
  }
`;
const OverlayText = styled.div<OverlayTextProps>`
position: absolute;
top: ${(p) => p.$top};
left: ${(p) => p.$left};
transform: ${(p) => p.$transform ?? "translate(-50%, -50%)"};
font-size: ${(p) => p.$size};
color: ${(p) => p.$color ?? "#333"};
font-family: ${(p) => p.$font ?? "'Outfit', sans-serif"};
font-weight: ${(p) => p.$weight ?? "normal"};
text-align: ${(p) => p.$align ?? "center"};
position: absolute;
margin: 0;
white-space: nowrap;
z-index: 10;
`;
const DevToolbar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  button {
    padding: 4px 10px;
    background: #1a1a1a;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
`;