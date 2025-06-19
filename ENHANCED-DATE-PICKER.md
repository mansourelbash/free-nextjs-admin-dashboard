# Enhanced Jordanian Date Picker

## Features

### Visual Styling Differences:

1. **Weekends (Friday & Saturday)**
   - Gray background color (`#f3f4f6`)
   - Muted text color
   - No hover effects
   - Completely disabled (no pointer events)

2. **Jordanian Public Holidays**
   - Beautiful yellow/orange gradient background
   - Golden border with subtle shadow
   - **Interactive tooltips** showing holiday names
   - Hover effects with scale animation
   - Still disabled for selection but visually engaging

### Holiday Tooltips:

When you hover over a holiday date, you'll see a beautiful tooltip showing:
- Holiday name (e.g., "Eid al-Fitr Day 1", "Independence Day")
- Smooth fade-in/out animation
- Dark background with white text
- Arrow pointing to the date
- Proper z-index layering

### 2025 Jordanian Holidays Included:

- New Year's Day (Jan 1)
- Epiphany (Jan 6)
- Prophet's Birthday/Mawlid (Jan 14)
- Arab League Day (Mar 22)
- Eid al-Fitr (Mar 30-Apr 1)
- Good Friday & Easter Saturday (Apr 18-19)
- Labor Day (May 1)
- Independence Day (May 25)
- Eid al-Adha (Jun 6-9)
- Islamic New Year/Hijri (Jun 26)
- Christmas Day (Dec 25)

### Technical Implementation:

- Uses Flatpickr with custom `onDayCreate` callback
- Differentiates between weekends and holidays
- Dynamic tooltip creation with vanilla JavaScript
- CSS-in-JS styling with dark mode support
- Proper accessibility attributes
- Prevents selection while allowing visual feedback

### Usage:

```tsx
<JordanianDatePicker
  id="leave-start-date"
  label="Start Date"
  placeholder="Select start date"
  onChange={(selectedDates) => {
    // Only working days can be selected
    console.log('Selected working day:', selectedDates[0]);
  }}
/>
```

The date picker now provides a much better user experience with clear visual distinctions between different types of non-working days and helpful tooltips for holidays!
