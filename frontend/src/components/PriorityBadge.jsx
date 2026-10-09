import React from 'react';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function PriorityBadge({ priority, score }) {
  let badgeStyle = 'bg-slate-700 text-slate-300 border-slate-600';
  let Icon = CheckCircle2;
  let pulse = false;

  switch (priority) {
    case 'Critical':
      badgeStyle = 'bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/10';
      Icon = AlertTriangle;
      pulse = true;
      break;
    case 'Urgent':
      badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      Icon = AlertCircle;
      break;
    case 'Moderate':
      badgeStyle = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      Icon = Clock;
      break;
    case 'Low':
      badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      Icon = CheckCircle2;
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${badgeStyle} ${pulse ? 'critical-pulse' : ''}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{priority}</span>
      {score !== undefined && <span className="opacity-80 text-[10px]">({score} pts)</span>}
    </span>
  );
}
