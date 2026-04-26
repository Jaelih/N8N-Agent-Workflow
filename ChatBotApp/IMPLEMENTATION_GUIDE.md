# PLDT Call Center UI - Implementation Guide

## Quick Start

### 1. Import the New Component

Update your main App.tsx to use the new PLDT-styled interface:

```tsx
import { PLDTCallCenter } from './components/PLDTCallCenter';

function App() {
  return <PLDTCallCenter />;
}

export default App;
```

---

## Component Overview

### Main Components Created

1. **design-system/tokens.ts**
   - Centralized design tokens
   - Colors, spacing, typography, shadows, animations
   - Type-safe constants

2. **components/PLDTCallCenter.tsx**
   - Main layout container
   - Split-screen interface (60/40)
   - Call state management
   - WebSocket integration

3. **components/RadialVisualization.tsx**
   - Animated radial display
   - 4 states: idle, connecting, active, ending
   - SVG-based with gradients
   - Rotation and pulse effects

4. **components/EmptyState.tsx**
   - Minimal centered layout
   - PLDT-branded icon container
   - Placeholder messaging

5. **index.css**
   - Custom animations
   - PLDT utility classes
   - Enterprise UI polish

6. **tailwind.config.js**
   - Updated PLDT color palette
   - Custom shadows (glow effects)
   - Extended configuration

---

## Styling Reference

### Custom Classes

```css
/* Background Colors */
.bg-pldt-red       /* #D6001C */

/* Text Colors */
.text-pldt-red     /* #D6001C */

/* Border Colors */
.border-pldt-red   /* #D6001C */

/* Animations */
.animate-pulse-slow      /* 3s pulse for glows */
.animate-glow            /* 2s glow effect */
```

---

## Design Tokens Usage

Import and use design tokens in your components:

```tsx
import { designTokens } from '../design-system/tokens';

// Colors
style={{ backgroundColor: designTokens.colors.pldt.red }}
style={{ color: designTokens.colors.neutral.charcoal }}

// Spacing
style={{ padding: designTokens.spacing[6] }}  // 24px
style={{ margin: designTokens.spacing[8] }}   // 32px

// Border Radius
style={{ borderRadius: designTokens.radius.xl }}  // 20px

// Shadows
style={{ boxShadow: designTokens.shadows.lg }}
style={{ boxShadow: designTokens.shadows.glow }}

// Gradients
style={{ background: designTokens.gradients.linearActive }}

// Animation
style={{ 
  transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.smooth}` 
}}
```

---

## Component States

### Call States

```typescript
type CallState = 'idle' | 'connecting' | 'active' | 'ending';
```

#### Idle
- Radial: Gray, static
- Call button: Red with pulse ring
- Controls: Settings only

#### Connecting
- Radial: Orange/yellow, pulsing
- Call button: Red, disabled
- Status: "Connecting..."

#### Active
- Radial: Red gradient, rotating, glowing
- Call button: Red background, shows PhoneOff icon
- Timer: Displays mm:ss
- Controls: Both settings and mute active
- Network indicators: Animated dots

#### Ending
- Radial: Gray, fading
- Call button: Disabled
- Status: "Ending call..."

---

## Key Features

### Left Panel

**Radial Visualization:**
- 400px diameter circle
- 3 ring layers (outer segmented, middle gradient, inner pulse)
- SVG-based with smooth animations
- Center display shows status/timer
- Network activity dots during active calls

**Call Button:**
- 88×88px circular button
- Floating at bottom of visualization
- Gradient background (PLDT red)
- Glow shadow on active state
- Pulse ring animation on idle
- Hover effect: scale + enhanced glow

**Control Section:**
- Bottom-left fixed position
- Settings icon button (48×48px)
- Mute toggle button (48×48px)
- Backdrop blur effect
- Lift on hover

### Right Panel

**Empty State:**
- Centered icon (MessageSquare)
- 80×80px circular container
- Light red background
- Clean typography
- Minimal, professional

**Message Input:**
- Fixed at bottom
- 24px border radius
- Expands on focus
- Integrated send button (44×44px circular)
- Red accent color
- Smooth transitions

---

## Customization

### Changing Colors

Update tokens in `design-system/tokens.ts`:

```typescript
colors: {
  pldt: {
    red: '#YOUR_COLOR',
    redDark: '#YOUR_DARK',
    // ...
  }
}
```

### Adjusting Layout Ratio

In `PLDTCallCenter.tsx`:

```tsx
{/* Left Panel - Change w-[60%] */}
<div className="w-[60%] h-full relative flex flex-col">

{/* Right Panel - Change w-[40%] */}
<div className="w-[40%] h-full bg-white flex flex-col relative">
```

### Modifying Radial Size

In `RadialVisualization.tsx`:

```tsx
<svg 
  width="400"   // Change these values
  height="400" 
  viewBox="0 0 400 400"
>
```

---

## Animation Timing

All animations use enterprise-appropriate durations:

- **Instant:** 100ms (micro-interactions)
- **Fast:** 200ms (hover effects)
- **Normal:** 300ms (state changes)
- **Slow:** 500ms (major transitions)

### Custom Animation Examples

```tsx
// Smooth hover
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'scale(1.05)';
}}

// Focus state
onFocus={(e) => {
  e.currentTarget.style.borderColor = designTokens.colors.pldt.red;
  e.currentTarget.style.boxShadow = designTokens.shadows.md;
}}
```

---

## Accessibility

### Focus Management

```css
*:focus-visible {
  outline: 2px solid #D6001C;
  outline-offset: 2px;
}
```

### Keyboard Navigation

- All buttons keyboard accessible
- Enter to submit message
- Tab navigation follows logical flow

### Screen Readers

Add ARIA labels to icon-only buttons:

```tsx
<button aria-label="Settings">
  <Settings size={20} />
</button>

<button aria-label={isMuted ? "Unmute" : "Mute"}>
  {isMuted ? <MicOff /> : <Mic />}
</button>
```

---

## Performance Optimization

### Animation Performance

- Use `transform` and `opacity` for smooth 60fps
- Hardware acceleration with `will-change` on active animations
- Cleanup intervals on component unmount

```tsx
useEffect(() => {
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, []);
```

### SVG Optimization

- Filters applied conditionally based on state
- Segment opacity calculated with Math.sin for smooth gradients
- Rotation updates at 50ms for smooth motion

---

## Integration with Existing Code

### WebSocket Integration

The component maintains compatibility with existing call API:

```tsx
const { session_id, ws_url, ephemeral_token } = await callApi.initiate();
```

### State Management

Easily integrate with existing state management:

```tsx
// Redux
const dispatch = useDispatch();
dispatch(setCallState('active'));

// Context
const { updateCallStatus } = useCallContext();
updateCallStatus('active');
```

---

## Testing

### Component States

Test all 4 call states:

```tsx
import { RadialVisualization } from './RadialVisualization';

// Idle state
<RadialVisualization status="idle" />

// Active with duration
<RadialVisualization status="active" duration={125} />
```

### Interaction Testing

```tsx
// Test call button
const callButton = screen.getByRole('button', { name: /call/i });
fireEvent.click(callButton);
expect(mockStartCall).toHaveBeenCalled();

// Test mute toggle
const muteButton = screen.getByRole('button', { name: /mute/i });
fireEvent.click(muteButton);
expect(isMuted).toBe(true);
```

---

## Browser Compatibility

Tested and optimized for:

- **Chrome 90+** ✓
- **Firefox 88+** ✓
- **Safari 14+** ✓
- **Edge 90+** ✓

### CSS Features Used

- CSS Variables
- Backdrop filter
- SVG filters
- CSS Grid/Flexbox
- CSS animations

---

## Troubleshooting

### Issue: Animations not smooth

**Solution:** Ensure hardware acceleration:

```css
.radial-container {
  transform: translateZ(0);
  will-change: transform;
}
```

### Issue: Colors don't match design

**Solution:** Clear Tailwind cache:

```bash
npm run build
# or
rm -rf .cache
```

### Issue: SVG not rendering

**Solution:** Check viewBox and SVG dimensions:

```tsx
<svg width="400" height="400" viewBox="0 0 400 400">
```

---

## Production Checklist

- [ ] Remove console.logs
- [ ] Add error boundaries
- [ ] Implement loading states
- [ ] Add analytics tracking
- [ ] Test all breakpoints
- [ ] Verify accessibility
- [ ] Optimize bundle size
- [ ] Add E2E tests
- [ ] Document API integration
- [ ] Setup CI/CD pipeline

---

## Next Steps

1. **Test the implementation:**
   ```bash
   npm run dev
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Integrate with backend:**
   - Update WebSocket URLs
   - Add authentication
   - Handle reconnection logic

4. **Enhance features:**
   - Add conversation history
   - Implement message attachments
   - Add user presence indicators
   - Create notification system

---

## Support

For questions or issues:
- Review DESIGN_SYSTEM.md for design guidelines
- Check component prop types for usage
- Refer to tokens.ts for design values

---

*Implementation Guide v1.0 - PLDT Enterprise Communication Dashboard*
