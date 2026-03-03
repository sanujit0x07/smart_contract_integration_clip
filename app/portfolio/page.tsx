"use client";

import { AccountStatsGhost } from "@/components/earn/account-stats-ghost";
import { PortfolioSection } from "@/components/portfolio/portfolio-section";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { WalletTxModal, type WalletTxStep } from "@/components/ui/wallet-tx-modal";
import { useMemo, useState, useCallback } from "react";
import { getPortfolioSummary } from "@/lib/utils/portfolio/aggregator";
import { portfolioDepositTx, portfolioWithdrawTx } from "@/lib/utils/portfolio/transactions";
import { getMockBalance } from "@/lib/utils/mock/mockBalances";
import { useTheme } from "@/contexts/theme-context";

export default function PortfolioPage() {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("USDT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Wallet modal state
  const [walletStep, setWalletStep] = useState<WalletTxStep>("idle");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<string | undefined>();
  const [walletTxAction, setWalletTxAction] = useState("Deposit");

  const { isDark } = useTheme();

  // Recompute portfolio data on refreshKey change
  const summary = useMemo(() => {
    return getPortfolioSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const walletBalance = getMockBalance(selectedAsset, "wallet");
  const marginBalance = getMockBalance(selectedAsset, "margin");

  const accountStatsItems = useMemo(() => {
    return [
      {
        id: "1",
        name: "Total Assets",
        amount: `$${summary.totalAssets.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      {
        id: "2",
        name: "Net P&L",
        amount: `${summary.netPnl >= 0 ? "+" : ""}$${summary.netPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      {
        id: "3",
        name: "Total Volume",
        amount: `$${summary.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
    ];
  }, [summary]);

  const handleCloseWalletModal = () => {
    setShowWalletModal(false);
    setWalletStep("idle");
    setCurrentTxHash(undefined);
  };

  const handleDeposit = useCallback(async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;

    setIsSubmitting(true);
    setError(null);
    setTxStatus(null);

    // Open wallet modal
    setWalletTxAction("Deposit");
    setShowWalletModal(true);
    setWalletStep("idle");
    setCurrentTxHash(undefined);

    const result = await portfolioDepositTx(
      { asset: selectedAsset, amount: amt },
      (status) => setTxStatus(status),
      (step, txHash) => {
        setWalletStep(step);
        if (txHash) setCurrentTxHash(txHash);
      }
    );

    if (result.success) {
      setTxStatus("confirmed");
      setAmount("");
      setRefreshKey((k) => k + 1);
      setTimeout(() => setShowDepositModal(false), 1500);
    } else {
      setError(result.error ?? "Deposit failed");
    }

    setIsSubmitting(false);
  }, [amount, selectedAsset]);

  const handleWithdraw = useCallback(async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;

    setIsSubmitting(true);
    setError(null);
    setTxStatus(null);

    // Open wallet modal
    setWalletTxAction("Withdraw");
    setShowWalletModal(true);
    setWalletStep("idle");
    setCurrentTxHash(undefined);

    const result = await portfolioWithdrawTx(
      { asset: selectedAsset, amount: amt },
      (status) => setTxStatus(status),
      (step, txHash) => {
        setWalletStep(step);
        if (txHash) setCurrentTxHash(txHash);
      }
    );

    if (result.success) {
      setTxStatus("confirmed");
      setAmount("");
      setRefreshKey((k) => k + 1);
      setTimeout(() => setShowWithdrawModal(false), 1500);
    } else {
      setError(result.error ?? "Withdraw failed");
    }

    setIsSubmitting(false);
  }, [amount, selectedAsset]);

  const resetModal = () => {
    setAmount("");
    setTxStatus(null);
    setError(null);
    setIsSubmitting(false);
  };

  const renderModalContent = (type: "deposit" | "withdraw") => {
    const isDeposit = type === "deposit";
    const balance = isDeposit ? walletBalance : marginBalance;
    const balanceLabel = isDeposit ? "Wallet Balance" : "Margin Balance";

    return (
      <div className={`w-[400px] rounded-2xl p-6 flex flex-col gap-4 ${isDark ? "bg-[#222222]" : "bg-white"}`}>
        <div className="flex justify-between items-center">
          <h3 className={`text-[18px] font-bold ${isDark ? "text-white" : "text-[#111111]"}`}>
            {isDeposit ? "Deposit" : "Withdraw"}
          </h3>
          <button
            onClick={() => {
              isDeposit ? setShowDepositModal(false) : setShowWithdrawModal(false);
              resetModal();
            }}
            className={`text-[20px] cursor-pointer ${isDark ? "text-white" : "text-[#111111]"}`}
          >
            x
          </button>
        </div>

        {/* Asset selector */}
        <div className="flex gap-2">
          {["USDT", "USDC", "ETH"].map((asset) => (
            <button
              key={asset}
              type="button"
              onClick={() => setSelectedAsset(asset)}
              className={`flex-1 py-2 rounded-lg cursor-pointer text-[12px] font-semibold ${
                selectedAsset === asset
                  ? "bg-[#703AE6] text-white"
                  : isDark
                    ? "bg-[#333333] text-white"
                    : "bg-[#F4F4F4] text-[#111111]"
              }`}
            >
              {asset}
            </button>
          ))}
        </div>

        {/* Balance display */}
        <div className={`text-[12px] font-medium ${isDark ? "text-[#919191]" : "text-[#5C5B5B]"}`}>
          {balanceLabel}: {balance.toFixed(4)} {selectedAsset}
        </div>

        {/* Amount input */}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className={`w-full h-[44px] rounded-xl border px-4 text-[14px] font-medium outline-none ${
            isDark
              ? "bg-[#111111] border-[#444444] text-white placeholder:text-[#666666]"
              : "bg-white border-[#E2E2E2] text-[#111111] placeholder:text-[#C6C6C6]"
          }`}
        />

        {/* Percentage buttons */}
        <div className="flex gap-2">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setAmount(((balance * pct) / 100).toFixed(4))}
              className={`flex-1 py-2 rounded-lg cursor-pointer text-[12px] font-medium ${
                isDark ? "bg-[#333333] text-white" : "bg-[#F4F4F4] text-[#111111]"
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-[#FFEBEE] text-[#C62828] text-[12px] font-medium">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          disabled={isSubmitting || Number(amount) <= 0}
          type="solid"
          size="large"
          text={isSubmitting ? "Processing..." : (isDeposit ? "Deposit" : "Withdraw")}
          onClick={isDeposit ? handleDeposit : handleWithdraw}
        />
      </div>
    );
  };

  return (
    <div className="py-[80px] px-[40px] w-full h-fit">
      <div className="flex flex-col gap-[40px] w-full h-fit">
        <div className="flex flex-col gap-[20px] w-full h-fit">
          <div className="flex justify-between w-full items-center">
            <div className={`w-full text-[24px] font-bold ${isDark ? "text-white" : "text-black"}`}>Portfolio</div>
            <div className="w-full flex gap-[8px] justify-end">
              <Button
                width="w-[79px]"
                text="Deposit"
                size="small"
                type="solid"
                disabled={false}
                onClick={() => { resetModal(); setShowDepositModal(true); }}
              />
              <Button
                width="w-[79px]"
                text="Withdraw"
                size="small"
                type="solid"
                disabled={false}
                onClick={() => { resetModal(); setShowWithdrawModal(true); }}
              />
              <Button
                width="w-[79px]"
                text="Transfer"
                size="small"
                type="solid"
                disabled={false}
              />
              <Button
                width="w-[79px]"
                text="History"
                size="small"
                type="solid"
                disabled={false}
              />
            </div>
          </div>

          <PortfolioSection />
          <div className="w-[422px] h-fit">
            <AccountStatsGhost items={accountStatsItems} type="background" gridCols="grid-cols-2" gridRows="grid-rows-2" />
          </div>

          {/* Portfolio breakdown */}
          {summary.breakdown.length > 0 && (
            <div className={`w-full rounded-2xl border p-6 ${isDark ? "bg-[#222222] border-[#333333]" : "bg-[#F7F7F7] border-[#E2E2E2]"}`}>
              <h3 className={`text-[16px] font-semibold mb-4 ${isDark ? "text-white" : "text-[#111111]"}`}>
                Breakdown by Section
              </h3>
              <div className="flex flex-col gap-2">
                {summary.breakdown.map((item) => (
                  <div key={item.section} className={`flex justify-between items-center py-2 border-b ${isDark ? "border-[#333333]" : "border-[#E2E2E2]"}`}>
                    <span className={`text-[14px] font-medium ${isDark ? "text-[#CCCCCC]" : "text-[#333333]"}`}>
                      {item.section}
                    </span>
                    <div className="flex gap-6">
                      <span className={`text-[14px] font-semibold ${isDark ? "text-white" : "text-[#111111]"}`}>
                        ${item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                      {item.pnl !== 0 && (
                        <span className={`text-[14px] font-medium ${item.pnl >= 0 ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                          {item.pnl >= 0 ? "+" : ""}${item.pnl.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal - uses Modal component with z-[1000] */}
      <Modal open={showDepositModal} onClose={() => { setShowDepositModal(false); resetModal(); }}>
        {renderModalContent("deposit")}
      </Modal>

      {/* Withdraw Modal - uses Modal component with z-[1000] */}
      <Modal open={showWithdrawModal} onClose={() => { setShowWithdrawModal(false); resetModal(); }}>
        {renderModalContent("withdraw")}
      </Modal>

      {/* Wallet Transaction Modal - Rainbow-like popup */}
      <WalletTxModal
        open={showWalletModal}
        onClose={handleCloseWalletModal}
        step={walletStep}
        action={walletTxAction}
        asset={selectedAsset}
        amount={amount}
        txHash={currentTxHash}
        errorMessage={error ?? undefined}
      />
    </div>
  );
}
