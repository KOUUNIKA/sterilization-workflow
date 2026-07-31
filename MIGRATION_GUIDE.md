# Modoock-Health Visual Identity Migration Guide

## Design Tokens

### Colors — semantic tokens only, no raw hex values

| Token | Use |
|---|---|
| `primary` | #1378ac — main brand blue |
| `primary-foreground` | white text on primary bg |
| `primary-muted` | light blue tint background |
| `secondary` | #3b8c6e — success/validated green |
| `secondary-foreground` | white text on secondary bg |
| `secondary-muted` | light green tint background |
| `muted` | neutral light background |
| `muted-foreground` | subdued text |
| `foreground` | main text color |
| `card` | panel/card background |
| `border` | all border colors |
| `destructive` | error/danger red |
| `warning` | amber/orange warning |
| `warning-muted` | light warning background |

**Never use:** raw hex values (`#1378ac`, `#0b4867`, `#11b5a2`, `#eafaf7`, etc.), `slate-*`, `blue-*`, `emerald-*`, `indigo-*`, `amber-*`, `red-*` Tailwind palette classes.

---

## Typography

- `font-semibold` or `font-medium` — the only allowed font weights
- **Never use:** `font-black`, `font-bold`, `font-extrabold`
- Labels/uppercase: `text-[10px] font-medium uppercase tracking-wide`
- Section titles: `text-base font-semibold` or `text-sm font-semibold`
- Body: `text-sm font-medium`

---

## Border Radius

| Element | Class |
|---|---|
| Panels, sections, modals | `rounded-xl` |
| Buttons, inputs, tags, chips | `rounded-lg` |
| Circular badges | `rounded-full` |

**Never use:** `rounded-2xl`, `rounded-3xl`, `rounded-[2rem]`, `rounded-[3rem]`

---

## Shadows

- Allowed: `shadow-sm` only
- **Never use:** `shadow-xl`, `shadow-2xl`, `shadow-[0_40px_...]`, custom shadow values

---

## Buttons — Interactive Utilities

Always use these CSS utility classes (defined in `globals.css @layer components`):

| Class | Use |
|---|---|
| `.interactive-primary` | Primary CTA (blue) |
| `.interactive-secondary` | Confirm/validate (green) |
| `.interactive-muted` | Cancel, back, edit, minor actions |
| `.interactive-danger` | Destructive actions (reset, delete) |
| `.interactive-warning` | Warning-level actions |

**Never use:** raw `bg-[#...]` + `hover:bg-[#...]` chains on buttons.

Disabled state: `bg-muted text-muted-foreground cursor-not-allowed border border-border`

---

## Component Patterns

### Panels / Sections
```tsx
<section className="rounded-xl border border-border bg-card p-4 shadow-sm">
```

Validated/scanned state: `border-secondary` (not `ring-4 ring-[#eafaf7]`)

### Step index badge
```tsx
<span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
  01
</span>
```

### Validated chip
```tsx
<span className="rounded-full border border-secondary/20 bg-secondary-muted px-2.5 py-0.5 text-[10px] font-medium uppercase text-secondary">
  Validé
</span>
```

### Phase/status badge (info)
```tsx
<div className="inline-flex items-center rounded-full border border-primary/20 bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
  Phase 03 · Nettoyage
</div>
```

### Operator card (confirmed state)
```tsx
<div className="rounded-xl bg-primary p-3 text-primary-foreground">
  <div className="flex items-center gap-3">
    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
      <User className="size-5 text-primary-foreground/80" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold truncate">{name}</p>
      <p className="text-[10px] font-medium text-primary-foreground/60 truncate">{role}</p>
    </div>
  </div>
</div>
```
Always import `User` from `lucide-react`. Never use emoji as avatar.

### Operator card (waiting state)
```tsx
<div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted py-4">
  <p className="text-xs font-medium text-muted-foreground">En attente du badge</p>
</div>
```

### Qualification gate — loading
```tsx
<div className="flex flex-1 items-center justify-center py-20">
  <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
</div>
```

### Qualification gate — not qualified
```tsx
<div className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center">
  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-warning-muted border border-warning/20">
    <AlertCircle className="size-8 text-warning" />
  </div>
  <div>
    <h2 className="text-lg font-semibold text-foreground">Qualification requise</h2>
    <p className="mt-1 text-sm text-muted-foreground">...</p>
  </div>
  <button onClick={...} className="interactive-primary flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-medium uppercase tracking-wide">
    Aller à la qualification
  </button>
</div>
```

### Demo simulation panel (fixed, never floating/absolute)
```tsx
{quickActionLabel && (
  <div className="fixed bottom-32 right-6 z-[100]">
    <div className="bg-card rounded-xl p-2.5 shadow-lg border border-border flex flex-col gap-2 min-w-[160px]">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center">Demo</p>
      <button onClick={triggerSimulation} className="interactive-primary flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium">
        {quickActionLabel}
      </button>
    </div>
  </div>
)}
```
Use `fixed` not `absolute` — outer containers often have `overflow-hidden` that clips absolute children.

### Inputs
```tsx
<input className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card" />
```

### Modals / Overlays
```tsx
<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
  <button type="button" onClick={onClose} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
  <div className="relative z-[101] bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-lg animate-in zoom-in-95 duration-200">
    ...
  </div>
</div>
```

### Destructive confirm modal (reset/delete)
```tsx
<div className="size-14 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-5 mx-auto">
  <AlertCircle className="size-7" />
</div>
<h3 className="text-lg font-semibold text-foreground text-center mb-2">Tout effacer ?</h3>
<div className="grid grid-cols-2 gap-3">
  <button className="interactive-muted py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide">Annuler</button>
  <button className="interactive-danger py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide">Confirmer</button>
</div>
```

### Warning alert banner
```tsx
<div className="bg-warning-muted border border-warning/20 rounded-lg p-3 flex items-center gap-2">
  <AlertCircle className="size-4 text-warning shrink-0" />
  <p className="text-xs font-medium text-warning">...</p>
</div>
```

### Footer action bar
```tsx
<div className="shrink-0 flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm mt-auto gap-4">
  <div className="flex items-center gap-3">
    <button className="interactive-muted flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wide">
      <ChevronLeft className="size-4" /> Étape précédente
    </button>
    <button className="interactive-danger flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wide">
      <RotateCcw className="size-4" /> Tout effacer
    </button>
  </div>
  <button disabled={!isComplete} className={`flex items-center gap-2 rounded-lg px-8 py-2.5 text-xs font-medium uppercase tracking-wide ${isComplete ? "interactive-secondary" : "bg-muted text-muted-foreground cursor-not-allowed border border-border"}`}>
    <CheckCircle2 className="size-4" /> Étape suivante
  </button>
</div>
```

### CheckItem (checklist row)
```tsx
<button className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
  checked ? "border-secondary bg-secondary-muted text-secondary" : "border-border bg-card text-muted-foreground"
}`}>
  <div className={`flex size-4 shrink-0 items-center justify-center rounded border-2 text-[10px] ${
    checked ? "border-secondary bg-secondary text-secondary-foreground" : "border-border"
  }`}>
    {checked && "✓"}
  </div>
  <span className="text-xs font-medium">{label}</span>
</button>
```

### Instrument status colors
```tsx
// validated → secondary
"border-secondary/20 bg-secondary-muted text-secondary"
// missing → destructive
"border-destructive/20 bg-destructive/5 text-destructive"
// defective → warning
"border-warning/20 bg-warning-muted text-warning"
// pending → muted
"border-border bg-muted text-muted-foreground"
```

### Filter tabs
```tsx
// Container
<div className="flex rounded-lg border border-border bg-muted p-1 gap-1">
// Active tab
<button className="px-3 py-1.5 rounded-md text-xs font-medium bg-card text-foreground shadow-sm">
// Inactive tab
<button className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground">
```

---

## Rules Summary

1. **No emojis** anywhere — icons, labels, avatars, empty states. Use Lucide icons instead.
2. **No raw hex** — every color via semantic token.
3. **No `font-black`** — `font-semibold` or `font-medium` only.
4. **No `rounded-2xl` or larger** — `rounded-xl` for panels, `rounded-lg` for controls.
5. **No `shadow-xl`+** — `shadow-sm` only.
6. **Demo buttons**: always `fixed bottom-32 right-6 z-[100]`, never `absolute`.
7. **Operator avatar**: always `<User />` lucide icon in `bg-white/10` container inside `bg-primary` card.
8. **Validated state**: `border-secondary` only — no ring utilities.

---

## Files — Migration Status

### Done
- `components/BiologicalIndicatorValidation.tsx`
- `components/layout/WorkflowNotesPanel.tsx`
- `components/steps/PredesinfectionWizard.tsx`
- `components/SterilizationReception.tsx`
- `components/steps/Lavage.tsx`
- `components/steps/Recomposition.tsx`
- `components/steps/Sterilization.tsx`
- `components/steps/Dechargesterilization.tsx`
- `components/steps/StorageDistribution.tsx`
- `components/HistoryView.tsx`

### Remaining
| File | Notes |
|---|---|
| `components/InventoryManagement.tsx` | Inventory table |
| `components/Chatbot.tsx` | Chat panel |

### Partially done / check
- `components/PatientLiaison.tsx` — footer done, inner content pending

---

## DB Integration Plan (HistoryView)

See full plan at `/Users/mac/.claude/plans/th-ebusinees-logic-of-virtual-wolf.md`.

Summary:
- `GET /api/trays` — list all trays for dropdown
- `GET /api/history/tray/[serialNumber]` — full event timeline per tray
- Replace static `BASE_HISTORY_ROWS` array in `HistoryView.tsx` with live fetch
- Keep existing zone/criticality/time filters and localStorage notes mechanism
- Notes keyed by `event.id` (real CUID from DB)
