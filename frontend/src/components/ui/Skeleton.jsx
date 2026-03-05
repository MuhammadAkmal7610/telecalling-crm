import React from 'react';

export default function Skeleton({ rows = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-100 rounded w-full" />
      ))}
    </div>
  );
}
