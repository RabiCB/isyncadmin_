"use client"

import React from "react"

export interface TableColumn<T = any> {
  key: keyof T | string
  label: string
  render?: (value: any, row: T) => React.ReactNode
}

interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyText?: string
  actions?: (row: T) => React.ReactNode
}

export function Table<T extends { id: number | string }>({
  columns,
  data,
  loading,
  emptyText = "No data found",
  actions,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#14141c]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 bg-[#0a0a0f]">
            {columns.map((col) => (
              <th
                key={col.key as string}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8884a0]"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8884a0]">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="py-8 text-center text-[#8884a0]">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-purple-500" />
                  Loading...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="py-8 text-center text-[#8884a0]">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="border-b border-white/4 transition-colors hover:bg-white/2">
                {columns.map((col) => (
                  <td key={col.key as string} className="px-4 py-3 text-sm">
                    {col.render ? col.render(row[col.key as keyof T], row) : String(row[col.key as keyof T])}
                  </td>
                ))}
                {actions && <td className="px-4 py-3">{actions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
