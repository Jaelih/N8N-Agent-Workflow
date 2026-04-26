# PLDT Enterprise UI - CSS Styling Reference

## Quick Reference Guide

---

## Color Classes

### Background Colors

```css
/* PLDT Brand Backgrounds */
.bg-pldt-red              /* #D6001C */
.bg-pldt-red-dark         /* #A00016 */
.bg-pldt-red-deep         /* #7A0011 */
.bg-pldt-red-light        /* #E6334D */

/* Neutral Backgrounds */
.bg-gray-50               /* #F5F6F8 - Light background */
.bg-white                 /* #FFFFFF */
```

### Text Colors

```css
/* PLDT Brand Text */
.text-pldt-red            /* #D6001C */
.text-pldt-red-dark       /* #A00016 */

/* Neutral Text */
.text-gray-900            /* Dark text */
.text-gray-700            /* Body text */
.text-gray-600            /* Secondary text */
.text-gray-500            /* Muted text */
```

### Border Colors

```css
.border-pldt-red          /* #D6001C */
.border-gray-200          /* Light borders */
.border-gray-300          /* Medium borders */
```

---

## Spacing Utilities

```css
/* Padding */
.p-2    /* 8px */
.p-4    /* 16px */
.p-6    /* 24px */
.p-8    /* 32px */

/* Margin */
.m-2    /* 8px */
.m-4    /* 16px */
.m-6    /* 24px */
.m-8    /* 32px */

/* Gap (Flexbox/Grid) */
.gap-2  /* 8px */
.gap-4  /* 16px */
.gap-6  /* 24px */
.gap-8  /* 32px */
```

---

## Border Radius

```css
.rounded-lg      /* 16px - Large cards */
.rounded-xl      /* 20px - Major elements */
.rounded-2xl     /* 24px - Input fields */
.rounded-3xl     /* 32px - Hero sections */
.rounded-full    /* 9999px - Circular */
```

---

## Shadows

```css
/* Standard Shadows */
.shadow-sm       /* Subtle elevation */
.shadow          /* Base shadow */
.shadow-md       /* Medium elevation */
.shadow-lg       /* High elevation */
.shadow-xl       /* Maximum elevation */

/* Custom PLDT Shadows */
.shadow-glow           /* Red glow effect */
.shadow-glow-active    /* Enhanced red glow */
```

---

## Animations

### Pre-defined Animations

```css
/* Pulse Effects */
.animate-pulse          /* Standard pulse */
.animate-pulse-slow     /* 3s slow pulse */
.animate-pulse-subtle   /* 2s subtle pulse */

/* Movement */
.animate-slide-up       /* Slide up entrance */
.animate-fade-in        /* Fade in entrance */

/* Special Effects */
.animate-glow           /* Continuous glow */
.animate-ping           /* Ripple effect */
```

### Custom Animation Examples

```tsx
// Hover scale effect
<button
  className="transition-transform duration-300 hover:scale-105"
>
  Button
</button>

// Smooth color transition
<div
  className="transition-colors duration-200 hover:bg-pldt-red"
>
  Hover me
</div>

// Combined transitions
<div
  className="transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-102"
>
  Card
</div>
```

---

## Layout Utilities

### Flexbox

```css
/* Container */
.flex
.flex-col           /* Column direction */
.flex-row           /* Row direction */

/* Alignment */
.items-center       /* Vertical center */
.items-start        /* Vertical start */
.items-end          /* Vertical end */
.justify-center     /* Horizontal center */
.justify-between    /* Space between */
.justify-end        /* Horizontal end */

/* Flex sizing */
.flex-1             /* Flex grow */
.flex-none          /* No flex */
```

### Grid

```css
.grid
.grid-cols-2        /* 2 columns */
.grid-cols-3        /* 3 columns */
.gap-4              /* 16px gap */
```

---

## Typography

### Font Sizes

```css
.text-xs      /* 12px */
.text-sm      /* 14px */
.text-base    /* 16px */
.text-lg      /* 18px */
.text-xl      /* 20px */
.text-2xl     /* 24px */
.text-3xl     /* 30px */
.text-4xl     /* 36px */
```

### Font Weights

```css
.font-normal     /* 400 */
.font-medium     /* 500 */
.font-semibold   /* 600 */
.font-bold       /* 700 */
```

### Text Alignment

```css
.text-left
.text-center
.text-right
```

### Letter Spacing

```css
.tracking-tight    /* Tighter */
.tracking-normal   /* Normal */
.tracking-wide     /* Wider */
```

---

## Complete Component Examples

### 1. Primary Button (PLDT Style)

```tsx
<button
  className="
    px-6 py-3
    bg-pldt-red hover:bg-pldt-red-dark
    text-white font-semibold
    rounded-xl
    shadow-md hover:shadow-lg
    transition-all duration-300
    transform hover:scale-105
  "
>
  Click Me
</button>
```

### 2. Secondary Button

```tsx
<button
  className="
    px-6 py-3
    bg-white hover:bg-gray-50
    text-pldt-red font-semibold
    border-2 border-pldt-red
    rounded-xl
    shadow-sm hover:shadow-md
    transition-all duration-300
  "
>
  Secondary Action
</button>
```

### 3. Card Component

```tsx
<div
  className="
    bg-white
    rounded-2xl
    shadow-md hover:shadow-lg
    p-6
    border border-gray-200
    transition-all duration-300
  "
>
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    Card Title
  </h3>
  <p className="text-gray-600">
    Card content goes here
  </p>
</div>
```

### 4. Input Field (PLDT Style)

```tsx
<div className="relative">
  <input
    type="text"
    placeholder="Enter message..."
    className="
      w-full
      px-6 py-4
      bg-gray-50 focus:bg-white
      border border-gray-200 focus:border-pldt-red
      rounded-2xl
      text-base text-gray-900
      placeholder:text-gray-500
      outline-none
      transition-all duration-300
      focus:shadow-md
    "
  />
</div>
```

### 5. Circular Icon Button

```tsx
<button
  className="
    w-12 h-12
    bg-white hover:bg-gray-50
    border border-gray-200
    rounded-full
    shadow-sm hover:shadow-md
    flex items-center justify-center
    transition-all duration-200
    transform hover:-translate-y-0.5
  "
>
  <svg className="w-5 h-5 text-gray-700">
    {/* Icon */}
  </svg>
</button>
```

### 6. Badge/Tag

```tsx
<span
  className="
    inline-flex items-center
    px-3 py-1
    bg-red-50
    text-pldt-red text-sm font-medium
    rounded-full
    border border-pldt-red/20
  "
>
  Active
</span>
```

### 7. Alert/Notification

```tsx
<div
  className="
    bg-white
    border-l-4 border-pldt-red
    rounded-xl
    shadow-lg
    p-4
    flex items-start gap-3
  "
>
  <div className="flex-shrink-0">
    <svg className="w-5 h-5 text-pldt-red">
      {/* Icon */}
    </svg>
  </div>
  <div>
    <h4 className="font-semibold text-gray-900">Notice</h4>
    <p className="text-sm text-gray-600">Your message here</p>
  </div>
</div>
```

### 8. Loading Spinner

```tsx
<div
  className="
    w-8 h-8
    border-3 border-gray-200
    border-t-pldt-red
    rounded-full
    animate-spin
  "
/>
```

---

## Interactive States

### Hover States

```css
/* Background hover */
hover:bg-pldt-red
hover:bg-gray-50

/* Scale hover */
hover:scale-105
hover:scale-110

/* Shadow hover */
hover:shadow-lg
hover:shadow-glow

/* Transform hover */
hover:-translate-y-1
hover:translate-x-1
```

### Focus States

```css
/* Focus visible (accessibility) */
focus:outline-none
focus:ring-2
focus:ring-pldt-red
focus:ring-offset-2

/* Focus borders */
focus:border-pldt-red
focus:border-2
```

### Active States

```css
/* Active pressed state */
active:scale-95
active:bg-pldt-red-dark
active:shadow-inner
```

### Disabled States

```css
/* Disabled styling */
disabled:opacity-50
disabled:cursor-not-allowed
disabled:bg-gray-300
```

---

## Responsive Utilities

```css
/* Mobile first approach */

/* Small screens and up (640px+) */
sm:text-lg
sm:p-6

/* Medium screens and up (768px+) */
md:flex
md:grid-cols-2

/* Large screens and up (1024px+) */
lg:text-xl
lg:p-8

/* Extra large screens (1280px+) */
xl:grid-cols-3
xl:text-2xl
```

### Example: Responsive Layout

```tsx
<div
  className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    gap-4
    sm:gap-6
    lg:gap-8
  "
>
  {/* Items */}
</div>
```

---

## Custom CSS Properties

### Usage in inline styles

```tsx
<div
  style={{
    backgroundColor: 'hsl(var(--pldt-red))',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-lg)',
  }}
>
  Content
</div>
```

### Available CSS Variables

```css
:root {
  --pldt-red: 347 100% 42%;
  --pldt-red-dark: 347 100% 35%;
  --radius: 1rem;
  --shadow-lg: 0 8px 12px -4px rgba(26, 26, 26, 0.10);
}
```

---

## Glassmorphism Effects (Optional)

```tsx
<div
  className="
    bg-white/80
    backdrop-blur-sm
    border border-white/20
    shadow-lg
    rounded-2xl
  "
>
  Glassmorphic content
</div>
```

---

## Best Practices

### ✓ Do's

- Use design tokens from `tokens.ts` for inline styles
- Combine Tailwind classes for consistency
- Use transition utilities for smooth interactions
- Maintain 8px spacing grid
- Use semantic color names

### ✗ Don'ts

- Don't mix inline styles with arbitrary values
- Avoid !important unless absolutely necessary
- Don't use colors outside the design system
- Avoid animation durations > 500ms
- Don't use heavy shadows in production

---

## Performance Tips

1. **Minimize re-renders:**
   ```tsx
   const style = useMemo(() => ({
     backgroundColor: designTokens.colors.pldt.red
   }), []);
   ```

2. **Use CSS classes over inline styles when possible:**
   ```tsx
   // Good
   <div className="bg-pldt-red" />
   
   // Less optimal
   <div style={{ backgroundColor: '#D6001C' }} />
   ```

3. **Optimize animations:**
   ```css
   /* Only animate transform and opacity */
   transition: transform 0.3s, opacity 0.3s;
   will-change: transform;
   ```

---

## Debugging Tips

### View applied classes in DevTools:

1. Inspect element
2. Check "Computed" tab
3. Filter by property name

### Test hover/focus states:

1. Open DevTools
2. Click element state selector (`:hov`)
3. Enable `:hover` or `:focus`

---

*CSS Styling Reference v1.0 - PLDT Enterprise UI*
