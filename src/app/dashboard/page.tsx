"use client"

import React from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import { FaCertificate, FaGraduationCap } from "react-icons/fa";
import { PageContainer, GlassCard } from "../../components/common/GlassComponents";
import DashboardHeader from "../../components/common/DashboardHeader";

export default function Dashboard(): React.JSX.Element {
  const router = useRouter();

  return (
    <PageContainer>
      <DashboardHeader />
      <ContentWrapper>
        <Grid>
          <GlassCard
            onClick={() => router.push("/register")}
            className="hover-card"
          >
            <IconWrapper>
              <FaCertificate />
            </IconWrapper>
            <CardTitle>Generate Certificate</CardTitle>
            <CardDesc>
              Create verifiable credentials on the blockchain.
            </CardDesc>
          </GlassCard>

          <GlassCard
            onClick={() => router.push("/marksheet")}
            className="hover-card"
          >
            <IconWrapper>
              <FaGraduationCap />
            </IconWrapper>
            <CardTitle>Marksheet</CardTitle>
            <CardDesc>Access and manage student Academic records.</CardDesc>
          </GlassCard>
        </Grid>
      </ContentWrapper>
    </PageContainer>
  );
}

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;

  .hover-card {
    cursor: pointer;
    &:hover {
      transform: translateY(-10px);
      background: var(--card-hover-bg);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border-color: var(--accent-color);
    }
  }
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  color: var(--accent-color);
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.3);
  padding: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);

  div:hover > & {
    background: var(--accent-gradient);
    color: white;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
`;

const CardDesc = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
`;