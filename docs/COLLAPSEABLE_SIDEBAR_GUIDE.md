# Collapseable Sidebar Feature

## Overview

The dashboard sidebar now supports collapsing/expanding on desktop screens for a more flexible workspace.

## Visual States

### Expanded Sidebar (Default: 264px)

```
┌──────────────────────────────────────┐
│  👤 User Avatar                      │
│  John Doe                            │
│  john@example.com                    │
│  [CREATOR]                           │
├──────────────────────────────────────┤
│  🏠 Dashboard                        │
│  👤 Profile                          │
│  🎥 Creator Studio                   │
│  📊 Analytics                        │
│  💰 Earnings                         │
│  ...                                 │
├──────────────────────────────────────┤
│  ⚙️  Settings                         │
└──────────────────────────────────────┘
```

### Collapsed Sidebar (80px)

```
┌────────┐
│   👤   │
│        │
├────────┤
│   🏠   │
│   👤   │
│   🎥   │
│   📊   │
│   💰   │
│   ...  │
├────────┤
│   ⚙️   │
└────────┘
```

## Toggle Button

The toggle button appears on the right edge of the sidebar:

**Position**: Absolute, right: -12px, top: 32px
**Appearance**:

- White circular button (24px × 24px)
- Border with shadow
- Chevron icon (left when expanded, right when collapsed)
- Hover effect with gray background

```tsx
// Expanded state
<button>
  <ChevronLeft /> // Icon pointing left
</button>

// Collapsed state
<button>
  <ChevronRight /> // Icon pointing right
</button>
```

## Features in Collapsed State

### 1. User Profile

- Shows only avatar (40px × 40px)
- Centered in sidebar
- No text information
- No role badge

### 2. Navigation Items

- Icons only (20px × 20px)
- Centered in available width
- Tooltips on hover showing full label
- Active state still highlighted
- Same hover effects

### 3. Footer Settings

- Settings icon only
- Centered
- Tooltip on hover

## Implementation Details

### Props

```typescript
interface DashboardSidebarProps {
  userRole: UserRole;
  userName: string | null;
  userEmail: string;
  avatarUrl: string | null;
  isCollapsed: boolean; // New prop
  onToggleCollapse: () => void; // New prop
}
```

### State Management

```typescript
// In DashboardLayout component
const [isCollapsed, setIsCollapsed] = useState(false);

const toggleCollapse = () => {
  setIsCollapsed(!isCollapsed);
};
```

### CSS Classes

```typescript
// Sidebar width
className={cn(
  "transition-all duration-300",
  isCollapsed ? "lg:w-20" : "lg:w-64"
)}

// Content padding
className={cn(
  "transition-all duration-300",
  isCollapsed ? "lg:pl-20" : "lg:pl-64"
)}
```

## Accessibility

- **ARIA Label**: Toggle button has descriptive label
- **Keyboard Support**: Button is keyboard accessible
- **Focus Management**: Proper focus states
- **Screen Readers**: Announces collapsed/expanded state

## Responsive Behavior

### Desktop (≥1024px)

- Toggle button visible
- Sidebar collapses to 80px
- Content adjusts padding automatically

### Mobile (<1024px)

- Toggle button hidden
- Always uses hamburger menu
- Sidebar always shows full width when open
- No collapsed state on mobile

## Performance

- **Smooth Transitions**: 300ms CSS transitions
- **No Layout Shift**: Content transitions smoothly
- **Optimized Rendering**: Only affected elements re-render

## Browser Support

Works on all modern browsers that support:

- CSS transitions
- Flexbox
- CSS Grid
- Tailwind CSS classes

## Usage Example

```tsx
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

<DashboardLayout
  userRole={user.role}
  userName={user.profile?.displayName}
  userEmail={user.email}
  avatarUrl={user.profile?.avatarUrl}
>
  {/* Your dashboard content */}
</DashboardLayout>;
```

## Tips

1. **First Time Users**: Sidebar starts expanded by default
2. **Icon Recognition**: Icons are consistent with expanded labels
3. **Tooltips**: Hover over icons in collapsed state to see full labels
4. **Quick Toggle**: Click the edge button to quickly expand/collapse
5. **More Space**: Collapse sidebar when viewing data-heavy dashboards

## Future Enhancements

- [ ] Remember collapse state in localStorage
- [ ] Add keyboard shortcut (Ctrl+B)
- [ ] Add animation preferences (respect prefers-reduced-motion)
- [ ] Add collapse state to user preferences API
- [ ] Tooltip positioning improvements
