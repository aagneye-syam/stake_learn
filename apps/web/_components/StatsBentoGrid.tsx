"use client";

import { BentoCard, BentoGrid } from "../components/ui/bento-grid";
import {
  CheckCircledIcon,
  StarFilledIcon,
  DotFilledIcon,
  BadgeIcon,
} from "@radix-ui/react-icons";

interface StatsBentoGridProps {
  sbts: string;
  reputation: string;
  dataCoins: string;
  certificates: string;
  onRefreshDataCoins?: () => void;
}

export function StatsBentoGrid({
  sbts,
  reputation,
  dataCoins,
  certificates,
  onRefreshDataCoins,
}: StatsBentoGridProps) {
  const features = [
    {
      Icon: BadgeIcon,
      name: "Total SBTs",
      description: `${sbts} Soulbound Tokens earned`,
      className: "lg:row-start-1 lg:row-end-2 lg:col-start-1 lg:col-end-2",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-600/10" />
      ),
    },
    {
      Icon: StarFilledIcon,
      name: "Reputation Score",
      description: `${reputation} points total`,
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-600/10" />
      ),
    },
    {
      Icon: DotFilledIcon,
      name: "DataCoins Earned",
      description: `${dataCoins} tokens collected`,
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-600/10" />
      ),
      onClick: onRefreshDataCoins,
    },
    {
      Icon: CheckCircledIcon,
      name: "Certificates",
      description: `${certificates} courses completed`,
      className: "lg:col-start-4 lg:col-end-5 lg:row-start-1 lg:row-end-2",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10" />
      ),
    },
  ];

  return (
    <BentoGrid className="lg:grid-rows-1 lg:grid-cols-4 md:grid-cols-2 grid-cols-1 auto-rows-[12rem]">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
}
