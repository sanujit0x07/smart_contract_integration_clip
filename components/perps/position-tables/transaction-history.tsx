import { Column } from "../../ui/Table";
import { Table } from "../../ui/Table";
import { usePerpsTradeStore } from "@/store/perps-trade-store";
import { useMemo } from "react";

export type TransactionHistoryType = {
  id: string;
  dateTime: string;
  coin: string;
  marginMode: "Cross" | "Isolated";
  futures: string;
  type: string;
  amount: string;
  fee: string;
  walletBalance: string;
};

const transactionHistoryColumns: Column<TransactionHistoryType>[] = [
  {
    id: "dateTime",
    header: "Time",
    render: (row) => {
      const [date, time] = row.dateTime.split(" ");
      return (
        <div className="flex flex-col">
          <span>{date}</span>
          <span className="text-[12px] leading-[18px] font-medium text-[#919191]">
            {time}
          </span>
        </div>
      );
    },
  },

  {
    id: "coin",
    header: "Coin",
    accessorKey: "coin",
  },

  {
    id: "marginMode",
    header: "Margin mode",
    accessorKey: "marginMode",
  },

  {
    id: "futures",
    header: "Futures",
    accessorKey: "futures",
  },

  {
    id: "type",
    header: "Type",
    accessorKey: "type",
  },

  {
    id: "amount",
    header: "Amount",
    render: (row) => (
      <span
        className={
          row.amount.startsWith("-") ? "text-[#E5533D]" : "text-[#16A3A3]"
        }
      >
        {row.amount}
      </span>
    ),
  },

  {
    id: "fee",
    header: "Fee",
    accessorKey: "fee",
  },

  {
    id: "walletBalance",
    header: "Wallet Balance",
    accessorKey: "walletBalance",
    align: "right",
  },
];

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export default function TransactionHistoryTable() {
  const storeTxHistory = usePerpsTradeStore((s) => s.transactionHistory);

  const transactionHistoryData: TransactionHistoryType[] = useMemo(
    () =>
      storeTxHistory.map((item) => ({
        id: item.id,
        dateTime: formatDateTime(item.createdAt),
        coin: item.coin,
        marginMode: item.marginMode,
        futures: item.futures,
        type: item.type,
        amount: item.amount,
        fee: item.fee,
        walletBalance: item.walletBalance,
      })),
    [storeTxHistory]
  );

  return (
    <div className="p-2 rounded-lg border border-[#E2E2E2] bg-[#F7F7F7]">
      <Table
        columns={transactionHistoryColumns}
        data={transactionHistoryData}
        getRowKey={(row) => row.id}
        emptyText="No transaction history"
      />
    </div>
  );
}
