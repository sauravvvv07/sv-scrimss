# SV Scrims Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from competitive gaming platforms (Faceit, Challengermode, ESEA) combined with modern mobile-first dashboard patterns. This platform prioritizes **functional efficiency with gaming energy** - clear data hierarchy, fast interactions, and mobile-optimized layouts for the 90%+ mobile user base.

## Core Design Principles

1. **Mobile-First Dominance**: Every component designed for thumb-reach and one-handed operation
2. **Information Clarity**: Stats, transactions, and scrim details must be instantly scannable
3. **Streamlined Payment Flow**: Zero friction in UPI payment journey
4. **Real-time Responsiveness**: Chat and updates feel immediate and live

---

## Typography System

### Font Families
- **Primary**: Inter (via Google Fonts CDN) - exceptional mobile readability
- **Accent/Stats**: JetBrains Mono - for player IDs, UTR codes, numerical stats

### Type Scale (Mobile-First)

**Headings:**
- H1 (Page Titles): `text-2xl md:text-4xl font-bold tracking-tight`
- H2 (Section Headers): `text-xl md:text-2xl font-semibold`
- H3 (Card Titles): `text-lg md:text-xl font-semibold`

**Body:**
- Primary: `text-base leading-relaxed`
- Secondary/Meta: `text-sm`
- Small Print: `text-xs`

**Stats/Numbers:**
- Large Stats: `text-3xl md:text-5xl font-bold font-mono`
- Inline Stats: `text-lg font-mono font-semibold`

---

## Layout System

### Spacing Primitives
**Core Units**: Use Tailwind units of **2, 4, 6, 8, 12, 16**

- Component padding: `p-4 md:p-6`
- Section spacing: `py-8 md:py-12`
- Card gaps: `gap-4`
- Element margins: `mb-2, mb-4, mb-6`
- Button padding: `px-6 py-3`

### Container Strategy
- **Max Width**: `max-w-7xl mx-auto px-4` for main content
- **Dashboard Grids**: Single column mobile, `md:grid-cols-2 lg:grid-cols-3` desktop
- **Form Width**: `max-w-md mx-auto` for login/signup
- **Modal Width**: `max-w-lg` for payment modals

### Viewport & Sections
- No forced 100vh constraints
- Natural content flow with consistent section padding
- Mobile: `py-8 px-4`
- Desktop: `py-12 px-6`

---

## Component Library

### Navigation
**Mobile Bottom Tab Bar** (Primary Navigation):
- Fixed position at bottom
- 4-5 main tabs: Home, Scrims, Wallet, Teammates, Profile
- Icons from Heroicons (outline for inactive, solid for active)
- `h-16` with safe area padding
- Large tap targets (min 44x44px)

**Desktop Header**:
- Horizontal nav with logo left, menu items center, profile/wallet right
- Sticky positioning `sticky top-0 z-50`
- `h-16 px-6`

### Cards

**Scrim Card**:
```
- Compact mobile card with clear visual hierarchy
- Top: Match type badge + Map name (text-sm font-semibold)
- Middle: Entry fee (text-2xl font-bold) + Prize pool (text-lg)
- Bottom row: Date/Time | Spots remaining
- Footer: Register button (full width on mobile)
- Padding: p-4, rounded-lg
```

**Stats Card**:
```
- Icon + Label + Large Number layout
- Icon: w-10 h-10 rounded-full with padding
- Number: text-3xl font-bold font-mono
- Label: text-sm below number
- Minimal padding: p-4
```

**Transaction Card**:
```
- Left: Type icon + Amount (font-mono)
- Center: Status badge + timestamp
- Right: View details chevron
- Horizontal layout with space-between
- p-3, border-b for list view
```

### Forms

**Input Fields** (Consistent across all forms):
```
- Label: text-sm font-medium mb-1
- Input: w-full px-4 py-3 rounded-lg text-base
- Focus state: 2px border treatment
- Error text: text-xs text-red-600 mt-1
- Mobile-optimized input types (tel for phone, email, etc.)
```

**Buttons**:
- Primary CTA: `w-full md:w-auto px-8 py-3 rounded-lg font-semibold text-base`
- Secondary: Similar size with border variant
- Icon buttons: `w-10 h-10 rounded-full` for chat/actions
- Disabled state: `opacity-50 cursor-not-allowed`

### Payment Modal (Critical Component)

**Structure**:
```
- Full-screen on mobile, centered modal on desktop (max-w-lg)
- Header: Scrim name + Entry fee (text-2xl font-bold)
- QR Section: Centered QR image (w-64 h-64 mx-auto)
- UPI ID Display: Large text (text-lg font-mono) with copy button
- UTR Input: Prominent text input OR screenshot upload
- Visual separation with border-t my-4
- Bottom: Confirm payment button (sticky on mobile)
- Padding: p-6
```

### Dashboard Layouts

**Player Dashboard**:
- Mobile: Vertical stack of stat cards
- Desktop: 2-column grid `md:grid-cols-2 lg:grid-cols-4`
- Top section: Wallet balance (prominent, text-3xl)
- Stats grid below with consistent card sizing
- Transaction history: List view with infinite scroll

**Admin Panel**:
- Sidebar navigation (collapsible on mobile, drawer pattern)
- Main content area: Tables with responsive overflow
- Action buttons: Always visible, sticky where needed
- Bulk actions: Checkbox + floating action bar on mobile

### Real-time Chat

**Chat Interface**:
```
- Message list: flex-col-reverse for bottom-up
- Message bubbles: max-w-xs rounded-2xl p-3
- Own messages: ml-auto
- Other messages: mr-auto
- Input bar: Fixed bottom, h-14, with send button
- Bad word indicator: Inline warning icon
- Report button: Long-press on mobile, hover menu desktop
```

### Data Tables (Leaderboards, Transactions)

**Mobile Pattern**:
- Card-based layout (not traditional table)
- Each row = compact card with key info
- Tap to expand for full details

**Desktop Pattern**:
- Traditional table with fixed header
- Sticky header on scroll
- Sortable columns with arrow indicators
- Minimum column widths for readability

### Badges & Status Indicators

**Consistent Badge System**:
- Rounded-full px-3 py-1 text-xs font-semibold
- Payment status: verified, pending, rejected
- Scrim status: open, full, live, completed
- Player status: online, offline, banned

---

## Special Components

### Room ID Reveal (10-min countdown)
- Large countdown timer: text-4xl font-mono font-bold
- Revealed credentials in copyable format
- Clear visual transition from countdown to reveal

### Find Teammates Posts
- Profile card format with avatar placeholder
- Stats in grid: `grid-cols-2 gap-2 text-sm`
- Chat button: Prominent, opens real-time chat
- Compact on mobile, expanded on desktop

### Legal Pages
- Single column `max-w-3xl mx-auto`
- Clear heading hierarchy (H2, H3, H4)
- Generous line-height `leading-relaxed`
- Section spacing: `space-y-6`

---

## Images

### Hero Section (Landing/Home)
**Large Hero Image**: Yes
- Full-width hero showcasing BGMI gameplay/competitive scene
- Height: `h-[60vh] md:h-[70vh]`
- Image: Action shot of BGMI match or esports tournament scene
- Overlay: Gradient overlay for text readability
- Content: Centered headline + subtext + primary CTA
- CTA buttons: Backdrop blur `backdrop-blur-sm` with semi-transparent background

### Additional Images
- **Scrim Cards**: Optional thumbnail for map/mode (w-20 h-20, object-cover)
- **Player Profiles**: Avatar placeholders (w-16 h-16 rounded-full)
- **Admin Dashboard**: No images, data-focused
- **Payment Flow**: QR code image (provided by user)

---

## Mobile Optimization

### Touch Targets
- Minimum 44x44px for all interactive elements
- Generous padding around clickable areas
- Bottom-heavy layout for thumb reach

### Performance
- Lazy load leaderboard data
- Infinite scroll for transaction history
- Optimistic UI updates for real-time features

### One-Handed Patterns
- Primary actions in bottom third of screen
- FAB (Floating Action Button) for quick scrim registration
- Swipe gestures for navigation where appropriate

---

## Accessibility

- Semantic HTML throughout
- ARIA labels for icon-only buttons
- Focus states: 2px offset ring
- Form validation with clear error messaging
- Screen reader announcements for real-time updates
- Consistent tab order following visual hierarchy

---

## Icon System

**Heroicons** (via CDN) for all interface icons:
- Navigation: home, trophy, wallet, users, user-circle
- Actions: plus, pencil, trash, check, x-mark
- Status: clock, check-circle, x-circle, exclamation-triangle
- Social: chat-bubble, bell
- Use outline variant by default, solid for active states