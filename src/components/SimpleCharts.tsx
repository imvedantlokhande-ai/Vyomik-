import React from 'react';
import { IndianRupee, TrendingUp, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface ViabilityGaugeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ViabilityGauge: React.FC<ViabilityGaugeProps> = ({
  score,
  label = 'Viability',
  size = 'md',
}) => {
  const radius = size === 'sm' ? 28 : size === 'lg' ? 46 : 36;
  const stroke = size === 'sm' ? 6 : size === 'lg' ? 10 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 85
      ? 'text-emerald-600'
      : score >= 70
      ? 'text-amber-500'
      : 'text-orange-500';

  const dim = (radius + stroke) * 2;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={dim}
          height={dim}
          className="-rotate-90 transform"
          viewBox={`0 0 ${dim} ${dim}`}
        >
          {/* Background circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-stone-100"
          />
          {/* Progress circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${color} transition-all duration-700 ease-out`}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span
            className={`font-black text-stone-900 ${
              size === 'sm'
                ? 'text-sm'
                : size === 'lg'
                ? 'text-2xl'
                : 'text-lg'
            }`}
          >
            {score}%
          </span>
        </div>
      </div>
      {label && (
        <span className="mt-1 text-[11px] font-semibold text-stone-500">
          {label}
        </span>
      )}
    </div>
  );
};

interface CashflowBarChartProps {
  revenue: number;
  costs: number;
  profit: number;
}

export const CashflowBarChart: React.FC<CashflowBarChartProps> = ({
  revenue,
  costs,
  profit,
}) => {
  const max = Math.max(revenue, 1);
  const revPct = 100;
  const costPct = Math.min(Math.round((costs / max) * 100), 100);
  const profitPct = Math.min(Math.round((profit / max) * 100), 100);

  return (
    <div className="space-y-2.5 text-xs text-left">
      <div>
        <div className="flex justify-between font-medium text-stone-600 mb-1">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
            Monthly Revenue:
          </span>
          <span className="font-bold text-stone-900">
            ₹{formatCurrency(revenue)}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${revPct}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between font-medium text-stone-600 mb-1">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400 inline-block" />
            Total Monthly OpEx (Raw Materials + Labor + Power):
          </span>
          <span className="font-bold text-stone-900">
            ₹{formatCurrency(costs)}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-rose-400 transition-all duration-500"
            style={{ width: `${costPct}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between font-medium text-emerald-800 mb-1">
          <span className="flex items-center gap-1 font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 inline-block" />
            Estimated Net Cashflow Profit:
          </span>
          <span className="font-extrabold text-emerald-700 text-sm">
            +₹{formatCurrency(profit)}
          </span>
        </div>
        <div className="h-3.5 w-full rounded-full bg-emerald-50 overflow-hidden border border-emerald-200">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${profitPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

interface SubsidySplitProps {
  subsidyPercent: number;
  ownEquityPercent: number;
  loanPercent: number;
  totalProjectCost: number;
}

export const SubsidySplitChart: React.FC<SubsidySplitProps> = ({
  subsidyPercent,
  ownEquityPercent,
  loanPercent,
  totalProjectCost,
}) => {
  const subsidyAmt = (totalProjectCost * subsidyPercent) / 100;
  const ownAmt = (totalProjectCost * ownEquityPercent) / 100;
  const loanAmt = (totalProjectCost * loanPercent) / 100;

  return (
    <div className="space-y-3 text-left">
      <div className="flex h-5 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100 text-[10px] font-bold text-white shadow-inner">
        <div
          style={{ width: `${subsidyPercent}%` }}
          className="flex items-center justify-center bg-purple-600"
          title={`Subsidy: ${subsidyPercent}%`}
        >
          {subsidyPercent}%
        </div>
        <div
          style={{ width: `${ownEquityPercent}%` }}
          className="flex items-center justify-center bg-amber-500 text-stone-900"
          title={`Own Contribution: ${ownEquityPercent}%`}
        >
          {ownEquityPercent}%
        </div>
        <div
          style={{ width: `${loanPercent}%` }}
          className="flex items-center justify-center bg-emerald-700"
          title={`Bank Loan: ${loanPercent}%`}
        >
          {loanPercent}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-2">
          <span className="block text-[10px] font-semibold text-purple-700 uppercase">
            Govt Subsidy
          </span>
          <span className="font-extrabold text-purple-900 text-xs sm:text-sm">
            ₹{formatCurrency(Math.round(subsidyAmt))}
          </span>
          <span className="block text-[10px] text-purple-600">
            {subsidyPercent}% (PMEGP Grant)
          </span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2">
          <span className="block text-[10px] font-semibold text-amber-800 uppercase">
            Your Own Equity
          </span>
          <span className="font-extrabold text-amber-900 text-xs sm:text-sm">
            ₹{formatCurrency(Math.round(ownAmt))}
          </span>
          <span className="block text-[10px] text-amber-700">
            {ownEquityPercent}% (Margin Money)
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2">
          <span className="block text-[10px] font-semibold text-emerald-800 uppercase">
            Bank Mudra Loan
          </span>
          <span className="font-extrabold text-emerald-950 text-xs sm:text-sm">
            ₹{formatCurrency(Math.round(loanAmt))}
          </span>
          <span className="block text-[10px] text-emerald-700">
            {loanPercent}% (Collateral-Free)
          </span>
        </div>
      </div>
    </div>
  );
};
