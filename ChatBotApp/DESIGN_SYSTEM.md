# PLDT Enterprise Communication Dashboard - Design System

## Overview
This is a production-ready design system for a modern, enterprise-grade telecom UI with PLDT brand aesthetics.

---

## Design Tokens

### Color Palette

#### Primary Brand Colors
```css
PLDT Red:      #D6001C  /* Primary brand color */
Dark Red:      #A00016  /* Hover states, emphasis */
Deep Red:      #7A0011  /* Active states */
Light Red:     #E6334D  /* Subtle highlights */
```

#### Neutral Colors
```css
Charcoal:      #1A1A1A  /* Primary text */
Gray 900:      #2D2D2D
Gray 800:      #404040
Gray 700:      #525252
Gray 600:      #737373  /* Secondary text */
Gray 500:      #8C8C8C
Gray 400:      #A6A6A6
Gray 300:      #BFBFBF  /* Borders */
Gray 200:      #D9D9D9  /* Light borders */
Gray 100:      #EDEDED
Gray 50:       #F5F6F8  /* Background */
White:         #FFFFFF
```

#### Semantic Colors
```css
Success:       #00A651
Warning:       #FF9500
Error:         #D6001C
Info:          #0066CC
```

---

## Layout Structure

### Two-Column Split Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  LEFT PANEL (60%)         │  RIGHT PANEL (40%)    │
│                           │                        │
│  ┌─────────────────┐     │  ┌──────────────────┐ │
│  │                 │     │  │                  │ │
│  │     RADIAL      │     │  │   EMPTY STATE    │ │
│  │  VISUALIZATION  │     │  │       OR         │ │
│  │                 │     │  │   CONVERSATION   │ │
│  │                 │     │  │                  │ │
│  └─────────────────┘     │  └──────────────────┘ │
│         ⭕                │                        │
│    CALL BUTTON           │  ┌──────────────────┐ │
│                          │  │  MESSAGE INPUT   │ │
│  ⚙️  🎤                   │  └──────────────────┘ │
│  CONTROLS                │                        │
└─────────────────────────────────────────────────────┘
```

---

## Components

### 1. RadialVisualization
**Location:** Left panel, vertically centered

**Features:**
- Large circular radial visualization (400px diameter)
- 24 segmented outer ring with rotation animation
- Gradient rings (outer, middle, inner)
- Center content area with status and timer
- Network activity indicators during active state
- Glow effect during active calls

**States:**
- `idle` - Gray, static, ready state
- `connecting` - Yellow/orange, pulsing
- `active` - Red gradient, rotating, glowing
- `ending` - Gray, fading

---

### 2. Call Button
**Location:** Floating at bottom of radial circle

**Specifications:**
- Size: 88×88px
- Shape: Perfect circle
- Background: PLDT red gradient
- Icon: Phone (start) / Phone Off (end)
- Shadow: Elevated with glow on active
- Animation: Subtle pulse ring on idle
- Hover: Scale 1.05, enhanced glow

**Interaction:**
- Smooth hover/active transitions (300ms)
- Disabled states for connecting/ending
- Pulse animation on idle state

---

### 3. Control Buttons
**Location:** Bottom-left corner

**Components:**
- Settings button (gear icon)
- Mute toggle (mic/mic-off icon)

**Specifications:**
- Size: 48×48px each
- Background: White with subtle shadow
- Border: 1px gray-200
- Hover: Lift effect (translateY -2px)
- Active mic muted: Red background

---

### 4. Empty State
**Location:** Right panel center

**Content:**
- Icon container (80×80px circular with red-light background)
- Message Square icon
- Heading: "Start a conversation"
- Description: "Call or send a message to start a new conversation"

---

### 5. Message Input
**Location:** Right panel bottom, fixed

**Specifications:**
- Container: Rounded (24px), light gray background
- Height: 56px
- Input: Full-width, no border, transparent
- Send button: 44×44px circular, red background
- Focus state: White background, red border, shadow

---

## Design Patterns

### Spacing System (8px base)
```
4px  - Tight spacing
8px  - Base unit
16px - Standard padding
24px - Section spacing
32px - Large spacing
48px - Panel spacing
64px - Major sections
```

### Border Radius
```
8px  - Small elements
12px - Medium elements
16px - Large cards/panels
24px - Message input, major UI
Full - Circular buttons
```

### Shadows (Enterprise-grade)
```css
sm:    0 1px 2px rgba(26, 26, 26, 0.04)
base:  0 2px 4px -1px rgba(26, 26, 26, 0.06)
md:    0 4px 6px -2px rgba(26, 26, 26, 0.08)
lg:    0 8px 12px -4px rgba(26, 26, 26, 0.10)
glow:  0 0 24px rgba(214, 0, 28, 0.24)
```

### Typography
```css
Font Family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

XS:   12px / 16px line-height
SM:   14px / 20px line-height
Base: 16px / 24px line-height
LG:   18px / 28px line-height
XL:   20px / 28px line-height
2XL:  24px / 32px line-height
3XL:  30px / 36px line-height
4XL:  36px / 40px line-height
```

---

## Animations

### Duration
```
Fast:   200ms
Normal: 300ms
Slow:   500ms
```

### Easing
```
Default:  cubic-bezier(0.4, 0, 0.2, 1)
Smooth:   cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Keyframe Animations

**Pulse (idle call button):**
```css
@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
}
```

**Glow (active state):**
```css
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(214, 0, 28, 0.2); }
  50% { box-shadow: 0 0 40px rgba(214, 0, 28, 0.4); }
}
```

**Rotation (radial visualization):**
- Continuous rotation at 50ms interval
- Smooth transition between frames

---

## Accessibility

- Focus visible: 2px red outline with 2px offset
- All interactive elements keyboard accessible
- Sufficient color contrast ratios (WCAG AA)
- Disabled states clearly indicated
- ARIA labels for icon-only buttons

---

## Responsive Behavior

### Desktop (primary target)
- Full split-screen layout
- 60/40 column ratio
- Fixed positioning for controls

### Tablet (≤1024px)
- Maintain split layout
- Reduce radial size to 320px
- Adjust column ratio to 50/50

### Mobile (≤768px)
- Stack layout vertically
- Full-width panels
- Radial visualization 280px
- Simplified controls

---

## Component File Structure

```
src/
├── design-system/
│   └── tokens.ts                 # Design tokens
├── components/
│   ├── PLDTCallCenter.tsx        # Main layout
│   ├── RadialVisualization.tsx   # Radial component
│   ├── EmptyState.tsx            # Empty state UI
│   └── ChatContainer.tsx         # Conversation view
└── index.css                      # Global styles
```

---

## Usage Example

```tsx
import { PLDTCallCenter } from './components/PLDTCallCenter';

function App() {
  return <PLDTCallCenter />;
}
```

---

## Implementation Notes

### Technology Stack
- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (icons)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Smooth 60fps animations
- Optimized SVG rendering
- Minimal re-renders
- Efficient WebSocket handling

---

## Brand Guidelines

### Do's ✓
- Use PLDT red consistently for primary actions
- Maintain generous whitespace
- Keep animations subtle and professional
- Use soft shadows for depth
- Ensure enterprise-grade polish

### Don'ts ✗
- No playful or consumer-focused elements
- Avoid heavy shadows or effects
- No bright or saturated secondary colors
- No complex gradients outside defined tokens
- No animation durations > 500ms

---

## Future Enhancements

- Dark mode support
- Custom theme variants
- Advanced conversation features
- Real-time collaboration indicators
- Multi-language support
- Analytics dashboard integration

---

*Design System v1.0 - PLDT Enterprise Communication Dashboard*
