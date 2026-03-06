export const farmTableHeadings = [
  { label: "Pool", id: "pool", icon: true },
  { label: "DEX", id: "dex", icon: true },
  { label: "DEX LP TVL", id: "dex-lp-tvl", icon: true },
  { label: "Vanna TVL", id: "vanna-tvl", icon: true },
  { label: "Pool APR", id: "pool-apr", icon: true },
  { label: "Leveraged APR", id: "leveraged-apr", icon: true },
  { label: "1D VOL", id: "1d-vol", icon: true },
  { label: "30 D VOL", id: "30d-vol", icon: true },
  { label: "1D VOL/TVL", id: "1d-vol-tvl", icon: true },
];

export const farmTableBody = {
  rows: [
    // Row 1: V3 Protocol, 9summits Curator, Kraken Provider, ETH Chain
    {
      cell: [
        {
          chain: "ETH",
          titles: ["USDT", "BNB"],
          tags: ["V3", "0.30%", "9summits", "Kraken"],
        },
        {
          title: "Pancake",
        },
        {
          title: "$100M",
        },
        {
          title: "$80M",
        },
        {
          title: "5.42%",
        },
        {
          title: "12.8%",
        },
        {
          title: "$30.4k",
        },
        {
          title: "$701.7k",
        },
        {
          title: "0.43",
        },
      ],
    },
    // Row 2: V2 Protocol, 9summits Curator, Binance Provider, USDC Chain
    {
      cell: [
        {
          chain: "USDC",
          titles: ["ETH", "USDC"],
          tags: ["V2", "0.50%", "9summits", "Binance"],
        },
        {
          title: "Uniswap",
        },
        {
          title: "$85M",
        },
        {
          title: "$65M",
        },
        {
          title: "3.21%",
        },
        {
          title: "8.5%",
        },
        {
          title: "$25.8k",
        },
        {
          title: "$580.2k",
        },
        {
          title: "0.30",
        },
      ],
    },
    // Row 3: V3 Protocol, Coinbase Provider (only 3 tags), USDT Chain
    {
      cell: [
        {
          chain: "USDT",
          titles: ["USDC", "USDT"],
          tags: ["V3", "0.25%", "Coinbase"],
        },
        {
          title: "SushiSwap",
        },
        {
          title: "$120M",
        },
        {
          title: "$95M",
        },
        {
          title: "6.15%",
        },
        {
          title: "15.2%",
        },
        {
          title: "$42.1k",
        },
        {
          title: "$892.5k",
        },
        {
          title: "0.35",
        },
      ],
    },
    // Row 4: V2 Protocol, Lido Curator, Kraken Provider, ETH Chain
    {
      cell: [
        {
          chain: "ETH",
          titles: ["wstHYPE", "HYPE"],
          tags: ["V2", "0.20%", "Lido", "Kraken"],
        },
        {
          title: "Curve",
        },
        {
          title: "$200M",
        },
        {
          title: "$150M",
        },
        {
          title: "4.75%",
        },
        {
          title: "10.3%",
        },
        {
          title: "$55.3k",
        },
        {
          title: "$1.2M",
        },
        {
          title: "0.28",
        },
      ],
    },
    // Row 5: V3 Protocol, 9summits Curator, Binance Provider, USDC Chain
    {
      cell: [
        {
          chain: "USDC",
          titles: ["kHYPE", "USDe"],
          tags: ["V3", "0.35%", "9summits", "Binance"],
        },
        {
          title: "Balancer",
        },
        {
          title: "$75M",
        },
        {
          title: "$60M",
        },
        {
          title: "7.28%",
        },
        {
          title: "18.5%",
        },
        {
          title: "$18.9k",
        },
        {
          title: "$420.8k",
        },
        {
          title: "0.25",
        },
      ],
    },
    // Row 6: V2 Protocol, Compound Curator, Coinbase Provider, USDT Chain
    {
      cell: [
        {
          chain: "USDT",
          titles: ["wHYPE", "USDC"],
          tags: ["V2", "0.45%", "Compound", "Coinbase"],
        },
        {
          title: "Pancake",
        },
        {
          title: "$90M",
        },
        {
          title: "$70M",
        },
        {
          title: "2.95%",
        },
        {
          title: "7.8%",
        },
        {
          title: "$28.5k",
        },
        {
          title: "$640.3k",
        },
        {
          title: "0.32",
        },
      ],
    },
    // Row 7: V3 Protocol, Kraken Provider (only 3 tags), ETH Chain
    {
      cell: [
        {
          chain: "ETH",
          titles: ["USDTO", "BNB"],
          tags: ["V3", "0.15%", "Kraken"],
        },
        {
          title: "Uniswap",
        },
        {
          title: "$110M",
        },
        {
          title: "$88M",
        },
        {
          title: "5.80%",
        },
        {
          title: "13.5%",
        },
        {
          title: "$35.7k",
        },
        {
          title: "$755.2k",
        },
        {
          title: "0.32",
        },
      ],
    },
    // Row 8: V2 Protocol, Lido Curator, Binance Provider, USDC Chain
    {
      cell: [
        {
          chain: "USDC",
          titles: ["USDT", "ETH"],
          tags: ["V2", "0.40%", "Lido", "Binance"],
        },
        {
          title: "Curve",
        },
        {
          title: "$95M",
        },
        {
          title: "$72M",
        },
        {
          title: "4.12%",
        },
        {
          title: "9.7%",
        },
        {
          title: "$31.2k",
        },
        {
          title: "$680.5k",
        },
        {
          title: "0.33",
        },
      ],
    },
  ],
};

// Single Asset Table Data
export const singleAssetTableHeadings = [
  { label: "Asset", id: "asset", icon: true },
  { label: "Protocol", id: "protocol", icon: true },
  { label: "Total Deposits", id: "total-deposits", icon: true },
  { label: "Provider TVL", id: "provider-tvl", icon: true },
  { label: "Supply APY", id: "supply-apy", icon: true },
  { label: "Leveraged APY", id: "leveraged-apy", icon: true },
  { label: "24H Volume", id: "24h-volume", icon: true },
  { label: "Utilization", id: "utilization", icon: true },
];

export const singleAssetTableBody = {
  rows: [
    // Row 1: USDC - V3, Aave, 9summits (No Provider)
    {
      cell: [
        {
          chain: "ETH",
          title: "USDC",
          tags: ["V3", "Aave", "9summits"],
        },
        {
          title: "Aave",
        },
        {
          title: "$250M",
        },
        {
          title: "$180M",
        },
        {
          title: "4.25%",
        },
        {
          title: "11.5%",
        },
        {
          title: "$45.2k",
        },
        {
          title: "72%",
        },
      ],
    },
    // Row 2: USDT - V2, Compound, Lido (No Provider)
    {
      cell: [
        {
          chain: "USDC",
          title: "USDT",
          tags: ["V2", "Compound", "Lido"],
        },
        {
          title: "Compound",
        },
        {
          title: "$300M",
        },
        {
          title: "$220M",
        },
        {
          title: "3.80%",
        },
        {
          title: "9.2%",
        },
        {
          title: "$52.8k",
        },
        {
          title: "73.3%",
        },
      ],
    },
    // Row 3: ETH - V3, Aave, 9summits (No Provider)
    {
      cell: [
        {
          chain: "USDT",
          title: "ETH",
          tags: ["V3", "Aave", "9summits"],
        },
        {
          title: "Aave",
        },
        {
          title: "$500M",
        },
        {
          title: "$380M",
        },
        {
          title: "2.15%",
        },
        {
          title: "6.8%",
        },
        {
          title: "$125.5k",
        },
        {
          title: "76%",
        },
      ],
    },
    // Row 4: wstHYPE - V2, Lido, 9summits (No Provider)
    {
      cell: [
        {
          chain: "ETH",
          title: "wstHYPE",
          tags: ["V2", "Lido", "9summits"],
        },
        {
          title: "Lido",
        },
        {
          title: "$180M",
        },
        {
          title: "$140M",
        },
        {
          title: "5.50%",
        },
        {
          title: "13.2%",
        },
        {
          title: "$38.4k",
        },
        {
          title: "77.8%",
        },
      ],
    },
    // Row 5: HYPE - V3, Aave, Lido (No Provider)
    {
      cell: [
        {
          chain: "USDC",
          title: "HYPE",
          tags: ["V3", "Aave", "Lido"],
        },
        {
          title: "Aave",
        },
        {
          title: "$150M",
        },
        {
          title: "$115M",
        },
        {
          title: "6.75%",
        },
        {
          title: "16.8%",
        },
        {
          title: "$28.9k",
        },
        {
          title: "76.7%",
        },
      ],
    },
    // Row 6: kHYPE - V2, Compound, Compound (No Provider)
    {
      cell: [
        {
          chain: "USDT",
          title: "kHYPE",
          tags: ["V2", "Compound", "Compound"],
        },
        {
          title: "Compound",
        },
        {
          title: "$95M",
        },
        {
          title: "$72M",
        },
        {
          title: "4.90%",
        },
        {
          title: "12.1%",
        },
        {
          title: "$19.7k",
        },
        {
          title: "75.8%",
        },
      ],
    },
  ],
};


export const FARM_STATS_ITEMS = [
  {
    id: "depositTVL",
    name: "Your Deposit TVL",
    icon: "/icons/bnb-icon.png",
  },
  {
    id: "earnings",
    name: "Your Earnings",
    icon: "/icons/bnb-icon.png",
  },
];

export const FARM_STATS_VALUES: Record<string, string | number | null> = {
  depositTVL: "$2000",
  earnings: "$1000",
};



export const MARGIN_ACCOUNT_STATS_ITEMS = [
  {
    id: "totalCollateral",
    name: "Total Collateral",
    icon: "/icons/bnb-icon.png",
  },
  {
    id: "availableCollateral",
    name: "Available Collateral",
    icon: "/icons/bnb-icon.png",
  },
  {
    id: "borrowedAssets",
    name: "Borrowed Assets",
    icon: "/icons/bnb-icon.png",
  },
  {
    id: "crossAccountLeverage",
    name: "Cross Account Leverage",
    icon: "/icons/bnb-icon.png",
  },
  {
    id: "healthFactor",
    name: "Health Factor",
    icon: "/icons/bnb-icon.png",
  },
  {
    id: "pnl",
    name: "PNL",
    icon: "/icons/bnb-icon.png",
  },
  {
    id: "crossMarginRatio",
    name: "Cross Margin Ratio",
    icon: "/icons/bnb-icon.png",
  },
];


export const MARGIN_ACCOUNT_STATS_VALUES: Record<
  string,
  string | number | null
> = {
  totalCollateral: "$3000",
  availableCollateral: null, // shows "–"
  borrowedAssets: "200k USD",
  crossAccountLeverage: null,
  healthFactor: null,
  pnl: null,
  crossMarginRatio: null,
};

// Farm pool chart data - USDC/USDT pool price over recent months (Dec 2025 - Mar 2026)
export const farmChartData = [
  { date: "2025-12-01", amount: 0.9982 },
  { date: "2025-12-03", amount: 0.9985 },
  { date: "2025-12-05", amount: 0.9978 },
  { date: "2025-12-08", amount: 0.9991 },
  { date: "2025-12-10", amount: 0.9988 },
  { date: "2025-12-12", amount: 0.9994 },
  { date: "2025-12-15", amount: 0.9996 },
  { date: "2025-12-18", amount: 0.9990 },
  { date: "2025-12-20", amount: 0.9987 },
  { date: "2025-12-22", amount: 0.9993 },
  { date: "2025-12-25", amount: 0.9998 },
  { date: "2025-12-28", amount: 0.9995 },
  { date: "2025-12-31", amount: 1.0001 },
  { date: "2026-01-03", amount: 0.9997 },
  { date: "2026-01-06", amount: 1.0002 },
  { date: "2026-01-09", amount: 0.9999 },
  { date: "2026-01-12", amount: 1.0004 },
  { date: "2026-01-15", amount: 1.0001 },
  { date: "2026-01-18", amount: 0.9996 },
  { date: "2026-01-21", amount: 1.0003 },
  { date: "2026-01-24", amount: 1.0006 },
  { date: "2026-01-27", amount: 1.0002 },
  { date: "2026-01-30", amount: 0.9998 },
  { date: "2026-02-02", amount: 1.0005 },
  { date: "2026-02-05", amount: 1.0001 },
  { date: "2026-02-08", amount: 1.0008 },
  { date: "2026-02-11", amount: 1.0004 },
  { date: "2026-02-14", amount: 1.0010 },
  { date: "2026-02-17", amount: 1.0007 },
  { date: "2026-02-20", amount: 1.0003 },
  { date: "2026-02-23", amount: 1.0009 },
  { date: "2026-02-26", amount: 1.0012 },
  { date: "2026-03-01", amount: 1.0008 },
  { date: "2026-03-03", amount: 1.0014 },
  { date: "2026-03-06", amount: 1.0011 },
];

export const LEVERAGE_HEALTH_STATS_ITEMS = [
  {
    id: "maxLeverage",
    name: "Max Utilised Leverage / Max Available Leverage",
    amount: "7x / 10x",
  },
  {
    id: "positionHealthFactor",
    name: "Position Health Factor",
    amount: "N/A",
  },
  {
    id: "marginHealthFactor",
    name: "Margin Health Factor",
    amount: "N/A",
  },
  {
    id: "avgLiquidationTime",
    name: "Avg Liquidation Time",
    amount: "N/A",
  },
];

