import { useState, useMemo } from "react";
import { Chart } from "./chart"
import { Table } from "./table"
import { useTheme } from "@/contexts/theme-context";
import { useEarnVaultStore } from "@/store/earn-vault-store";
import { useUserDepositHistory } from "@/lib/hooks/useUserPosition";
import { EarnAsset } from "@/lib/types";
import { useDemoPositionsStore } from "@/store/demo-positions-store";
import { iconPaths } from "@/lib/constants";

const tabs = [{id:"current-positions",label:"Current Position"},{id:"positions-history",label:"Position History"}]

const transactionTableHeadings = [
  { label: "Date", id: "date" },
  { label: "Type", id: "type" },
  { label: "Amount", id: "amount" },
  { label: "User Id", id: "userId" },
];

export const YourPositions = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<string>("current-positions");

  // Get selected vault to determine which asset to fetch
  const selectedVault = useEarnVaultStore((state) => state.selectedVault);
  const asset = (selectedVault?.title || "ETH") as EarnAsset;

  // Fetch user's deposit history
  const { depositHistory, currentValue, loading } = useUserDepositHistory(asset);

  // Demo positions from store
  const currentPositions = useDemoPositionsStore((s) => s.currentPositions);
  const positionHistory = useDemoPositionsStore((s) => s.positionHistory);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Build table data from demo positions
  const currentPositionsTableBody = useMemo(() => ({
    rows: currentPositions.map((pos) => ({
      cell: [
        { title: pos.date, description: pos.time },
        { title: pos.type },
        {
          icon: iconPaths[pos.asset] || "/icons/eth-icon.png",
          title: pos.amount,
          description: pos.amountUsd,
        },
        { icon: "/icons/user.png", title: pos.userId },
      ],
    })),
  }), [currentPositions]);

  const positionHistoryTableBody = useMemo(() => ({
    rows: positionHistory.map((pos) => ({
      cell: [
        { title: pos.date, description: pos.time },
        { title: pos.type },
        {
          icon: iconPaths[pos.asset] || "/icons/eth-icon.png",
          title: pos.amount,
          description: pos.amountUsd,
        },
        { icon: "/icons/user.png", title: pos.userId },
      ],
    })),
  }), [positionHistory]);

  const activeTableBody = activeTab === "current-positions"
    ? currentPositionsTableBody
    : positionHistoryTableBody;

  return (
    <section
      className={`w-full h-full flex flex-col gap-[24px] rounded-[20px] border-[1px] p-[24px] ${
        isDark ? "bg-[#111111]" : "bg-[#F7F7F7]"
      }`}
      aria-label="Your Positions Overview"
    >
      <figure className="w-full flex-1 min-h-0">
        {loading ? (
          <div className={`w-full h-[393px] flex items-center justify-center ${
            isDark ? "text-white" : "text-gray-600"
          }`}>
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#703AE6]"></div>
              <p className="text-sm">Loading your position...</p>
            </div>
          </div>
        ) : (
          <Chart
            type="my-supply"
            currencyTab={true}
            height={393}
            containerWidth="w-full"
            containerHeight="h-full"
            customData={depositHistory}
          />
        )}
      </figure>

      <article aria-label="Your Transactions">
        <Table
          filterDropdownPosition="right"
          heading={{
            heading: "All Transactions",
            tabsItems: tabs,
            tabType: "solid"
          }}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tableHeadings={transactionTableHeadings}
          tableBody={activeTableBody}
          tableBodyBackground={isDark ? "bg-[#222222]" : "bg-white"}
          filters={{
            customizeDropdown: true,
            filters: ["All"]
          }}
        />
      </article>
    </section>
  );
};