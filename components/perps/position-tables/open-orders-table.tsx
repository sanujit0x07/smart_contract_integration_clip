import Image from "next/image";
import { useMemo, useState } from "react";
import { Column } from "../../ui/Table";
import { Table } from "../../ui/Table";
import { Modal } from "../../ui/modal";
import { ChaseOrderModal } from "../modals/chase-order-modal";
import { usePerpsTradeStore } from "@/store/perps-trade-store";
import { cancelPerpsOrderTx } from "@/lib/utils/perps/transactions";
import { addMockBalance } from "@/lib/utils/mock/mockBalances";

type OrderTabType =
  | "limitMarket"
  | "trailingStop"
  | "tpSl"
  | "trigger"
  | "iceberg"
  | "twap";

// Base type for common fields
type BaseOrderType = {
  id: string;
  dateTime: string;
  direction: {
    side: "Open long" | "Open short" | "Close long" | "Close short";
    mode: "Cross" | "Isolated";
  };
  pair: string;
  marginCoin: string;
};

// Limit/Market order type
export type LimitMarketOrderType = BaseOrderType & {
  timeInForce: string;
  orderType: string;
  orderQty: string;
  filledQty: string;
  price: string;
  takeProfit?: string;
  stopLoss?: string;
  status: string;
  reduceOnly: "Yes" | "No";
};

// Trailing Stop order type
export type TrailingStopOrderType = BaseOrderType & {
  type: string;
  orderQty: string;
  triggerPrice: string;
  callbackRate: string;
  takeProfit?: string;
  stopLoss?: string;
  executionPrice: string;
  reduceOnly: "Yes" | "No";
};

// TP/SL order type
export type TpSlOrderType = BaseOrderType & {
  type: string;
  orderQty: string;
  trigger: string;
  callbackRate: string;
  takeProfit?: string;
  stopLoss?: string;
  executionPrice: string;
  status: string;
};

// Trigger order type
export type TriggerOrderType = BaseOrderType & {
  type: string;
  orderQty: string;
  triggerPrice: string;
  executionPrice: string;
  takeProfit?: string;
  stopLoss?: string;
  reduceOnly: "Yes" | "No";
  status: string;
};

// Iceberg order type
export type IcebergOrderType = BaseOrderType & {
  orderType: string;
  totalQty: string;
  filledQty: string;
  avgFilledPrice: string;
  priceLimit: string;
  orderPreferences: string;
  reduceOnly: "Yes" | "No";
  status: string;
};

// TWAP order type
export type TwapOrderType = BaseOrderType & {
  orderType: string;
  totalQty: string;
  filledQty: string;
  avgFilledPrice: string;
  frequency: string;
  totalRunningTime: string;
  runningTime: string;
  reduceOnly: "Yes" | "No";
};

// Column definitions for Limit/Market - function to allow callbacks
const getLimitMarketColumns = (
  onChase: (orderId: string) => void,
  onCancel: (orderId: string) => void,
): Column<LimitMarketOrderType>[] => [
  {
    id: "dateTime",
    header: "Time",
    render: (row) => {
      const [date, time] = row.dateTime.split(" ");
      return (
        <div className="flex flex-col">
          <span>{date}</span>
          <span>{time}</span>
        </div>
      );
    },
  },
  {
    id: "direction",
    header: "Direction",
    render: (row) => (
      <div
        className={`flex flex-col ${row.direction.side.includes("long") ? "text-[#16A3A3]" : "text-[#FC5457]"}`}
      >
        <span>{row.direction.side}</span>
        <span className="text-[11px]">{row.direction.mode}</span>
      </div>
    ),
  },
  {
    id: "pair",
    header: "Futures | Coin",
    render: (row) => (
      <div className="flex flex-col">
        <span>{row.pair}</span>
        <span className="text-[#16A3A3] text-[11px]">{row.marginCoin}</span>
      </div>
    ),
  },
  {
    id: "orderType",
    header: (
      <div className="flex flex-col leading-tight">
        <span>Time in force |</span>
        <span>Order Type</span>
      </div>
    ),
    render: (row) => (
      <div className="flex flex-col">
        <span>{row.timeInForce}</span>
        <span className="text-[11px]">{row.orderType}</span>
      </div>
    ),
  },
  {
    id: "quantity",
    header: (
      <div className="flex flex-col leading-tight">
        <span>Order Quantity |</span>
        <span>Filled Quantity</span>
      </div>
    ),
    render: (row) => (
      <div className="flex gap-2.5">
        <div className="flex flex-col">
          <span>{row.orderQty}</span>
          <span>{row.filledQty}</span>
        </div>
        <Image src="/icons/edit.svg" alt="edit" width={16} height={16} />
      </div>
    ),
  },
  {
    id: "price",
    header: "Price",
    render: (row) => (
      <div className="flex gap-2.5">
        <span>{row.price}</span>
        <Image src="/icons/edit.svg" alt="edit" width={16} height={16} />
      </div>
    ),
  },
  {
    id: "tpSl",
    header: (
      <div className="flex flex-col leading-tight">
        <span>Take Profit |</span>
        <span>Stop Loss</span>
      </div>
    ),
    render: (row) => (
      <div className="flex gap-2.5">
        <span>{row.takeProfit ?? "--"}</span>
        <span>/</span>
        <span className="text-[12px]">{row.stopLoss ?? "--"}</span>
        <Image src="/icons/edit.svg" alt="edit" width={16} height={16} />
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
  },
  {
    id: "reduceOnly",
    header: "Reduce-only",
    accessorKey: "reduceOnly",
  },
  {
    id: "actions",
    header: (
      <button
        type="button"
        className="cursor-pointer px-3 py-2 rounded-lg text-[12px] leading-[18px] text-[#111111] hover:bg-[#F1EBFD] hover:text-[#703AE6]"
      >
        Cancel all
      </button>
    ),
    sticky: true,
    render: (row) => (
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => onChase(row.id)}
          className="cursor-pointer px-3 py-2 border-[0.75px] border-[#E2E2E2] bg-[#FFFFFF] rounded-md text-[12px] leading-[18px] text-[#111111]"
        >
          Chase
        </button>
        <button
          onClick={() => onCancel(row.id)}
          className="cursor-pointer px-3 py-2 border-[0.75px] border-[#E2E2E2] bg-[#FFFFFF] rounded-md text-[12px] leading-[18px] text-[#111111]"
        >
          Cancel
        </button>
      </div>
    ),
    align: "right",
    className: "min-w-[140px]",
  },
];

// Column definitions for Trailing Stop
const trailingStopColumns: Column<TrailingStopOrderType>[] = [
  {
    id: "dateTime",
    header: "Time",
    render: (row) => {
      const [date, time] = row.dateTime.split(" ");
      return (
        <div className="flex flex-col">
          <span>{date}</span>
          <span>{time}</span>
        </div>
      );
    },
  },
  {
    id: "direction",
    header: "Direction",
    render: (row) => (
      <div
        className={`flex flex-col ${row.direction.side.includes("long") ? "text-[#16A3A3]" : "text-[#FC5457]"}`}
      >
        <span>{row.direction.side}</span>
        <span className="text-[11px]">{row.direction.mode}</span>
      </div>
    ),
  },
  {
    id: "pair",
    header: "Futures | Coin",
    render: (row) => (
      <div className="flex flex-col">
        <span>{row.pair}</span>
        <span className="text-[#16A3A3] text-[11px]">{row.marginCoin}</span>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "type",
  },
  {
    id: "orderQty",
    header: "Order Quantity",
    accessorKey: "orderQty",
  },
  {
    id: "triggerPrice",
    header: "Trigger price",
    accessorKey: "triggerPrice",
  },
  {
    id: "callbackRate",
    header: "Callback rate",
    accessorKey: "callbackRate",
  },
  {
    id: "tpSl",
    header: (
      <div className="flex flex-col leading-tight">
        <span>Take Profit |</span>
        <span>Stop Loss</span>
      </div>
    ),
    render: (row) => (
      <div className="flex gap-2.5">
        <span>{row.takeProfit ?? "--"}</span>
        <span>/</span>
        <span className="text-[12px]">{row.stopLoss ?? "--"}</span>
      </div>
    ),
  },
  {
    id: "executionPrice",
    header: "Execution Price",
    accessorKey: "executionPrice",
  },
  {
    id: "reduceOnly",
    header: "Reduce-only",
    accessorKey: "reduceOnly",
  },
  {
    id: "actions",
    header: (
      <button
        type="button"
        className="cursor-pointer px-3 py-2 rounded-lg text-[12px] leading-[18px] text-[#111111] hover:bg-[#F1EBFD] hover:text-[#703AE6]"
      >
        Cancel all
      </button>
    ),
    sticky: true,
    render: () => (
      <div className="flex gap-2 justify-end">
        <button className="cursor-pointer px-3 py-2 border-[0.75px] border-[#E2E2E2] bg-[#FFFFFF] rounded-md text-[12px] leading-[18px] text-[#111111]">
          Cancel
        </button>
      </div>
    ),
    align: "right",
    className: "min-w-[100px]",
  },
];

// Column definitions for TP/SL
const tpSlColumns: Column<TpSlOrderType>[] = [
  {
    id: "dateTime",
    header: "Time",
    render: (row) => {
      const [date, time] = row.dateTime.split(" ");
      return (
        <div className="flex flex-col">
          <span>{date}</span>
          <span>{time}</span>
        </div>
      );
    },
  },
  {
    id: "direction",
    header: "Direction",
    render: (row) => (
      <div
        className={`flex flex-col ${row.direction.side.includes("long") ? "text-[#16A3A3]" : "text-[#FC5457]"}`}
      >
        <span>{row.direction.side}</span>
        <span className="text-[11px]">{row.direction.mode}</span>
      </div>
    ),
  },
  {
    id: "pair",
    header: "Futures | Coin",
    render: (row) => (
      <div className="flex flex-col">
        <span>{row.pair}</span>
        <span className="text-[#16A3A3] text-[11px]">{row.marginCoin}</span>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "type",
  },
  {
    id: "orderQty",
    header: "Order Quantity",
    accessorKey: "orderQty",
  },
  {
    id: "trigger",
    header: "Trigger",
    accessorKey: "trigger",
  },
  {
    id: "callbackRate",
    header: "Callback rate",
    accessorKey: "callbackRate",
  },
  {
    id: "tpSl",
    header: (
      <div className="flex flex-col leading-tight">
        <span>Take Profit |</span>
        <span>Stop Loss</span>
      </div>
    ),
    render: (row) => (
      <div className="flex gap-2.5">
        <span>{row.takeProfit ?? "--"}</span>
        <span>/</span>
        <span className="text-[12px]">{row.stopLoss ?? "--"}</span>
      </div>
    ),
  },
  {
    id: "executionPrice",
    header: "Execution Price",
    accessorKey: "executionPrice",
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
  },
  {
    id: "actions",
    header: (
      <button
        type="button"
        className="cursor-pointer px-3 py-2 rounded-lg text-[12px] leading-[18px] text-[#111111] hover:bg-[#F1EBFD] hover:text-[#703AE6]"
      >
        Cancel all
      </button>
    ),
    sticky: true,
    render: () => (
      <div className="flex gap-2 justify-end">
        <button className="cursor-pointer px-3 py-2 border-[0.75px] border-[#E2E2E2] bg-[#FFFFFF] rounded-md text-[12px] leading-[18px] text-[#111111]">
          Cancel
        </button>
      </div>
    ),
    align: "right",
    className: "min-w-[100px]",
  },
];

// Column definitions for Trigger
const triggerColumns: Column<TriggerOrderType>[] = [
  {
    id: "dateTime",
    header: "Time",
    render: (row) => {
      const [date, time] = row.dateTime.split(" ");
      return (
        <div className="flex flex-col">
          <span>{date}</span>
          <span>{time}</span>
        </div>
      );
    },
  },
  {
    id: "direction",
    header: "Direction",
    render: (row) => (
      <div
        className={`flex flex-col ${row.direction.side.includes("long") ? "text-[#16A3A3]" : "text-[#FC5457]"}`}
      >
        <span>{row.direction.side}</span>
        <span className="text-[11px]">{row.direction.mode}</span>
      </div>
    ),
  },
  {
    id: "pair",
    header: "Futures | Coin",
    render: (row) => (
      <div className="flex flex-col">
        <span>{row.pair}</span>
        <span className="text-[#16A3A3] text-[11px]">{row.marginCoin}</span>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "type",
  },
  {
    id: "orderQty",
    header: "Order Quantity",
    accessorKey: "orderQty",
  },
  {
    id: "triggerPrice",
    header: "Trigger price",
    accessorKey: "triggerPrice",
  },
  {
    id: "executionPrice",
    header: "Execution price",
    accessorKey: "executionPrice",
  },
  {
    id: "tpSl",
    header: (
      <div className="flex flex-col leading-tight">
        <span>Take profit |</span>
        <span>Stop Loss</span>
      </div>
    ),
    render: (row) => (
      <div className="flex gap-2.5">
        <span>{row.takeProfit ?? "--"}</span>
        <span>/</span>
        <span className="text-[12px]">{row.stopLoss ?? "--"}</span>
      </div>
    ),
  },
  {
    id: "reduceOnly",
    header: "Reduce-only",
    accessorKey: "reduceOnly",
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
  },
  {
    id: "actions",
    header: (
      <button
        type="button"
        className="cursor-pointer px-3 py-2 rounded-lg text-[12px] leading-[18px] text-[#111111] hover:bg-[#F1EBFD] hover:text-[#703AE6]"
      >
        Cancel all
      </button>
    ),
    sticky: true,
    render: () => (
      <div className="flex gap-2 justify-end">
        <button className="cursor-pointer px-3 py-2 border-[0.75px] border-[#E2E2E2] bg-[#FFFFFF] rounded-md text-[12px] leading-[18px] text-[#111111]">
          Cancel
        </button>
      </div>
    ),
    align: "right",
    className: "min-w-[100px]",
  },
];

// Column definitions for Iceberg
const icebergColumns: Column<IcebergOrderType>[] = [
  {
    id: "dateTime",
    header: "Time",
    render: (row) => {
      const [date, time] = row.dateTime.split(" ");
      return (
        <div className="flex flex-col">
          <span>{date}</span>
          <span>{time}</span>
        </div>
      );
    },
  },
  {
    id: "direction",
    header: "Direction",
    render: (row) => (
      <div
        className={`flex flex-col ${row.direction.side.includes("long") ? "text-[#16A3A3]" : "text-[#FC5457]"}`}
      >
        <span>{row.direction.side}</span>
        <span className="text-[11px]">{row.direction.mode}</span>
      </div>
    ),
  },
  {
    id: "pair",
    header: "Futures | Coin",
    render: (row) => (
      <div className="flex flex-col">
        <span>{row.pair}</span>
        <span className="text-[#16A3A3] text-[11px]">{row.marginCoin}</span>
      </div>
    ),
  },
  {
    id: "orderType",
    header: "Order Type",
    accessorKey: "orderType",
  },
  {
    id: "quantity",
    header: (
      <div className="flex flex-col leading-tight">
        <span>Total Quantity |</span>
        <span>Filled Quantity</span>
      </div>
    ),
    render: (row) => (
      <div className="flex flex-col">
        <span>{row.totalQty}</span>
        <span>{row.filledQty}</span>
      </div>
    ),
  },
  {
    id: "avgFilledPrice",
    header: "Avg. filled price",
    accessorKey: "avgFilledPrice",
  },
  {
    id: "priceLimit",
    header: "Price Limit",
    accessorKey: "priceLimit",
  },
  {
    id: "orderPreferences",
    header: "Order preferences",
    accessorKey: "orderPreferences",
  },
  {
    id: "reduceOnly",
    header: "Reduce-only",
    accessorKey: "reduceOnly",
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
  },
  {
    id: "actions",
    header: (
      <button
        type="button"
        className="cursor-pointer px-3 py-2 rounded-lg text-[12px] leading-[18px] text-[#111111] hover:bg-[#F1EBFD] hover:text-[#703AE6]"
      >
        Cancel all
      </button>
    ),
    sticky: true,
    render: () => (
      <div className="flex gap-2 justify-end">
        <button className="cursor-pointer px-3 py-2 border-[0.75px] border-[#E2E2E2] bg-[#FFFFFF] rounded-md text-[12px] leading-[18px] text-[#111111]">
          Cancel
        </button>
      </div>
    ),
    align: "right",
    className: "min-w-[100px]",
  },
];

// Column definitions for TWAP
const twapColumns: Column<TwapOrderType>[] = [
  {
    id: "dateTime",
    header: "Time",
    render: (row) => {
      const [date, time] = row.dateTime.split(" ");
      return (
        <div className="flex flex-col">
          <span>{date}</span>
          <span>{time}</span>
        </div>
      );
    },
  },
  {
    id: "direction",
    header: "Direction",
    render: (row) => (
      <div
        className={`flex flex-col ${row.direction.side.includes("long") ? "text-[#16A3A3]" : "text-[#FC5457]"}`}
      >
        <span>{row.direction.side}</span>
        <span className="text-[11px]">{row.direction.mode}</span>
      </div>
    ),
  },
  {
    id: "pair",
    header: "Futures | Coin",
    render: (row) => (
      <div className="flex flex-col">
        <span>{row.pair}</span>
        <span className="text-[#16A3A3] text-[11px]">{row.marginCoin}</span>
      </div>
    ),
  },
  {
    id: "orderType",
    header: "Order Type",
    accessorKey: "orderType",
  },
  {
    id: "quantity",
    header: (
      <div className="flex flex-col leading-tight">
        <span>Total Quantity |</span>
        <span>Filled Quantity</span>
      </div>
    ),
    render: (row) => (
      <div className="flex flex-col">
        <span>{row.totalQty}</span>
        <span>{row.filledQty}</span>
      </div>
    ),
  },
  {
    id: "avgFilledPrice",
    header: "Avg. filled price",
    accessorKey: "avgFilledPrice",
  },
  {
    id: "frequency",
    header: "Frequency",
    accessorKey: "frequency",
  },
  {
    id: "totalRunningTime",
    header: "Total Running Time",
    accessorKey: "totalRunningTime",
  },
  {
    id: "runningTime",
    header: "Running Time",
    accessorKey: "runningTime",
  },
  {
    id: "reduceOnly",
    header: "Reduce-only",
    accessorKey: "reduceOnly",
  },
  {
    id: "actions",
    header: "Action",
    sticky: true,
    render: () => (
      <div className="flex gap-2 justify-end">
        <button className="cursor-pointer px-3 py-2 border-[0.75px] border-[#E2E2E2] bg-[#FFFFFF] rounded-md text-[12px] leading-[18px] text-[#111111]">
          Cancel
        </button>
      </div>
    ),
    align: "right",
    className: "min-w-[100px]",
  },
];

// Helper to format ISO date string to "YYYY-MM-DD HH:MM:SS"
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Empty arrays for order types not sourced from the store
const trailingStopData: TrailingStopOrderType[] = [];
const tpSlData: TpSlOrderType[] = [];
const triggerData: TriggerOrderType[] = [];
const icebergData: IcebergOrderType[] = [];
const twapData: TwapOrderType[] = [];

interface OpenOrdersTableProps {
  activeTab?: OrderTabType;
}

export default function OpenOrdersTable({
  activeTab = "limitMarket",
}: OpenOrdersTableProps) {
  const [isChaseModalOpen, setIsChaseModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Read open orders from the store
  const storeOrders = usePerpsTradeStore((s) => s.openOrders);

  // Map store orders to LimitMarketOrderType, keeping a stable id mapping
  const limitMarketData: LimitMarketOrderType[] = useMemo(() => {
    return storeOrders.map((order) => {
      const baseAsset = order.quantityUnit;
      return {
        id: order.id,
        dateTime: formatDateTime(order.createdAt),
        direction: {
          side: order.side === "Long" ? "Open long" : "Open short",
          mode: order.marginMode ?? "Cross",
        } as LimitMarketOrderType["direction"],
        pair: order.pair,
        marginCoin: "SUSDT",
        timeInForce: "GTC",
        orderType: order.type === "limit" ? "Limit" : order.type,
        orderQty: order.quantity.toFixed(4) + " " + baseAsset,
        filledQty: "0.0000 " + baseAsset,
        price: order.price.toLocaleString(),
        takeProfit: order.tp ? order.tp.toLocaleString() : "--",
        stopLoss: order.sl ? order.sl.toLocaleString() : "--",
        status: "Unexecuted",
        reduceOnly: "No" as const,
      };
    });
  }, [storeOrders]);

  // Build a lookup from UI order id back to the store order for cancel
  const storeOrderMap = useMemo(() => {
    const map = new Map<string, { id: string; margin: number }>();
    for (const order of storeOrders) {
      map.set(order.id, { id: order.id, margin: order.margin });
    }
    return map;
  }, [storeOrders]);

  const handleChaseClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsChaseModalOpen(true);
  };

  const handleCancelClick = async (orderId: string) => {
    const storeEntry = storeOrderMap.get(orderId);
    if (!storeEntry) return;
    await cancelPerpsOrderTx(storeEntry.id, storeEntry.margin);
    usePerpsTradeStore.getState().cancelOrder(storeEntry.id);
    addMockBalance("USDT", storeEntry.margin, "margin");
  };

  const handleChaseConfirm = () => {
    console.log("Chase order confirmed for:", selectedOrderId);
    // Handle chase order logic here
    setIsChaseModalOpen(false);
    setSelectedOrderId(null);
  };

  const limitMarketColumns = getLimitMarketColumns(handleChaseClick, handleCancelClick);

  const renderTable = () => {
    switch (activeTab) {
      case "limitMarket":
        return (
          <Table
            columns={limitMarketColumns}
            data={limitMarketData}
            getRowKey={(row) => row.id}
            emptyText="No limit/market orders"
          />
        );
      case "trailingStop":
        return (
          <Table
            columns={trailingStopColumns}
            data={trailingStopData}
            getRowKey={(row) => row.id}
            emptyText="No trailing stop orders"
          />
        );
      case "tpSl":
        return (
          <Table
            columns={tpSlColumns}
            data={tpSlData}
            getRowKey={(row) => row.id}
            emptyText="No TP/SL orders"
          />
        );
      case "trigger":
        return (
          <Table
            columns={triggerColumns}
            data={triggerData}
            getRowKey={(row) => row.id}
            emptyText="No trigger orders"
          />
        );
      case "iceberg":
        return (
          <Table
            columns={icebergColumns}
            data={icebergData}
            getRowKey={(row) => row.id}
            emptyText="No iceberg orders"
          />
        );
      case "twap":
        return (
          <Table
            columns={twapColumns}
            data={twapData}
            getRowKey={(row) => row.id}
            emptyText="No TWAP orders"
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="p-2 rounded-lg border border-[#E2E2E2] bg-[#F7F7F7]">
        {renderTable()}
      </div>

      {/* Chase Order Modal */}
      <Modal open={isChaseModalOpen} onClose={() => setIsChaseModalOpen(false)}>
        <ChaseOrderModal
          onClose={() => setIsChaseModalOpen(false)}
          onConfirm={handleChaseConfirm}
        />
      </Modal>
    </>
  );
}
