"use client";

import { motion } from "framer-motion";

export function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 bg-muted rounded-lg" />
        <div className="h-4 w-16 bg-muted rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-6 w-32 bg-muted rounded" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border animate-pulse">
      <div className="h-10 w-10 bg-muted rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3 w-24 bg-muted rounded" />
      </div>
      <div className="h-6 w-20 bg-muted rounded-full" />
      <div className="h-4 w-16 bg-muted rounded" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
      <div className="h-6 w-48 bg-muted rounded mb-6" />
      <div className="h-[300px] flex items-end gap-2 justify-between px-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${Math.random() * 100}%` }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="flex-1 bg-muted rounded-t"
          />
        ))}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 w-24 bg-muted rounded" />
          <div className="h-8 w-20 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Chart */}
      <ChartSkeleton />

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border px-6 flex items-center justify-between animate-pulse">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-16 bg-muted rounded" />
          ))}
        </div>
        <div className="h-10 w-24 bg-muted rounded-lg" />
      </div>

      {/* Hero */}
      <div className="container mx-auto px-6 py-24 animate-pulse">
        <div className="max-w-2xl space-y-6">
          <div className="h-12 w-3/4 bg-muted rounded" />
          <div className="h-12 w-1/2 bg-muted rounded" />
          <div className="h-6 w-full bg-muted rounded" />
          <div className="h-6 w-2/3 bg-muted rounded" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-32 bg-muted rounded-lg" />
            <div className="h-12 w-32 bg-muted rounded-lg" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="h-8 w-48 bg-muted rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
