"use client";

import React from "react";
import { Modal } from "./modal";
import { motion, AnimatePresence } from "framer-motion";

export type WalletTxStep =
  | "idle"
  | "wallet_request"
  | "approving"
  | "approved"
  | "submitting"
  | "confirming"
  | "confirmed"
  | "failed";

interface WalletTxModalProps {
  open: boolean;
  onClose: () => void;
  step: WalletTxStep;
  action: string; // e.g. "Deposit", "Add Liquidity", "Place Order"
  asset?: string;
  amount?: string;
  txHash?: string;
  errorMessage?: string;
}

const STEP_CONFIG: Record<
  WalletTxStep,
  { title: string; subtitle: string; icon: "wallet" | "spinner" | "check" | "error"; color: string }
> = {
  idle: { title: "", subtitle: "", icon: "wallet", color: "#703AE6" },
  wallet_request: {
    title: "Requesting Wallet",
    subtitle: "Open your wallet to continue",
    icon: "wallet",
    color: "#703AE6",
  },
  approving: {
    title: "Approve in Wallet",
    subtitle: "Confirm the token approval in your wallet",
    icon: "spinner",
    color: "#F5A623",
  },
  approved: {
    title: "Token Approved",
    subtitle: "Preparing transaction...",
    icon: "check",
    color: "#24A0A9",
  },
  submitting: {
    title: "Sending Transaction",
    subtitle: "Confirm the transaction in your wallet",
    icon: "spinner",
    color: "#703AE6",
  },
  confirming: {
    title: "Transaction Submitted",
    subtitle: "Waiting for on-chain confirmation...",
    icon: "spinner",
    color: "#24A0A9",
  },
  confirmed: {
    title: "Transaction Confirmed",
    subtitle: "Your transaction was successful",
    icon: "check",
    color: "#2E7D32",
  },
  failed: {
    title: "Transaction Failed",
    subtitle: "Something went wrong",
    icon: "error",
    color: "#C62828",
  },
};

// Animated spinner SVG
const Spinner = ({ color = "#703AE6", size = 48 }: { color?: string; size?: number }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  >
    <circle cx="25" cy="25" r="20" fill="none" stroke="#E2E2E2" strokeWidth="4" />
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke={color}
      strokeWidth="4"
      strokeDasharray="80 50"
      strokeLinecap="round"
    />
  </motion.svg>
);

// Wallet icon
const WalletIcon = ({ color = "#703AE6", size = 48 }: { color?: string; size?: number }) => (
  <motion.div
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="3" stroke={color} strokeWidth="1.5" />
      <path d="M6 6V5C6 3.89543 6.89543 3 8 3H16C17.1046 3 18 3.89543 18 5V6" stroke={color} strokeWidth="1.5" />
      <circle cx="17" cy="13" r="1.5" fill={color} />
    </svg>
  </motion.div>
);

// Checkmark icon
const CheckIcon = ({ color = "#2E7D32", size = 48 }: { color?: string; size?: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
  >
    <svg width={size} height={size} viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="23" fill={color} opacity="0.1" />
      <circle cx="25" cy="25" r="23" fill="none" stroke={color} strokeWidth="2" />
      <motion.path
        d="M15 25 L22 32 L35 19"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
    </svg>
  </motion.div>
);

// Error icon
const ErrorIcon = ({ color = "#C62828", size = 48 }: { color?: string; size?: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
  >
    <svg width={size} height={size} viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="23" fill={color} opacity="0.1" />
      <circle cx="25" cy="25" r="23" fill="none" stroke={color} strokeWidth="2" />
      <path d="M18 18 L32 32 M32 18 L18 32" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  </motion.div>
);

const StepIcon = ({ icon, color }: { icon: string; color: string }) => {
  switch (icon) {
    case "wallet":
      return <WalletIcon color={color} />;
    case "spinner":
      return <Spinner color={color} />;
    case "check":
      return <CheckIcon color={color} />;
    case "error":
      return <ErrorIcon color={color} />;
    default:
      return null;
  }
};

// Progress steps indicator
const ProgressSteps = ({ currentStep }: { currentStep: WalletTxStep }) => {
  const steps = [
    { key: "approve", label: "Approve", activeOn: ["wallet_request", "approving", "approved"] },
    { key: "submit", label: "Submit", activeOn: ["submitting"] },
    { key: "confirm", label: "Confirm", activeOn: ["confirming", "confirmed"] },
  ];

  const stepOrder = [
    "wallet_request",
    "approving",
    "approved",
    "submitting",
    "confirming",
    "confirmed",
  ];
  const currentIdx = stepOrder.indexOf(currentStep);

  return (
    <div className="flex items-center gap-2 w-full px-4">
      {steps.map((step, i) => {
        const stepStartIdx = stepOrder.indexOf(step.activeOn[0]);
        const stepEndIdx = stepOrder.indexOf(step.activeOn[step.activeOn.length - 1]);
        const isActive = step.activeOn.includes(currentStep);
        const isCompleted = currentIdx > stepEndIdx;
        const isPending = currentIdx < stepStartIdx;

        return (
          <React.Fragment key={step.key}>
            {i > 0 && (
              <div
                className="flex-1 h-[2px] rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: isCompleted || isActive ? "#703AE6" : "#E2E2E2",
                }}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                style={{
                  backgroundColor: isCompleted
                    ? "#703AE6"
                    : isActive
                      ? "#703AE6"
                      : "#E2E2E2",
                  color: isCompleted || isActive ? "#FFFFFF" : "#919191",
                }}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path
                      d="M3 6 L5 8 L9 4"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className="text-[9px] font-medium transition-colors duration-300"
                style={{ color: isActive || isCompleted ? "#703AE6" : "#919191" }}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const WalletTxModal = ({
  open,
  onClose,
  step,
  action,
  asset,
  amount,
  txHash,
  errorMessage,
}: WalletTxModalProps) => {
  if (step === "idle") return null;

  const config = STEP_CONFIG[step];
  const canClose = step === "confirmed" || step === "failed";

  return (
    <Modal open={open} onClose={canClose ? onClose : () => {}}>
      <div className="w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div
          className="h-[4px] w-full transition-colors duration-500"
          style={{ backgroundColor: config.color }}
        />

        <div className="p-6 flex flex-col items-center gap-5">
          {/* Rainbow-style wallet header */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#703AE6] to-[#24A0A9] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="6" width="20" height="14" rx="3" stroke="white" strokeWidth="2" />
                  <circle cx="17" cy="13" r="1.5" fill="white" />
                </svg>
              </div>
              <span className="text-[14px] font-bold text-[#111111]">
                {action}
              </span>
            </div>
            {canClose && (
              <button
                onClick={onClose}
                className="w-[28px] h-[28px] rounded-full bg-[#F4F4F4] flex items-center justify-center cursor-pointer hover:bg-[#E2E2E2] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M2 2 L10 10 M10 2 L2 10" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Amount display */}
          {amount && asset && (
            <div className="w-full py-3 px-4 rounded-xl bg-[#F9F9F9] border border-[#E2E2E2]">
              <div className="text-[10px] font-medium text-[#919191] mb-1">Amount</div>
              <div className="text-[20px] font-bold text-[#111111]">
                {amount} <span className="text-[14px] text-[#666666]">{asset}</span>
              </div>
            </div>
          )}

          {/* Progress steps */}
          {step !== "failed" && <ProgressSteps currentStep={step} />}

          {/* Icon + status */}
          <div className="flex flex-col items-center gap-3 py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-3"
              >
                <StepIcon icon={config.icon} color={config.color} />
                <div className="text-center">
                  <div className="text-[16px] font-bold text-[#111111]">
                    {config.title}
                  </div>
                  <div className="text-[12px] font-medium text-[#919191] mt-1">
                    {step === "failed" && errorMessage ? errorMessage : config.subtitle}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Tx hash */}
          {txHash && (step === "confirming" || step === "confirmed") && (
            <div className="w-full py-2 px-3 rounded-lg bg-[#F4F4FF] border border-[#E8E5F5]">
              <div className="text-[9px] font-medium text-[#919191] mb-0.5">Transaction Hash</div>
              <div className="text-[11px] font-mono text-[#703AE6] truncate">
                {txHash}
              </div>
            </div>
          )}

          {/* Close button for final states */}
          {canClose && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-[14px] font-semibold cursor-pointer transition-colors"
              style={{
                backgroundColor: step === "confirmed" ? "#703AE6" : "#F4F4F4",
                color: step === "confirmed" ? "#FFFFFF" : "#111111",
              }}
            >
              {step === "confirmed" ? "Done" : "Close"}
            </button>
          )}

          {/* Powered by footer */}
          <div className="flex items-center gap-1 text-[9px] text-[#C6C6C6]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#D0D0D0" strokeWidth="1.5" />
              <path d="M8 12 L11 15 L16 9" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Secured by Rainbow Wallet
          </div>
        </div>
      </div>
    </Modal>
  );
};
