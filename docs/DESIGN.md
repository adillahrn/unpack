# 🎒 UNPACK — Design System

> This document defines the visual and interaction guidelines for UNPACK.
> All contributors and AI coding assistants should follow these rules.

---

## Brand

- **Name:** UNPACK
- **Tagline:** "You don't have to carry it all at once."
- **Tone:** Cozy, playful, warm, student-friendly
- **Personality:** Supportive friend, not a therapist

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Cream | `#FFF8F0` | Background |
| Peach | `#FFD6A5` | Secondary accents, hover states |
| Coral | `#FF6B6B` | Primary accent, CTAs, high urgency |
| Sage | `#95D5B2` | Success, completed, low urgency |
| Sky | `#89CFF0` | Info, links |
| Bark | `#5C4033` | Secondary text |
| Midnight | `#2C1810` | Primary text |

### Urgency Colors
- 🔴 High → Coral (`#FF6B6B`)
- 🟡 Medium → Peach (`#FFD6A5`)
- 🟢 Low → Sage (`#95D5B2`)

> **Accessibility:** Never use color alone to convey urgency. Always pair with labels or icons.

---

## Typography

- **Primary Font:** Nunito (Google Fonts)
- **Weights:** 400 (body), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- **Headings:** Nunito 700–800
- **Body:** Nunito 400–500
- **Buttons:** Nunito 600

---

## Spacing & Layout

- Use Tailwind spacing scale (4, 8, 12, 16, 24, 32, 48, 64)
- Max content width: `max-w-2xl` (672px)
- Card padding: `p-4` to `p-6`
- Section gaps: `gap-6` to `gap-8`

---

## Border Radius

| Element | Radius |
|---------|--------|
| Buttons | `rounded-2xl` (16px) |
| Cards | `rounded-2xl` to `rounded-3xl` |
| Inputs | `rounded-xl` (12px) |
| Modals | `rounded-3xl` (24px) |
| Avatars | `rounded-full` |

---

## Shadows

- Cards: `shadow-sm` (default), `shadow-md` (hover)
- Modals: `shadow-xl`
- Buttons: `shadow-md` (primary), `shadow-sm` (secondary)

---

## Animations

| Name | Usage | Duration |
|------|-------|----------|
| `float` | Backpack, Pax idle | 3s ease-in-out infinite |
| `bounce-gentle` | Pax states | 2s ease-in-out infinite |
| `fade-in` | Page transitions, state changes | 0.5s ease-out |
| `slide-up` | Cards appearing | 0.6s ease-out |

Keep animations subtle. They should feel cozy, not distracting.

---

## Pax — Mascot 🐻

Pax is UNPACK's friendly mascot. Currently represented as emoji with plans for illustrated versions.

### States

| State | Emoji | When |
|-------|-------|------|
| Idle | 🐻 | Default, browsing |
| Thinking | 🤔 | Loading, processing |
| Encouraging | 💪 | Timer, Start Here |
| Happy | 😊 | Task completed, success |
| Relieved | 😌 | Bag emptied, progress |

### Guidelines
- Pax appears on most screens
- Pax reacts to user actions
- Pax never says anything clinical or diagnostic
- Pax speaks in short, warm phrases

---

## Visual Elements

- 🎒 **Backpack** — Main visual metaphor for mental load
- **Baggage Cards** — Rounded cards with category icon and urgency indicator
- **Doodles** — Light decorative elements (future)
- **Sticker-like elements** — Badges, achievements (future)

---

## Component Guidelines

### Buttons
- Primary: Coral bg, white text, rounded-2xl
- Secondary: Peach bg, bark text, rounded-2xl
- Ghost: Transparent, bark text, rounded-2xl
- Always have clear, descriptive labels
- Include loading state with spinner

### Cards
- White or light background
- Rounded corners (2xl–3xl)
- Subtle shadow
- Category indicator on left border

### Inputs
- Cream/white background
- Peach border
- Coral focus ring
- Clear placeholder text

### Navigation
- Bottom nav on mobile
- Top nav on desktop
- Icon + label for each item
- Active state: coral color

---

## UX States

Every feature MUST include these states:

### Loading
- Show Pax (thinking state)
- "Pax is unpacking..."

### Empty
- Show Pax (happy state)
- "Your bag is empty 🎒"
- "Nothing to carry right now."

### Error
- Show Pax (encouraging state)
- "Pax couldn't unpack that right now."
- "Your thoughts are still here."
- Retry button

### Success
- Show Pax (happy state)
- "✨ Unpacked!"
- Celebration animation

---

## Accessibility

- ✅ Responsive (mobile-first)
- ✅ Keyboard-friendly (all interactive elements focusable)
- ✅ Readable font (Nunito, 16px base)
- ✅ Sufficient contrast (WCAG AA minimum)
- ✅ Don't use color alone to convey urgency
- ✅ Buttons have clear labels
- ✅ Form inputs have associated labels
- ✅ Images/icons have alt text or aria-labels

---

## Privacy

- 🔒 Gemini API key only on server/Edge Function (never exposed to client)
- 🔒 Supabase RLS active on all tables
- 🔒 Don't store unnecessary data
- 🔒 Explain data usage simply to users
