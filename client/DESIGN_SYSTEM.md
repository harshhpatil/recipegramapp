# RecipeGram Design System
**Warm & Inviting - Minimal Aesthetic**

## Philosophy
RecipeGram's design language prioritizes warmth, clarity, and reduced cognitive load. We use earthy tones, generous whitespace, and refined typography to create a slick, minimal interface that feels inviting and food-friendly.

---

## Color Palette

### Neutral Backgrounds (Cream Tones)
Soft, warm backgrounds that reduce eye strain and create an inviting atmosphere.

- `cream-50`: `#FDFCFB` - Main app background
- `cream-100`: `#F8F6F4` - Card backgrounds
- `cream-200`: `#F3F1EE` - Hover states
- `cream-300`: `#EBE8E4` - Borders and dividers

### Warm Grays
Natural, warm grays that replace harsh cold grays.

- `warmGray-50` → `warmGray-900`: Full spectrum from lightest to darkest
- Primary text: `warmGray-800` (`#3A3734`)
- Secondary text: `warmGray-600` (`#5A5653`)
- Disabled text: `warmGray-400` (`#8C8784`)

### Primary Accent (Terracotta/Coral)
Warm, food-friendly orange that adds energy without being overwhelming.

- `primary-500`: `#E8825C` - Primary action color
- `primary-600`: `#D66B43` - Hover state
- Use for: Primary buttons, links, active states

### Secondary Accent (Sage Green)
Earthy green that complements food imagery and natural themes.

- `secondary-500`: `#8B9A7E` - Secondary actions
- `secondary-600`: `#748268` - Hover state
- Use for: Secondary actions, success states, nature-related features

### Semantic Colors
Warmed versions of standard semantic colors.

- **Success**: `#7FB069` - Confirmations, achievements
- **Warning**: `#F4A261` - Alerts, cautions
- **Error**: `#D16666` - Errors, destructive actions
- **Info**: `#7BAAB5` - Informational messages

---

## Typography

### Font Family
System font stack for optimal performance and native feel:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

**Monospace** (for recipe data like timers, measurements):
```css
font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, monospace;
```

### Type Scale
Refined scale with optimized line heights and letter spacing:

| Size | Class | Font Size | Line Height | Letter Spacing | Use Case |
|------|-------|-----------|-------------|----------------|----------|
| XS | `text-xs` | 0.75rem | 1rem | 0.02em | Labels, captions |
| SM | `text-sm` | 0.875rem | 1.25rem | 0.01em | Secondary text |
| Base | `text-base` | 1rem | 1.5rem | 0 | Body text |
| LG | `text-lg` | 1.125rem | 1.75rem | -0.01em | Emphasized text |
| XL | `text-xl` | 1.25rem | 1.875rem | -0.01em | Small headings |
| 2XL | `text-2xl` | 1.5rem | 2rem | -0.02em | Section headings |
| 3XL | `text-3xl` | 1.875rem | 2.25rem | -0.02em | Page headings |
| 4XL | `text-4xl` | 2.25rem | 2.75rem | -0.03em | Hero text |
| 5XL | `text-5xl` | 3rem | 3.5rem | -0.03em | Marketing/landing |

### Font Weights
- `font-normal`: 400 - Body text
- `font-medium`: 500 - Emphasized text
- `font-semibold`: 600 - Headings, buttons
- `font-bold`: 700 - Strong emphasis (use sparingly)

---

## Spacing

### Principles
- Use generous whitespace to reduce cognitive load
- Follow 8px base grid system
- Component padding: Minimum `p-4` (16px), standard `p-6` (24px)
- Section spacing: `gap-8` or `gap-12` between major sections

### Custom Spacing Utilities
- `spacing-18`: 4.5rem (72px) - Large section breaks
- `spacing-88`: 22rem - Max content widths
- `spacing-104`: 26rem - Sidebar widths
- `spacing-128`: 32rem - Modal max widths

---

## Shadows

Soft, warm shadows that create subtle depth without harsh contrast:

| Class | Use Case |
|-------|----------|
| `shadow-soft-xs` | Minimal elevation (badges) |
| `shadow-soft-sm` | Small components (buttons) |
| `shadow-soft` | Standard cards |
| `shadow-soft-md` | Interactive cards (hover) |
| `shadow-soft-lg` | Modals, panels |
| `shadow-soft-xl` | Dropdowns, popovers |
| `shadow-glow` | Focus states, highlights |

**Implementation**: All shadows use `rgba(74, 69, 67, *)` for warm undertones.

---

## Border Radius

Consistent rounded corners for a soft, friendly feel:

- `rounded-sm`: 0.25rem (4px) - Small elements
- `rounded`: 0.5rem (8px) - Buttons, inputs
- `rounded-md`: 0.625rem (10px) - Cards (default)
- `rounded-lg`: 0.75rem (12px) - Featured cards
- `rounded-xl`: 1rem (16px) - Large cards, modals
- `rounded-2xl`: 1.5rem (24px) - Hero sections
- `rounded-3xl`: 2rem (32px) - Special components

---

## Component Patterns

### Cards
```jsx
<div className="card">
  {/* Uses .card class: bg-cream-100, rounded-xl, shadow-soft */}
</div>
```

**Variants:**
- Standard: `card`
- Hover effect: Automatically applies `shadow-soft-md` on hover
- Interactive: Add `cursor-pointer` for clickable cards

### Buttons

#### Primary
```jsx
<button className="btn-primary">
  Primary Action
</button>
```
- Background: `primary-500`
- Hover: `primary-600` with increased shadow
- Active: Slight scale down (0.98)

#### Secondary
```jsx
<button className="btn-secondary">
  Secondary Action
</button>
```

#### Outline
```jsx
<button className="btn-outline">
  Tertiary Action
</button>
```

#### Ghost
```jsx
<button className="btn-ghost">
  Minimal Action
</button>
```

### Inputs
```jsx
<input className="input" placeholder="Enter text..." />
```
- Background: `cream-100`
- Border: `cream-300`
- Focus: Ring `primary-500/30`

### Avatars
```jsx
<div className="avatar w-10 h-10">
  {user.initials}
</div>
```

### Badges
```jsx
<span className="badge badge-primary">New</span>
<span className="badge badge-secondary">Popular</span>
<span className="badge badge-success">Verified</span>
```

---

## Animations

### Principles
- Subtle, meaningful motion
- Duration: 200-400ms for UI interactions
- Easing: `ease-out` for entrances, `ease-in-out` for continuous

### Available Animations

| Class | Use Case | Duration |
|-------|----------|----------|
| `animate-fade-in` | Content appearing | 300ms |
| `animate-slide-up` | Modal/panel entrance | 400ms |
| `animate-scale-in` | Popover/tooltip | 200ms |
| `animate-float` | Decorative float effect | 3s (infinite) |

### Transitions
All interactive elements get `transition-all duration-200`:
- Buttons
- Links
- Inputs (focus states)
- Cards (hover states)

---

## Layout Guidelines

### Max Widths
- **Full content**: `max-w-7xl` (1280px)
- **Reading content**: `max-w-2xl` (672px) - Posts, articles
- **Forms**: `max-w-md` (448px)
- **Modals**: `max-w-lg` to `max-w-2xl`

### Container
```jsx
<div className="container-custom">
  {/* max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 */}
</div>
```

### Grid Usage
```jsx
{/* Two-column responsive */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
{/* Three-column responsive */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
```

---

## Accessibility

### Focus States
- Use `focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`
- Or use `.focus-visible-only` utility class for keyboard-only focus

### Color Contrast
All color combinations meet WCAG AA standards:
- Text on `cream-50`: Minimum `warmGray-700`
- Text on `cream-100`: Minimum `warmGray-800`
- White text: Only on `primary-500+`, `secondary-600+`

### Interactive States
- Hover: Clear visual feedback
- Active: Scale down slightly (`active:scale-[0.98]`)
- Disabled: `opacity-50` + `cursor-not-allowed`

---

## Responsive Breakpoints

Tailwind default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach
Always design for mobile first, then enhance for larger screens.

```jsx
{/* Mobile: full width, Desktop: fixed width */}
<div className="w-full md:w-auto">

{/* Mobile: stack, Desktop: row */}
<div className="flex flex-col md:flex-row gap-4">
```

---

## Best Practices

### DO ✅
- Use generous whitespace (`p-6`, `gap-8`, `my-12`)
- Stick to the defined color palette
- Use semantic HTML elements
- Maintain consistent border radius across components
- Apply subtle transitions to interactive elements
- Use `warmGray` instead of default `gray`

### DON'T ❌
- Mix cold grays with warm palette
- Use arbitrary values unless absolutely necessary
- Create custom colors outside the design system
- Apply heavy shadows or gradients
- Overcomplicate animations
- Use pure white (`#FFF`) for backgrounds (use `cream-50`)
- Use pure black (`#000`) for text (use `warmGray-900`)

---

## Future Extensibility

The design system is built to support upcoming features:

- **Collections/Albums**: Badge system ready for categorization
- **Recipe Steps**: Monospace font for structured data
- **Ingredients**: List styling with checkboxes
- **Tags/Categories**: Badge variants for different types
- **Advanced Search**: Form components with filters
- **Achievements**: Badge system for gamification

All new components should:
1. Follow the warm color palette
2. Use defined spacing values
3. Include hover/focus states
4. Be responsive by default
5. Support keyboard navigation

---

## Questions or Suggestions?

This design system is a living document. As RecipeGram evolves, the design system will adapt while maintaining backward compatibility and the core warm, minimal aesthetic.
