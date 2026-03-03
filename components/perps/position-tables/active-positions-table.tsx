"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Column } from "../../ui/Table";
import { Table } from "../../ui/Table";
import { Modal } from "../../ui/modal";
import { ClosePositionModal } from "../modals/close-position-modal";
import { TpSlModal } from "../modals/tp-sl-modal";
import { ColumnPreferenceItem, TpSlMode } from "@/lib/types";
import { SharePositionModal } from "../modals/share-position-modal";
import { AdjustLeverageModal } from "../modals/adjust-leverage-modal";
import { usePerpsTradeStore } from "@/store/perps-trade-store";
import { closePerpsPositionTx, getPerpsPrice } from "@/lib/utils/perps/transactions";
import { WalletTxModal, type WalletTxStep } from "../../ui/wallet-tx-modal";

export type ActivePositionType = {
  id: string;
  futures: {
    pair: string;
    leverage: string;
    mode: "Cross" | "Isolated";
    side: "Long" | "Short";
  };
  positionSize: {
    size: string;
  };
  positionValue: string;
  entryPrice: string;
  markPrice: string;
  estLiquidationPrice: string;
  margin: {
    amount: string;
    usdValue: string;
  };
  tieredMaintenanceMarginRate: string;
  unrealizedPnl: {
    amount: string;
    percentage: string;
    usdValue: string;
  };
  realizedPnl: {
    amount: string;
    percentage: string;
    usdValue: string;
  };
  funding: string;
  marginStatus: "Yes" | "No";
  mmr: "Yes" | "No";
  entireTpSl: string | null;
  partialTpSl: string | null;
  trailingTpSl: string | null;
  mmrSl: string | null;
};

const getActivePositionsColumns = (
  onOpenModal: (position: ActivePositionType, type: "market" | "limit") => void,
  onOpenTpSlModal: (position: ActivePositionType, mode: TpSlMode) => void,
  onOpenShareCard: (position: ActivePositionType) => void,
  onOpenLeverageModal: (position: ActivePositionType) => void,
): Column<ActivePositionType>[] => [
  {
    id: "futures",
    header: "Futures",
    render: (row) => (
      <div className="flex  gap-2.5 justify-between  w-[140px]">
        <div className="flex flex-col items-start">
          <span>{row.futures.pair}</span>
          <span
            className={
              row.futures.side === "Long" ? "text-[#24A0A9]" : "text-[#FC5457]"
            }
          >
            {row.futures.side} {row.futures.leverage} {row.futures.mode}
          </span>
        </div>
        <button
          type="button"
          className="cursor-pointer"
          onClick={() => onOpenLeverageModal(row)}
        >
          <Image src="/icons/edit.svg" alt="edit" width={16} height={16} />
        </button>
      </div>
    ),
  },
  {
    id: "positionSize",
    header: "Position Size",
    render: (row) => <span>{row.positionSize.size}</span>,
  },
  {
    id: "positionValue",
    header: "Position Value",
    render: (row) => (
      <div className="w-[140px]">
        <span>{row.positionValue}</span>
      </div>
    ),
  },
  {
    id: "entryMarkPrice",
    header: (
      <div className="flex flex-col leading-tight">
        <span>Entry Price</span>
        <span>Mark Price</span>
      </div>
    ),
    render: (row) => (
      <div className="flex flex-col w-[140px]">
        <span>{row.entryPrice}</span>
        <span>{row.markPrice}</span>
      </div>
    ),
  },
  {
    id: "estLiquidation",
    header: (
      <div className="flex flex-col leading-tight w-[120px]">
        <span>Est. liquidation</span>
        <span>price</span>
      </div>
    ),
    render: (row) => <span>{row.estLiquidationPrice}</span>,
  },
  {
    id: "margin",
    header: "Margin",
    render: (row) => (
      <div className="flex  justify-between w-[140px]">
        <div className="flex flex-col ">
          <span>{row.margin.amount}</span>
          <span>{row.margin.usdValue}</span>
        </div>
        <button type="button" className="cursor-pointer">
          <Image src="/icons/edit.svg" alt="edit" width={16} height={16} />
        </button>
      </div>
    ),
  },
  {
    id: "tieredMaintenanceMarginRate",
    header: (
      <div className="flex flex-col leading-tight">
        <span>Tiered maintenance</span>
        <span>margin rate</span>
      </div>
    ),
    render: (row) => <span>{row.tieredMaintenanceMarginRate}</span>,
  },
  {
    id: "unrealizedPnl",
    header: "Unrealized PNL (ROE)",
    render: (row) => {
      const isProfit = !row.unrealizedPnl.amount.startsWith("-");
      const colorClass = isProfit ? "text-[#24A0A9]" : "text-[#FC5457]";
      return (
        <div className="flex  justify-between w-[160px]">
          <div className="flex flex-col ">
            <span className={colorClass}>{row.unrealizedPnl.amount}</span>
            <span className={colorClass}>
              ({row.unrealizedPnl.percentage}) ≈{row.unrealizedPnl.usdValue}
            </span>
          </div>
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => onOpenShareCard(row)}
          >
            <Image
              src="/perp/share-icon.svg"
              alt="share"
              width={16}
              height={16}
            />
          </button>
        </div>
      );
    },
  },
  {
    id: "realizedPnl",
    header: "Realized PnL",
    render: (row) => {
      const isProfit = !row.realizedPnl.amount.startsWith("-");
      const colorClass = isProfit ? "text-[#24A0A9]" : "text-[#FC5457]";
      return (
        <div className="flex flex-col w-[160px]">
          <span className={colorClass}>{row.realizedPnl.amount}</span>
          <span className={colorClass}>
            ({row.realizedPnl.percentage}) ≈{row.realizedPnl.usdValue}
          </span>
        </div>
      );
    },
  },
  {
    id: "funding",
    header: "Funding",
    render: (row) => (
      <span
        className={
          row.funding.startsWith("+") ? "text-[#24A0A9]" : "text-[#FC5457] "
        }
      >
        {row.funding}
      </span>
    ),
  },
  {
    id: "mmr",
    header: "MMR",
    render: (row) => <span>{row.mmr}</span>,
  },
  {
    id: "entireTpSl",
    header: "Entire TP/SL",
    render: (row) => (
      <button
        type="button"
        onClick={() => onOpenTpSlModal(row, "entire_position")}
        className="cursor-pointer flex items-center bg-[#FFFFFF] border-[0.75px] border-[#E2E2E2] rounded-md py-2 pl-1 pr-3 gap-1 text-[12px] leading-[18px] font-medium text-[#111111] hover:text-[#703AE6]"
      >
        <Image src="/icons/add-icon.svg" alt="add" width={16} height={16} />
        <span>Add</span>
      </button>
    ),
  },
  {
    id: "partialTpSl",
    header: "Partial TP/SL",
    render: (row) => (
      <button
        type="button"
        onClick={() => onOpenTpSlModal(row, "partial_position")}
        className="cursor-pointer flex items-center bg-[#FFFFFF] border-[0.75px] border-[#E2E2E2] rounded-md py-2 pl-1 pr-3 gap-1 text-[12px] leading-[18px] font-medium text-[#111111] hover:text-[#703AE6]"
      >
        <Image src="/icons/add-icon.svg" alt="add" width={16} height={16} />
        <span>Add</span>
      </button>
    ),
  },
  {
    id: "trailingTpSl",
    header: "Trailing TP/SL",
    render: (row) => (
      <button
        type="button"
        onClick={() => onOpenTpSlModal(row, "trailing")}
        className="cursor-pointer flex items-center bg-[#FFFFFF] border-[0.75px] border-[#E2E2E2] rounded-md py-2 pl-1 pr-3 gap-1 text-[12px] leading-[18px] font-medium text-[#111111] hover:text-[#703AE6]"
      >
        <Image src="/icons/add-icon.svg" alt="add" width={16} height={16} />
        <span>Add</span>
      </button>
    ),
  },
  {
    id: "mmrSl",
    header: "MMR SL",
    render: (row) => (
      <button
        type="button"
        onClick={() => onOpenTpSlModal(row, "mmr_sl")}
        className="cursor-pointer flex items-center bg-[#FFFFFF] border-[0.75px] border-[#E2E2E2] rounded-md py-2 pl-1 pr-3 gap-1 text-[12px] leading-[18px] font-medium text-[#111111] hover:text-[#703AE6]"
      >
        <Image src="/icons/add-icon.svg" alt="add" width={16} height={16} />
        <span>Add</span>
      </button>
    ),
  },
  {
    id: "close",
    header: "Close",
    align: "left",
    sticky: true,
    render: (row) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenModal(row, "market")}
          className="cursor-pointer flex items-center bg-[#FFFFFF] border-[0.75px] border-[#E2E2E2] rounded-md py-2 px-3  text-[12px] leading-[18px] font-medium text-[#111111] hover:text-[#703AE6]"
        >
          Market
        </button>
        <button
          type="button"
          onClick={() => onOpenModal(row, "limit")}
          className="cursor-pointer flex items-center bg-[#FFFFFF] border-[0.75px] border-[#E2E2E2] rounded-md py-2 px-3  text-[12px] leading-[18px] font-medium text-[#111111] hover:text-[#703AE6]"
        >
          Limit
        </button>
      </div>
    ),
  },
];

export default function ActivePositionsTable({
  filter = "All",
  sort = "default",
  visibleColumns = [],
  columnItems = [],
  columnOrder = [],
}: {
  filter?: string;
  sort?: string;
  visibleColumns?: string[];
  columnItems?: ColumnPreferenceItem[];
  columnOrder?: string[];
}) {
  // ---------- Store positions ----------
  const storePositions = usePerpsTradeStore((s) => s.positions);

  // Map PerpsPosition -> ActivePositionType
  const activePositionsData: ActivePositionType[] = storePositions.map((pos) => {
    const pnlSign = pos.pnl >= 0 ? "+" : "";
    const pnlPercentSign = pos.pnlPercent >= 0 ? "+" : "";

    return {
      id: pos.id,
      futures: {
        pair: pos.pair,
        leverage: pos.leverage + "x",
        mode: pos.marginMode ?? "Cross",
        side: pos.side,
      },
      positionSize: {
        size: pos.quantity.toFixed(4),
      },
      positionValue:
        (pos.quantity * pos.markPrice).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        }) + " USDT",
      entryPrice: pos.entryPrice.toLocaleString(),
      markPrice: pos.markPrice.toLocaleString(),
      estLiquidationPrice: pos.liqPrice.toLocaleString(),
      margin: {
        amount: pos.margin.toFixed(2) + " USDT",
        usdValue: "\u2248" + pos.margin.toFixed(2) + " USD",
      },
      tieredMaintenanceMarginRate: "1.00%",
      unrealizedPnl: {
        amount: pnlSign + pos.pnl.toFixed(2) + " USDT",
        percentage: pnlPercentSign + pos.pnlPercent.toFixed(2) + "%",
        usdValue: pnlSign + pos.pnl.toFixed(2) + " USD",
      },
      realizedPnl: {
        amount: "0.00 USDT",
        percentage: "0.00%",
        usdValue: "0.00 USD",
      },
      funding: "+0.00",
      marginStatus: "No",
      mmr: "No",
      entireTpSl: null,
      partialTpSl: null,
      trailingTpSl: null,
      mmrSl: null,
    };
  });

  // ---------- Mark price simulation ----------
  useEffect(() => {
    if (storePositions.length === 0) return;

    const interval = setInterval(() => {
      const currentPositions = usePerpsTradeStore.getState().positions;
      if (currentPositions.length === 0) return;

      const priceMap: Record<string, number> = {};
      currentPositions.forEach((pos) => {
        if (!priceMap[pos.pair]) {
          // Small random movement: +/- 0.15%
          const delta = (Math.random() - 0.5) * 0.003;
          priceMap[pos.pair] = pos.markPrice * (1 + delta);
        }
      });

      usePerpsTradeStore.getState().updateMarkPrices(priceMap);
    }, 3000);

    return () => clearInterval(interval);
  }, [storePositions.length]);

  // ---------- Modal state ----------
  const [closeModal, setCloseModal] = useState<{
    isOpen: boolean;
    position: ActivePositionType | null;
    type: "market" | "limit";
  }>({
    isOpen: false,
    position: null,
    type: "market",
  });

  const [tpslModal, setTpslModal] = useState<{
    isOpen: boolean;
    position: ActivePositionType | null;
    mode: TpSlMode;
  }>({
    isOpen: false,
    position: null,
    mode: "entire_position",
  });

  const [shareCard, setShareCard] = useState<{
    isOpen: boolean;
    position: ActivePositionType | null;
  }>({
    isOpen: false,
    position: null,
  });

  const [leverageModal, setLeverageModal] = useState<{
    isOpen: boolean;
    position: ActivePositionType | null;
  }>({
    isOpen: false,
    position: null,
  });

  // ---------- WalletTxModal state ----------
  const [walletStep, setWalletStep] = useState<WalletTxStep>("idle");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<string | undefined>(undefined);

  const handleOpenModal = (
    position: ActivePositionType,
    type: "market" | "limit",
  ) => {
    setCloseModal({
      isOpen: true,
      position,
      type,
    });
  };

  const handleCloseModal = () => {
    setCloseModal({
      isOpen: false,
      position: null,
      type: "market",
    });
  };

  const handleOpenTpSlModal = (
    position: ActivePositionType,
    mode: TpSlMode,
  ) => {
    setTpslModal({
      isOpen: true,
      position,
      mode,
    });
  };

  const handleCloseTpSlModal = () => {
    setTpslModal({
      isOpen: false,
      position: null,
      mode: "entire_position",
    });
  };

  const handleConfirm = useCallback(
    async (data: {
      type: "market" | "limit";
      price?: number;
      quantity: number;
      percentage: number;
    }) => {
      if (!closeModal.position) return;

      // Find the matching store position by pair
      const storePos = usePerpsTradeStore
        .getState()
        .positions.find((p) => p.pair === closeModal.position!.futures.pair);
      if (!storePos) {
        console.error("Position not found in store for pair:", closeModal.position.futures.pair);
        handleCloseModal();
        return;
      }

      // Show WalletTxModal
      setShowWalletModal(true);
      setWalletStep("wallet_request");
      handleCloseModal();

      try {
        const result = await closePerpsPositionTx(
          storePos,
          // onStatus
          undefined,
          // onWalletStep
          (step, txHash) => {
            setWalletStep(step);
            if (txHash) setCurrentTxHash(txHash);
          },
        );

        if (result.success && result.closePrice != null) {
          usePerpsTradeStore.getState().closePosition(storePos.id, result.closePrice);
          setWalletStep("confirmed");
        } else {
          setWalletStep("failed");
        }
      } catch (err) {
        console.error("Failed to close position:", err);
        setWalletStep("failed");
      }
    },
    [closeModal.position],
  );

  const handleOpenShareCard = (position: ActivePositionType) => {
    setShareCard({
      isOpen: true,
      position,
    });
  };

  const handleCloseShareCard = () => {
    setShareCard({
      isOpen: false,
      position: null,
    });
  };

  const handleOpenLeverageModal = (position: ActivePositionType) => {
    setLeverageModal({
      isOpen: true,
      position,
    });
  };

  const handleCloseLeverageModal = () => {
    setLeverageModal({
      isOpen: false,
      position: null,
    });
  };

  const allColumns = getActivePositionsColumns(
    handleOpenModal,
    handleOpenTpSlModal,
    handleOpenShareCard,
    handleOpenLeverageModal,
  );

  // Filter columns based on visibility preferences
  // Columns with hasToggle: false should always be visible
  // Columns with hasToggle: true should only be visible if in visibleColumns
  const filteredColumns = allColumns.filter((col) => {
    const columnPref = columnItems.find((item) => item.id === col.id);
    if (!columnPref) {
      // If column is not in preferences, show it by default
      return true;
    }
    if (!columnPref.hasToggle) {
      // Columns with hasToggle: false are always visible
      return true;
    }
    // Columns with hasToggle: true are only visible if in visibleColumns
    return visibleColumns.includes(col.id);
  });

  // Sort columns based on columnOrder
  const activePositionsColumns = filteredColumns.sort((a, b) => {
    const indexA = columnOrder.indexOf(a.id);
    const indexB = columnOrder.indexOf(b.id);
    // If not in order, maintain original position (put at end)
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Helper function to parse numeric value from string (e.g., "1,900.60 USDT" -> 1900.60)
  const parseNumericValue = (value: string): number => {
    const numericString = value.replace(/[^\d.-]/g, "").replace(/,/g, "");
    return parseFloat(numericString) || 0;
  };

  // Filter data based on selected filter
  let filteredData =
    filter === "All"
      ? activePositionsData
      : activePositionsData.filter(
          (position) => position.futures.pair === filter,
        );

  // Sort data based on selected sort option
  if (sort !== "default") {
    filteredData = [...filteredData].sort((a, b) => {
      switch (sort) {
        case "coin_asc":
          // Coin initial (from A to Z)
          return a.futures.pair.localeCompare(b.futures.pair);

        case "position_value":
          // Position Value (from high to low)
          const valueA = parseNumericValue(a.positionValue);
          const valueB = parseNumericValue(b.positionValue);
          return valueB - valueA;

        case "margin":
          // Margin (from high to low)
          const marginA = parseNumericValue(a.margin.amount);
          const marginB = parseNumericValue(b.margin.amount);
          return marginB - marginA;

        case "unrealized_pnl":
          // Unrealized PnL (from high to low)
          const pnlA = parseNumericValue(a.unrealizedPnl.amount);
          const pnlB = parseNumericValue(b.unrealizedPnl.amount);
          return pnlB - pnlA;

        case "roi":
          // ROI (from high to low) - using unrealized PnL percentage
          const roiA = parseNumericValue(a.unrealizedPnl.percentage);
          const roiB = parseNumericValue(b.unrealizedPnl.percentage);
          return roiB - roiA;

        default:
          return 0;
      }
    });
  }

  return (
    <>
      <div className="p-2 rounded-lg border border-[#E2E2E2] bg-[#F7F7F7]">
        <Table
          columns={activePositionsColumns}
          data={filteredData}
          getRowKey={(row) => row.id}
          emptyText="No positions"
        />
      </div>

      {/* Close Position Modal */}
      <Modal open={closeModal.isOpen} onClose={handleCloseModal}>
        {closeModal.position && (
          <ClosePositionModal
            position={closeModal.position}
            defaultType={closeModal.type}
            onClose={handleCloseModal}
            onConfirm={handleConfirm}
          />
        )}
      </Modal>

      {/* TP/SL Modal */}
      <Modal open={tpslModal.isOpen} onClose={handleCloseTpSlModal}>
        {tpslModal.position && (
          <TpSlModal
            defaultMode={tpslModal.mode}
            position={{
              pair: tpslModal.position.futures.pair,
              leverage: tpslModal.position.futures.leverage,
              mode: tpslModal.position.futures.mode,
              lastPrice: tpslModal.position.markPrice,
              entryPrice: tpslModal.position.entryPrice,
              markPrice: tpslModal.position.markPrice,
              estLiquidationPrice: tpslModal.position.estLiquidationPrice,
            }}
            onClose={handleCloseTpSlModal}
            onConfirm={(data) => {
              console.log("TP/SL confirmed:", data);
              handleCloseTpSlModal();
            }}
          />
        )}
      </Modal>

      {/* Share PnL Card Modal */}
      {shareCard.position && (
        <SharePositionModal
          open={shareCard.isOpen}
          onClose={handleCloseShareCard}
          card={{
            pair: shareCard.position.futures.pair,
            marketType: "Perpetual",
            side:
              shareCard.position.futures.side === "Short" ? "short" : "long",
            leverage: shareCard.position.futures.leverage,
            pnlAmount: parseNumericValue(
              shareCard.position.unrealizedPnl.amount,
            ),
            pnlPercentage: parseNumericValue(
              shareCard.position.unrealizedPnl.percentage,
            ),
            entryPrice: parseNumericValue(shareCard.position.entryPrice),
            currentPrice: parseNumericValue(shareCard.position.markPrice),
          }}
        />
      )}

      {/* Adjust Leverage Modal */}
      <Modal open={leverageModal.isOpen} onClose={handleCloseLeverageModal}>
        {leverageModal.position && (
          <AdjustLeverageModal
            pair={leverageModal.position.futures.pair}
            defaultValue={parseInt(leverageModal.position.futures.leverage)}
            max={20}
            onClose={handleCloseLeverageModal}
            onConfirm={(val, batchAdjust) => {
              console.log("Leverage adjusted:", val, batchAdjust);
              handleCloseLeverageModal();
            }}
          />
        )}
      </Modal>

      {/* Wallet Transaction Modal */}
      <WalletTxModal
        open={showWalletModal}
        onClose={() => {
          setShowWalletModal(false);
          setWalletStep("idle");
          setCurrentTxHash(undefined);
        }}
        step={walletStep}
        action="Close Position"
        txHash={currentTxHash}
      />
    </>
  );
}
