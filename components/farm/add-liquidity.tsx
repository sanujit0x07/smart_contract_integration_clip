import Image from "next/image"
import { useState } from "react"
import { iconPaths } from "@/lib/constants"
import { InfoCard } from "../margin/info-card"
import { MARGIN_ACCOUNT_INFO_ITEMS } from "@/lib/constants/margin"
import { useMarginAccountInfoStore } from "@/store/margin-account-info-store"
import { useUserStore } from "@/store/user"
import { Button } from "../ui/button"
import { useTheme } from "@/contexts/theme-context"
import { addLiquidityTx } from "@/lib/utils/farm/transactions"
import { useFarmStore, type FarmPosition } from "@/store/farm-store"
import { getMockBalance } from "@/lib/utils/mock/mockBalances"
import { WalletTxModal, type WalletTxStep } from "../ui/wallet-tx-modal"

export const AddLiquidity = () => {
  const [value, setValue] = useState<string>("")
  const [txStatus, setTxStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Wallet modal state
  const [walletStep, setWalletStep] = useState<WalletTxStep>("idle")
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [currentTxHash, setCurrentTxHash] = useState<string | undefined>()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const { isDark } = useTheme()

  const userAddress = useUserStore(user => user.address)
  const isSubmitting = useFarmStore((s) => s.isSubmitting)
  const setFarmData = useFarmStore((s) => s.set)
  const getFarmData = useFarmStore((s) => s.get)

  const marginBalance = getMockBalance("USDT", "margin")

  // Get margin account info from global store using selector to prevent unnecessary re-renders
  const totalBorrowedValue = useMarginAccountInfoStore(
    (state) => state.totalBorrowedValue
  );
  const totalCollateralValue = useMarginAccountInfoStore(
    (state) => state.totalCollateralValue
  );
  const totalValue = useMarginAccountInfoStore((state) => state.totalValue);
  const avgHealthFactor = useMarginAccountInfoStore(
    (state) => state.avgHealthFactor
  );
  const timeToLiquidation = useMarginAccountInfoStore(
    (state) => state.timeToLiquidation
  );
  const borrowRate = useMarginAccountInfoStore((state) => state.borrowRate);
  const liquidationPremium = useMarginAccountInfoStore(
    (state) => state.liquidationPremium
  );
  const liquidationFee = useMarginAccountInfoStore(
    (state) => state.liquidationFee
  );
  const debtLimit = useMarginAccountInfoStore((state) => state.debtLimit);
  const minDebt = useMarginAccountInfoStore((state) => state.minDebt);
  const maxDebt = useMarginAccountInfoStore((state) => state.maxDebt);

  const marginAccountInfo = {
    totalBorrowedValue,
    totalCollateralValue,
    totalValue,
    avgHealthFactor,
    timeToLiquidation,
    borrowRate,
    liquidationPremium,
    liquidationFee,
    debtLimit,
    minDebt,
    maxDebt,
  };

  const handleAddLiquidity = async () => {
    const amount = Number(value)
    if (!amount || amount <= 0) return

    setError(null)
    setTxStatus(null)
    setFarmData({ isSubmitting: true })

    // Open wallet modal
    setShowWalletModal(true)
    setWalletStep("idle")
    setCurrentTxHash(undefined)

    const result = await addLiquidityTx(
      { asset: "USDT", amount },
      (status) => setTxStatus(status),
      (step, txHash) => {
        setWalletStep(step)
        if (txHash) setCurrentTxHash(txHash)
      }
    )

    if (result.success) {
      const newPosition: FarmPosition = {
        id: crypto.randomUUID(),
        pair: "ETH/USDT",
        asset: "USDT",
        lpTokens: amount / 19.8, // mock LP token ratio
        valueUsd: amount,
        apr: 12.5,
        depositedAt: new Date().toISOString(),
        txHash: result.txHash!,
      }

      const currentPositions = getFarmData((s) => s.positions)
      const currentTVL = getFarmData((s) => s.totalTVL)
      setFarmData({
        positions: [...currentPositions, newPosition],
        totalTVL: currentTVL + amount,
        isSubmitting: false,
        txStatus: "confirmed",
      })

      setTxStatus("confirmed")
      setValue("")
    } else {
      setFarmData({ isSubmitting: false, lastError: result.error ?? null })
      setError(result.error ?? "Transaction failed")
      setTxStatus(null)
    }
  }

  const handleCloseWalletModal = () => {
    setShowWalletModal(false)
    setWalletStep("idle")
    setCurrentTxHash(undefined)
  }

  const getButtonText = () => {
    if (!userAddress) return "Connect Wallet"
    if (isSubmitting) return "Processing..."
    if (Number(value) > 0) return "Add Liquidity"
    return "Enter Amount"
  }

  return (
    <>
      <div className={`w-full h-fit p-[20px] rounded-[16px] ${
        isDark ? "bg-[#111111]" : "bg-white"
      }`}>
        <div className="w-full flex items-center gap-[20px]">
          <div className="w-full h-full flex flex-col gap-[24px]">
            <div className="w-full h-fit ">
              <input
                type="text"
                placeholder="0.0"
                value={value}
                onChange={onChange}
                className={`w-full h-fit bg-transparent outline-none border-none text-[16px] font-medium placeholder:text-[#CCCCCC] ${
                  isDark ? "text-white" : "text-black"
                }`}
              />
            </div>
            <div className={`w-full h-fit text-[10px] font-medium ${
              isDark ? "text-[#919191]" : "text-[#76737B]"
            }`}>
              ${Number(value || 0).toFixed(2)}
            </div>
          </div>
          <div className="w-fit justify-end  items-end h-fit flex flex-col gap-[24px] ">
            <div className=" w-fit justify-end items-end h-fit flex gap-[4px]">
              <Image src={iconPaths["USDT"]} alt="USDT" width={20} height={20} />
              <span className={`text-[14px] font-semibold ${
                isDark ? "text-white" : "text-[#111111]"
              }`}>USDT</span>
            </div>
            <div className=" justify-end items-end w-fit flex text-end h-fit gap-[4px] ">
              <span className={`text-nowrap text-end text-[12px] font-medium ${
                isDark ? "text-[#919191]" : "text-[#5C5B5B]"
              }`}>Margin Balance:</span>
              <span className={`text-nowrap text-end text-[12px] font-medium underline cursor-pointer ${
                isDark ? "text-[#919191]" : "text-[#5C5B5B]"
              }`}>{marginBalance.toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      </div>

      {(Number(value) > 0) && (
        <div>
          <InfoCard
            data={marginAccountInfo}
            items={[...MARGIN_ACCOUNT_INFO_ITEMS]}
          />
        </div>
      )}

      <Button
        disabled={!userAddress || isSubmitting || (Number(value) <= 0)}
        type="gradient"
        size="large"
        text={getButtonText()}
        onClick={handleAddLiquidity}
      />

      <WalletTxModal
        open={showWalletModal}
        onClose={handleCloseWalletModal}
        step={walletStep}
        action="Add Liquidity"
        asset="USDT"
        amount={value}
        txHash={currentTxHash}
        errorMessage={error ?? undefined}
      />
    </>
  )
}
