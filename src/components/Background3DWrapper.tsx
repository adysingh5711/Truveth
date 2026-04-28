"use client"

import dynamic from "next/dynamic";

const Background3D = dynamic(
  () => import("./Background3D"),
  { ssr: false, loading: () => null }
);

export default function Background3DWrapper() {
  return <Background3D />;
}