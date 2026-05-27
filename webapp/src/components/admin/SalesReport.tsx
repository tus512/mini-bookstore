'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, BookOpen, Loader2, Calendar } from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface ReportData {
  id: string;
  reportDate: string;
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  periodStart: string;
  periodEnd: string;
  lastAggregatedAt: string;
}

export default function SalesReport() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'revenue' | 'orders' | 'itemsSold'>('revenue');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const chartRef = useRef<SVGSVGElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<ReportData[]>('/reports')
      .then(res => {
        // Sort reports by date ascending just to be 100% sure
        const sorted = (res.data || []).sort((a, b) => 
          new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
        );
        setReports(sorted);
      })
      .catch(err => {
        console.error('Failed to fetch sales reports:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs text-text-muted font-bold uppercase tracking-wider animate-pulse">Loading Analytics Data...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white border border-border-warm rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-cream-dark/30 rounded-full flex items-center justify-center mx-auto text-primary">
          <TrendingUp className="w-7 h-7" />
        </div>
        <h3 className="font-serif font-black text-lg text-text-dark">No Analytics Data Available</h3>
        <p className="text-xs text-text-muted">Place some orders or aggregate reports to generate your store statistics.</p>
      </div>
    );
  }

  // Calculate high-level stats
  const totalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalOrders = reports.reduce((sum, r) => sum + r.totalOrders, 0);
  const totalItemsSold = reports.reduce((sum, r) => sum + r.totalItemsSold, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Chart configuration
  const width = 800;
  const height = 280;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find max value of selected metric for scaling
  const getMetricValue = (item: ReportData, m: typeof metric): number => {
    if (m === 'revenue') return item.totalRevenue;
    if (m === 'orders') return item.totalOrders;
    return item.totalItemsSold;
  };

  const maxVal = Math.max(...reports.map(r => getMetricValue(r, metric)), 1);

  // Generate SVG coordinates
  const points = reports.map((r, i) => {
    const x = paddingLeft + (i / (reports.length - 1)) * chartWidth;
    const val = getMetricValue(r, metric);
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, data: r, index: i };
  });

  // SVG Path generator
  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    areaD = `M ${points[0].x} ${paddingTop + chartHeight} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
      areaD += ` L ${points[i].x} ${points[i].y}`;
    }

    areaD += ` L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`;
  }

  // Handle hover tooltips
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current || points.length === 0) return;
    const rect = chartRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Scale standard coordinate to SVG width
    const svgMouseX = (mouseX / rect.width) * width;

    // Find closest point by X coordinate
    let closestIndex = 0;
    let minDiff = Infinity;
    points.forEach((pt, i) => {
      const diff = Math.abs(pt.x - svgMouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    setHoveredIndex(closestIndex);

    // Compute screen relative coordinates for HTML tooltip card overlay
    const pt = points[closestIndex];
    const tooltipX = (pt.x / width) * rect.width;
    const tooltipY = (pt.y / height) * rect.height;

    setTooltipPos({ x: tooltipX, y: tooltipY });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Analytics Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Sales Revenue Card */}
        <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Sales Revenue</p>
            <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-serif font-black text-2xl text-text-dark leading-tight">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">▲ Positive sales growth</p>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Orders Placed</p>
            <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-serif font-black text-2xl text-text-dark leading-tight">{totalOrders} orders</h4>
            <p className="text-[10px] text-text-muted font-semibold mt-1">Across this aggregate period</p>
          </div>
        </div>

        {/* Total Books Sold Card */}
        <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Items Sold</p>
            <div className="w-8 h-8 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-center text-purple-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-serif font-black text-2xl text-text-dark leading-tight">{totalItemsSold} books</h4>
            <p className="text-[10px] text-purple-600 font-semibold mt-1">Avg {(totalItemsSold / (reports.length || 1)).toFixed(1)} books/day</p>
          </div>
        </div>

        {/* Avg Order Value Card */}
        <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Avg Order Value</p>
            <div className="w-8 h-8 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-serif font-black text-2xl text-text-dark leading-tight">${avgOrderValue.toFixed(2)}</h4>
            <p className="text-[10px] text-text-muted font-semibold mt-1">Per transaction ticket</p>
          </div>
        </div>

      </div>

      {/* Main Interactive Graph panel */}
      <div className="bg-white border border-border-warm rounded-3xl p-6 shadow-sm">
        
        {/* Graph Header / Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border-warm/40 pb-4">
          <div>
            <h3 className="font-serif font-black text-base text-text-dark flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Sales Performance Monitor
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Interactive daily metric analysis over the last 30 days.</p>
          </div>

          {/* Metric Selector Toggles */}
          <div className="flex p-0.5 bg-cream-dark/30 border border-border-warm rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                metric === 'revenue' 
                  ? 'bg-white text-primary shadow-sm border border-border-warm' 
                  : 'text-text-muted hover:text-text-dark'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setMetric('orders')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                metric === 'orders' 
                  ? 'bg-white text-primary shadow-sm border border-border-warm' 
                  : 'text-text-muted hover:text-text-dark'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setMetric('itemsSold')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                metric === 'itemsSold' 
                  ? 'bg-white text-primary shadow-sm border border-border-warm' 
                  : 'text-text-muted hover:text-text-dark'
              }`}
            >
              Items Sold
            </button>
          </div>
        </div>

        {/* SVG Sales Line/Area Graph */}
        <div className="relative">
          <svg
            ref={chartRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="caramelGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8c6239" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8c6239" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8c6239" />
                <stop offset="100%" stopColor="#d4af37" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingTop + ratio * chartHeight;
              const val = ((1 - ratio) * maxVal).toFixed(metric === 'revenue' ? 0 : 0);
              return (
                <g key={i} className="opacity-40">
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#eae0d5"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[9px] fill-text-muted font-bold"
                  >
                    {metric === 'revenue' ? `$${val}` : val}
                  </text>
                </g>
              );
            })}

            {/* Date/X-Axis Labels (draw labels for every 5th item) */}
            {reports.map((item, i) => {
              if (i % 5 !== 0 && i !== reports.length - 1) return null;
              const x = paddingLeft + (i / (reports.length - 1)) * chartWidth;
              const dateStr = new Date(item.reportDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={paddingTop + chartHeight}
                    x2={x}
                    y2={paddingTop + chartHeight + 5}
                    stroke="#eae0d5"
                    strokeWidth={1.5}
                  />
                  <text
                    x={x}
                    y={paddingTop + chartHeight + 18}
                    textAnchor="middle"
                    className="text-[9px] fill-text-muted font-bold"
                  >
                    {dateStr}
                  </text>
                </g>
              );
            })}

            {/* Main Filled Area */}
            <path d={areaD} fill="url(#caramelGradient)" />

            {/* Main Path Stroke */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Vertical Hover Indicator Line */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={paddingTop + chartHeight}
                stroke="#8c6239"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                className="opacity-70"
              />
            )}

            {/* Solid Points on Chart Line */}
            {points.map((pt, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <g key={i}>
                  {/* Invisible interactive hover target circles */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={8}
                    className="fill-transparent cursor-pointer"
                  />
                  {/* Glowing outer circle on hover */}
                  {isHovered && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={7}
                      className="fill-primary/20 stroke-primary/40 stroke-1 animate-ping"
                    />
                  )}
                  {/* Small inner dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 4.5 : 2.5}
                    className={`transition-all duration-100 ${
                      isHovered ? 'fill-primary stroke-white stroke-2' : 'fill-primary/80'
                    }`}
                  />
                </g>
              );
            })}
          </svg>

          {/* HTML Floating Hover Tooltip overlay */}
          {activePoint && tooltipPos && (
            <div
              className="absolute pointer-events-none bg-white/95 border border-border-warm rounded-2xl shadow-xl p-3 text-left space-y-1 z-30 min-w-[130px] font-sans animate-in zoom-in-95 duration-100 backdrop-blur-sm"
              style={{
                left: `${tooltipPos.x + 12}px`,
                top: `${tooltipPos.y - 45}px`,
                transform: 'translateY(-50%)',
              }}
            >
              <div className="flex items-center gap-1.5 text-[9px] text-text-muted font-bold border-b border-border-warm pb-1 uppercase tracking-wider">
                <Calendar className="w-3 h-3 text-primary" />
                {new Date(activePoint.data.reportDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div className="space-y-0.5 pt-1">
                <p className="text-[11px] font-black text-text-dark flex items-center justify-between gap-4">
                  <span>Revenue:</span>
                  <span className="text-emerald-600">${activePoint.data.totalRevenue.toFixed(2)}</span>
                </p>
                <p className="text-[10px] text-text-muted flex items-center justify-between">
                  <span>Orders:</span>
                  <span className="font-bold text-text-dark">{activePoint.data.totalOrders}</span>
                </p>
                <p className="text-[10px] text-text-muted flex items-center justify-between">
                  <span>Books Sold:</span>
                  <span className="font-bold text-text-dark">{activePoint.data.totalItemsSold}</span>
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Raw Reports Data Log Table */}
      <div className="bg-white border border-border-warm rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border-warm bg-cream-dark/20 flex justify-between items-center">
          <h3 className="font-serif font-black text-sm text-text-dark uppercase tracking-wider">Detailed Daily Sales Logs</h3>
          <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-border-warm text-text-muted">
            {reports.length} daily entries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-text-dark">
            <thead>
              <tr className="bg-cream-bg/40 border-b border-border-warm text-text-muted font-bold">
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[10px]">Report Date</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[10px] text-center">Orders Count</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[10px] text-center">Books Sold</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[10px] text-right">Aggregate Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-warm/40 font-sans">
              {reports.slice().reverse().map(report => (
                <tr 
                  key={report.id} 
                  className="hover:bg-cream-dark/10 transition-colors"
                >
                  <td className="px-6 py-3.5 font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/70 shrink-0" />
                    {new Date(report.reportDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-3.5 text-center font-bold text-text-muted">
                    {report.totalOrders}
                  </td>
                  <td className="px-6 py-3.5 text-center font-bold text-text-muted">
                    {report.totalItemsSold}
                  </td>
                  <td className="px-6 py-3.5 text-right font-black text-emerald-600 text-sm">
                    ${report.totalRevenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
