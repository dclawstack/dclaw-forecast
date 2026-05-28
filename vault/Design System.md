# Design System — DClaw Forecast

> Back: [[Welcome]] | Structure: [[Directory Structure]]

## Brand Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#10B981` / `teal-500` | Nav logo, buttons, active links |
| Primary Dark | `#0D9488` / `teal-600` | Button hover, badges |
| Primary Light | `#CCFBF1` / `teal-50` | Active nav background |
| Background | `#F8FAFC` / `slate-50` | Page background |
| Surface | `#FFFFFF` | Cards |
| Border | `#E2E8F0` / `slate-200` | Card borders, inputs |
| Text Primary | `#0F172A` / `slate-900` | Headings |
| Text Secondary | `#64748B` / `slate-500` | Descriptions, labels |
| Text Muted | `#94A3B8` / `slate-400` | Placeholder, empty states |

## Status Colors

| Status | Background | Text |
|--------|-----------|------|
| completed | `green-100` | `green-700` |
| running | `blue-100` | `blue-700` |
| pending | `yellow-100` | `yellow-700` |
| failed | `red-100` | `red-700` |

## Components Used

All components from `frontend/src/components/ui/` — do NOT install shadcn CLI.

| Component | Import |
|-----------|--------|
| Button | `@/components/ui/button` |
| Card, CardHeader, CardTitle… | `@/components/ui/card` |
| Input | `@/components/ui/input` |
| Badge | `@/components/ui/badge` |
| Dialog | `@/components/ui/dialog` |
| Table | `@/components/ui/table` |
| Tabs | `@/components/ui/tabs` |

## Typography

- Font: `Inter` (Google Fonts, latin subset)
- Headings: `text-xl font-bold` / `text-2xl font-bold`
- Card titles: `text-base font-semibold`
- Body: `text-sm`
- Muted: `text-xs text-slate-500`

## Layout Pattern

```tsx
<div className="max-w-5xl mx-auto p-6 space-y-6">
  {/* Page header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-xl font-bold">Page Title</h1>
      <p className="text-sm text-slate-500">Description</p>
    </div>
    <Button>Primary Action</Button>
  </div>
  {/* Content */}
</div>
```

## Icons

Using `lucide-react`. Common icons:

| Icon | Usage |
|------|-------|
| `TrendingUp` | Forecasts, app brand |
| `Database` | Data series |
| `GitBranch` | Scenarios |
| `Bot` | AI copilot |
| `Play` | Run forecast |
| `Plus` | Create actions |
| `Trash2` | Delete |
| `ChevronDown/Up` | Expand/collapse |
