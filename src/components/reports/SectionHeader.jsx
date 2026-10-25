/**
 * SectionHeader — consistent report section heading (eyebrow pill, bold
 * title, muted description, optional action slot) shared by all reports.
 */
import React from 'react'

export default function SectionHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <div>
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
          {eyebrow}
        </span>
        <h2 className="text-xl font-bold tracking-tight text-ink mt-3">{title}</h2>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
      </div>
      {actions}
    </div>
  )
}