# Campaign Planner — Style Reference

## CSS Variable Tokens

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--cp-primary` | `#1a73e8` | Primary actions, links, focus rings |
| `--cp-primary-hover` | `#1557b0` | Hover state for primary |
| `--cp-primary-light` | `#e8f0fe` | Light primary backgrounds |
| `--cp-primary-subtle` | `#f0f6ff` | Very subtle primary tint |
| `--cp-secondary` | `#0d904f` | Success states |
| `--cp-accent` | `#e37400` | Warnings, attention |
| `--cp-accent-gradient` | `linear-gradient(135deg, #7c3aed, #1a73e8)` | AI action buttons |
| `--cp-success` | `#0d904f` | Success states |
| `--cp-warning` | `#e37400` | Warning states |
| `--cp-error` | `#d93025` | Error states, danger |
| `--cp-info` | `#1a73e8` | Info states |

### Grays
`--cp-gray-50` (#f8f9fa) through `--cp-gray-900` (#202124) — 10-step scale

### Semantic Colors
| Token | Usage |
|-------|-------|
| `--cp-bg-primary` | Main background (white) |
| `--cp-bg-secondary` | Secondary background (#f8f9fb) |
| `--cp-text-primary` | Main text (#202124) |
| `--cp-text-secondary` | Secondary text (#5f6368) |
| `--cp-text-muted` | Muted text (#9aa0a6) |
| `--cp-border-light` | Light borders (#e8eaed) |
| `--cp-border-default` | Default borders (#dadce0) |
| `--cp-border-focus` | Focus ring color (#1a73e8) |

### Entity Colors
| Entity | Color |
|--------|-------|
| Persona | `#9334e9` (purple) |
| Message | `#1a73e8` (blue) |
| Style | `#e37400` (amber) |
| Format | `#0891b2` (teal) |
| Campaign | `#0891b2` (teal) |

### Shadows
`--cp-shadow-xs` → `--cp-shadow-xl` — 5-step scale plus `--cp-shadow-glow` for focus rings

### Spacing
`--cp-space-1` (4px) through `--cp-space-10` (40px) — 8 values

### Typography
| Token | Value |
|-------|-------|
| `--cp-font-family` | DM Sans, Segoe UI, system |
| `--cp-font-display` | Plus Jakarta Sans, Google Sans, system |
| `--cp-font-mono` | JetBrains Mono, Fira Code, Consolas |
| `--cp-font-size-xs` | 11px |
| `--cp-font-size-sm` | 13px |
| `--cp-font-size-base` | 14px |
| `--cp-font-size-lg` | 16px |
| `--cp-font-size-xl` | 18px |
| `--cp-font-size-2xl`–`4xl` | 20px, 24px, 30px |

### Border Radius
`--cp-radius-sm` (6px), `--cp-radius-md` (10px), `--cp-radius-lg` (16px), `--cp-radius-xl` (24px), `--cp-radius-full` (9999px)

### Layout
`--cp-sidebar-width` (200px), `--cp-header-height` (52px), `--cp-list-pane-width` (300px)

### Transitions
`--cp-transition-fast` (0.15s), `--cp-transition-base` (0.25s)

## Component Patterns

### Buttons
```css
.cp-btn { border-radius: var(--cp-radius-full); font-weight: 600; }
.cp-btn:hover { transform: translateY(-1px); box-shadow: var(--cp-shadow-sm); }
.cp-btn-primary { background: var(--cp-primary); color: var(--cp-white); }
.cp-btn-ai { background: var(--cp-accent-gradient); color: var(--cp-white); }
.cp-btn-outline { border: 1.5px solid var(--cp-border-default); }
.cp-btn-danger { color: var(--cp-error); border-color: var(--cp-error); }
```

### Cards
```css
.cp-card { background: var(--cp-white); border: 1px solid var(--cp-border-light); border-radius: var(--cp-radius-md); padding: var(--cp-space-4); }
```

### Inputs
```css
.cp-input, .cp-select, .cp-textarea {
  border: 1.5px solid var(--cp-border-default);
  border-radius: var(--cp-radius-sm);
  font-size: var(--cp-font-size-sm);
}
.cp-input:focus { border-color: var(--cp-border-focus); box-shadow: var(--cp-shadow-glow); }
```

### Badges
```css
.cp-badge { border-radius: var(--cp-radius-full); font-size: 11px; font-weight: 600; padding: 2px 8px; }
.cp-status-badge { display: inline-flex; align-items: center; gap: 4px; }
```

## Responsive Breakpoints
| Breakpoint | Target |
|------------|--------|
| 1200px | Large desktop adjustments |
| 992px | Sidebar collapses |
| 768px | Mobile layout, stacked columns |
| 480px | Small mobile, compact spacing |
