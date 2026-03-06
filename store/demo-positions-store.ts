import { create } from "zustand";

export interface DemoPosition {
  id: string;
  date: string;
  time: string;
  type: "Supply" | "Withdraw";
  amount: string;
  amountUsd: string;
  asset: string;
  userId: string;
}

interface DemoPositionsState {
  currentPositions: DemoPosition[];
  positionHistory: DemoPosition[];
  addPosition: (position: Omit<DemoPosition, "id">) => void;
  removePosition: (id: string) => void;
}

export const useDemoPositionsStore = create<DemoPositionsState>((set) => ({
  currentPositions: [],
  positionHistory: [],
  addPosition: (position) => {
    const newPosition: DemoPosition = {
      ...position,
      id: Date.now().toString(),
    };
    set((state) => ({
      currentPositions: [newPosition, ...state.currentPositions],
      positionHistory: [newPosition, ...state.positionHistory],
    }));
  },
  removePosition: (id) => {
    set((state) => ({
      currentPositions: state.currentPositions.filter((p) => p.id !== id),
    }));
  },
}));
