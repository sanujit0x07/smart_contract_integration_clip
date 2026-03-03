import { Column } from "../../ui/Table";
import { Table } from "../../ui/Table";
import { usePerpsTradeStore } from "@/store/perps-trade-store";

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export type PositionHistoryType = {
  id: string;
  futures: string;
  openTime: string;
  avgEntryPrice: string;
  avgExitPrice: string;
  closedQty: string;
  pnl: string;
  roi: string;
  closedTime: string;
};

const positionHistoryColumns: Column<PositionHistoryType>[] = [
  {
    id: "futures",
    header: "Futures",
    accessorKey: "futures",
  },

  {
    id: "openTime",
    header: "Open Time",
    render: (row) => {
      const [date, time] = row.openTime.split(" ");
      return (
        <div className="flex flex-col">
          <span>{date}</span>
          <span className="text-[11px] text-[#8E8E92]">{time}</span>
        </div>
      );
    },
  },

  {
    id: "avgPrice",
    header: (
      <div className="flex flex-col leading-tight">
        <span>Avg. entry price</span>
        <span>Avg. exit price</span>
      </div>
    ),
    render: (row) => (
      <div className="flex flex-col">
        <span>{row.avgEntryPrice}</span>
        <span className="text-[11px] text-[#8E8E92]">{row.avgExitPrice}</span>
      </div>
    ),
  },

  {
    id: "closedQty",
    header: "Closed Quantity",
    accessorKey: "closedQty",
  },

  {
    id: "pnl",
    header: "Position PnL",
    render: (row) => (
      <span
        className={
          row.pnl.startsWith("-") ? "text-[#E5533D]" : "text-[#16A3A3]"
        }
      >
        {row.pnl}
      </span>
    ),
  },

  {
    id: "roi",
    header: "Position ROI",
    render: (row) => (
      <span
        className={
          row.roi.startsWith("-") ? "text-[#E5533D]" : "text-[#16A3A3]"
        }
      >
        {row.roi}
      </span>
    ),
  },

  {
    id: "closedTime",
    header: "Closed Time",
    render: (row) => {
      const [date, time] = row.closedTime.split(" ");
      return (
        <div className="flex flex-col">
          <span>{date}</span>
          <span className="text-[11px] text-[#8E8E92]">{time}</span>
        </div>
      );
    },
  },

  {
    id: "action",
    header: "Action",
    render: () => <div>--</div>,
    align: "right",
    className: "min-w-[100px]",
  },
];

export default function PositionHistoryTable() {
  const storeHistory = usePerpsTradeStore((s) => s.positionHistory);

  const positionHistoryData: PositionHistoryType[] = storeHistory.map(
    (item) => ({
      id: item.id,
      futures: item.pair,
      openTime: formatDateTime(item.openedAt),
      avgEntryPrice: item.entryPrice.toLocaleString(),
      avgExitPrice: item.closePrice.toLocaleString(),
      closedQty:
        item.quantity.toFixed(4) +
        " " +
        item.pair.replace("USDC", "").replace("USDT", ""),
      pnl:
        (item.realizedPnl >= 0 ? "+" : "") +
        item.realizedPnl.toFixed(2) +
        " USDT",
      roi:
        (item.realizedPnlPercent >= 0 ? "+" : "") +
        item.realizedPnlPercent.toFixed(2) +
        "%",
      closedTime: formatDateTime(item.closedAt),
    }),
  );

  return (
    <div className="p-2 rounded-lg border border-[#E2E2E2] bg-[#F7F7F7]">
      <Table
        columns={positionHistoryColumns}
        data={positionHistoryData}
        getRowKey={(row) => row.id}
        emptyText="No position history"
      />
    </div>
  );
}
