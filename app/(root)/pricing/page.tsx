import dynamic from "next/dynamic";
import React from "react";

const Pricing = dynamic(() => import("@/components/Pricing"), {
  ssr: false,
  loading: () => <div>Loading Pricing...</div>,
});

export default function PricingPage() {
  return <Pricing />;
} 