import styled from "styled-components";

interface GlassCardProps {
  maxWidth?: string;
}

interface GlassButtonProps {
  secondary?: boolean;
  fullWidth?: boolean;
}

export const PageContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: var(--primary-gradient);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8rem 2rem 2rem 2rem;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
`;

export const GlassCard = styled.div<GlassCardProps>`
  background: var(--glass-bg);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: var(--border-radius);
  padding: 3rem;
  width: 100%;
  max-width: ${(props) => props.maxWidth ?? "480px"};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: var(--transition);

  @media (max-width: 480px) {
    padding: 2rem;
  }
`;

export const GlassInputGroup = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 0.5rem;

  .icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--accent-color);
    opacity: 0.8;
    font-size: 1.1rem;
  }
`;

export const GlassInput = styled.input`
  width: 100%;
  padding: 14px 14px 14px 45px;
  background: var(--input-bg);
  border: 2px solid var(--text-secondary);
  border-color: rgba(0, 77, 64, 0.3);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 4px rgba(0, 200, 83, 0.15);
  }

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }
`;

export const GlassButton = styled.button<{ $fullWidth?: boolean; $secondary?: boolean }>`
  background: ${({ $secondary }) => $secondary ? "transparent" : "var(--accent-gradient)"};
  border: ${({ $secondary }) => $secondary ? "1px solid currentColor" : "none"};
  color: ${({ $secondary }) => $secondary ? "var(--text-secondary)" : "white"};
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: ${({ $fullWidth }) => $fullWidth ? "100%" : "auto"};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ $secondary }) => $secondary ? "none" : "0 8px 20px rgba(0, 200, 83, 0.3)"};
    background: ${({ $secondary }) => $secondary ? "rgba(255,255,255,0.2)" : "var(--accent-gradient)"};
    color: ${({ $secondary }) => $secondary ? "var(--text-primary)" : "white"};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const Title = styled.h1`
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-weight: 700;
`;

export const SubTitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  margin-top: 0;
  font-weight: 500;
`;

export const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--text-primary);
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s;
  align-self: flex-start;
  margin-bottom: 1rem;

  &:hover {
    background: var(--accent-gradient);
    color: white;
    transform: translateX(-5px);
    border-color: transparent;
  }
`;