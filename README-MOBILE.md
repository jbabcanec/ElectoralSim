# 📱 ElectoralSim Mobile Version

This branch contains the mobile-optimized version of the Electoral Sim visualization.

## 🚀 Mobile Features

- **Full-screen map view** - Maximizes map visibility on small screens
- **Touch-optimized interactions** - Pinch-to-zoom, tap to select states
- **Bottom sheet navigation** - Swipe-up panel with tabs for Map, Info, and Timeline
- **Responsive design** - Automatically detects mobile devices
- **Simplified controls** - Mobile-friendly dropdowns and buttons

## 📲 Mobile UI Components

- `AppMobile.tsx` - Mobile-specific layout with bottom navigation
- `MapMobile.tsx` - Touch-enabled map wrapper with zoom support
- `useIsMobile.ts` - Hook for mobile detection
- Mobile CSS classes for sheets and tabs

## 🔧 Development

To work on the mobile version:
```bash
git checkout mobile-version
npm install
npm run dev
```

View in mobile mode by:
1. Using browser dev tools device emulation
2. Accessing on an actual mobile device
3. Resizing browser window below 768px width

## 🌐 Deployment

The mobile version automatically activates when viewport width < 768px.

## ↩️ Switching Back to Desktop

To return to the desktop-only version:
```bash
git checkout master
```