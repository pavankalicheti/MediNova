import React from 'react';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function PriorityBadge({ priority, score }) {
  let badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
  let Icon = CheckCircle2;
  let pulse = false;

  switch (priority) {
    case 'Critical':
      badgeStyle = 'bg-blue-600 text-white border-blue-700 shadow-sm shadow-blue-500/20';
      Icon = AlertTriangle;
      pulse = true;
      break;
    case 'Urgent':
      badgeStyle = 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      Icon = AlertCircle;
      break;
    case 'Moderate':
      badgeStyle = 'bg-sky-50 text-sky-700 border-sky-200';
      Icon = Clock;
      break;
    case 'Low':
      badgeStyle = 'bg-blue-50/70 text-blue-600 border-blue-100';
      Icon = CheckCircle2;
      break;
    default:
      badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
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
