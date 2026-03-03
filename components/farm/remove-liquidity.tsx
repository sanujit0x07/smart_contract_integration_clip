import { DropdownOptions } from "@/lib/constants"
import { Dropdown } from "../ui/dropdown"
import { useState } from "react"
import { Button } from "../ui/button"
import { useUserStore } from "@/store/user"
import { useTheme } from "@/contexts/theme-context"
import { PERCENTAGE_COLORS } from "@/lib/constants/margin"
import { removeLiquidityTx } from "@/lib/utils/farm/transactions"
import { useFarmStore } from "@/store/farm-store"
import { WalletTxModal, type WalletTxStep } from "../ui/wallet-tx-modal"

export const RemoveLiquidity = () => {
    const [selectedOption, setSelectedOption] = useState<string>("USDT")
    const [value, setValue] = useState<string>("")
    const [selectedPercentage, setSelectedPercentage] = useState<number>(0)
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
    const userAddress = useUserStore((state) => state.address)
    const isSubmitting = useFarmStore((s) => s.isSubmitting)
    const setFarmData = useFarmStore((s) => s.set)
    const getFarmData = useFarmStore((s) => s.get)

    const handleRemoveLiquidity = async () => {
        const amount = Number(value)
        if (!amount || amount <= 0) return

        setError(null)
        setTxStatus(null)
        setFarmData({ isSubmitting: true })

        // Open wallet modal
        setShowWalletModal(true)
        setWalletStep("idle")
        setCurrentTxHash(undefined)

        const result = await removeLiquidityTx(
            { asset: selectedOption, amount },
            (status) => setTxStatus(status),
            (step, txHash) => {
                setWalletStep(step)
                if (txHash) setCurrentTxHash(txHash)
            }
        )

        if (result.success) {
            // Remove value from positions (reduce first matching position or remove it)
            const currentPositions = getFarmData((s) => s.positions)
            const currentTVL = getFarmData((s) => s.totalTVL)
            let remaining = amount

            const updatedPositions = currentPositions
                .map((pos) => {
                    if (remaining <= 0 || pos.asset !== selectedOption) return pos
                    if (pos.valueUsd <= remaining) {
                        remaining -= pos.valueUsd
                        return null // fully removed
                    }
                    pos.valueUsd -= remaining
                    pos.lpTokens = pos.valueUsd / 19.8
                    remaining = 0
                    return pos
                })
                .filter(Boolean)

            setFarmData({
                positions: updatedPositions as any,
                totalTVL: Math.max(0, currentTVL - amount),
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
        if (Number(value) > 0) return "Remove Liquidity"
        return "Enter Amount"
    }

    return <div className="w-full h-fit flex flex-col gap-[24px]">
        <div className={`w-full h-fit flex rounded-[16px] gap-[8px] p-[20px] border-[1px] ${isDark ? "bg-[#111111]" : "bg-[#FFFFFF]"
            }`}>
            <div className="w-full h-fit flex flex-col gap-[20px]">
                <Dropdown items={DropdownOptions} setSelectedOption={setSelectedOption} selectedOption={selectedOption} classname="w-fit h-fit gap-[4px]" dropdownClassname="w-full h-fit" />
                <div className=" flex flex-col gap-[8px]">
                    <div className="w-full h-fit">
                        <input
                            type="text"
                            placeholder="0.00"
                            className={`w-full h-fit text-[16px] font-medium placeholder:text-[#CCCCCC] outline-none border-none ${isDark ? "text-white" : "text-[#111111]"
                                }`}
                            value={value}
                            onChange={onChange}
                        />
                    </div>
                    <div className={`w-full h-fit text-[12px] font-medium ${isDark ? "text-[#919191]" : "text-[#76737B]"
                        }`}>
                        ${Number(value || 0).toFixed(2)}
                    </div>
                </div>
            </div>
            <div className="w-fit h-fit flex flex-col gap-[8px] items-end">
                <div className="flex gap-[8px]">
                    {[10, 25, 50, 100].map((pct) => {
                        const selectedColor = PERCENTAGE_COLORS[pct] || "bg-[#F91A6F]";
                        return (
                            <button
                                key={pct}
                                type="button"
                                onClick={() => setSelectedPercentage(pct)}
                                className={`flex justify-center items-center cursor-pointer text-[14px] font-semibold w-fit h-[36px] rounded-[10px] px-3 ${selectedPercentage === pct
                                        ? `${selectedColor} text-white`
                                        : isDark
                                            ? "bg-[#222222] text-white"
                                            : "bg-[#F4F4F4] text-[#111111]"
                                    }`}
                                aria-pressed={selectedPercentage === pct}
                                aria-label={`Select ${pct}%`}
                            >
                                {pct}%
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>

        <Button
            disabled={!userAddress || isSubmitting || (Number(value) <= 0)}
            type="gradient"
            size="large"
            text={getButtonText()}
            onClick={handleRemoveLiquidity}
        />

        <WalletTxModal
            open={showWalletModal}
            onClose={handleCloseWalletModal}
            step={walletStep}
            action="Remove Liquidity"
            asset={selectedOption}
            amount={value}
            txHash={currentTxHash}
            errorMessage={error ?? undefined}
        />
    </div>
}
