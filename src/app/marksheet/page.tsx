"use client"

import React from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import {
  PageContainer,
  GlassCard,
  Title,
  SubTitle,
  GlassButton,
  BackButton,
} from "../../components/common/GlassComponents";
import { FaArrowLeft, FaLaptopCode } from "react-icons/fa";
import DashboardHeader from "../../components/common/DashboardHeader";

export default function Marksheet(): React.JSX.Element {
  const router = useRouter();

  return (
    <PageContainer>
      <DashboardHeader />
      <BackButton
        onClick={() => router.push("/dashboard")}
        style={{ alignSelf: "center", width: "100%", maxWidth: "480px" }}
      >
        <FaArrowLeft /> Back
      </BackButton>
      <GlassCard>
        <LogoImg src="/images/Truveth-logo.svg" alt="Truveth" />
        <IconWrapper>
          <FaLaptopCode />
        </IconWrapper>
        <Title>Marksheet System</Title>
        <SubTitle style={{ marginBottom: "2rem" }}>
          This feature is currently under active development.
          <br />
          Check back soon!
        </SubTitle>
        <GlassButton $secondary onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </GlassButton>
      </GlassCard>
    </PageContainer>
  );
}

const LogoImg = styled.img`
  height: 90px;
  margin-bottom: 2rem;
`;

const IconWrapper = styled.div`
  font-size: 4rem;
  color: var(--accent-color);
  margin-bottom: 1.5rem;
  opacity: 0.8;
`;