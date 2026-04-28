"use client"

import React from "react";
import styled, { keyframes } from "styled-components";

const Background3D = (): React.JSX.Element => {
  return (
    <Wrapper>
      <Orb className="orb-1" />
      <Orb className="orb-2" />
      <Orb className="orb-3" />
      <GlassOverlay />
    </Wrapper>
  );
};

const float = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -50px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
`;

const floatReverse = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-30px, 50px) rotate(-120deg); }
  66% { transform: translate(20px, -20px) rotate(-240deg); }
  100% { transform: translate(0, 0) rotate(-360deg); }
`;

const Wrapper = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: -1;
  overflow: hidden;
  background: var(--primary-gradient);
`;

const Orb = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: ${float} 20s infinite ease-in-out;

  &.orb-1 {
    width: 60vh; height: 60vh;
    background: radial-gradient(circle, #a8ff78 0%, rgba(168,255,120,0) 70%);
    top: -10%; left: -10%;
    animation-duration: 25s;
  }
  &.orb-2 {
    width: 80vh; height: 80vh;
    background: radial-gradient(circle, #78ffd6 0%, rgba(120,255,214,0) 70%);
    bottom: -20%; right: -20%;
    animation-name: ${floatReverse};
    animation-duration: 30s;
  }
  &.orb-3 {
    width: 40vh; height: 40vh;
    background: radial-gradient(circle, #00d2ff 0%, rgba(0,210,255,0) 70%);
    top: 40%; left: 40%;
    animation-duration: 35s;
    opacity: 0.4;
  }
`;

const GlassOverlay = styled.div`
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  backdrop-filter: blur(5px);
  background: rgba(255,255,255,0.05);
`;

export default Background3D;