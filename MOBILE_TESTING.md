# 📱 Mobile Testing Guide

## Testing Mobile Version on Desktop/Laptop

### Method 1: URL Parameter (Easiest)
Add `?mobile=true` to your URL:
```
http://localhost:5173/?mobile=true
```

This forces the mobile view regardless of screen size.

### Method 2: Browser DevTools (Most Realistic)

#### Chrome/Edge:
1. Press `F12` or right-click → "Inspect"
2. Click the device toggle icon (📱) or press `Ctrl+Shift+M`
3. Select a device from dropdown (iPhone, Pixel, etc.)
4. Refresh the page

#### Firefox:
1. Press `F12` or right-click → "Inspect Element"
2. Click "Responsive Design Mode" icon or press `Ctrl+Shift+M`
3. Select device preset or set custom dimensions
4. Refresh the page

#### Safari:
1. Enable Developer menu: Safari → Preferences → Advanced → "Show Develop menu"
2. Develop → Enter Responsive Design Mode
3. Select device or set dimensions
4. Refresh the page

### Method 3: Resize Browser Window
Simply resize your browser window to less than 768px wide.

### Method 4: Browser Extensions
- **Mobile View Switcher** (Chrome)
- **User-Agent Switcher** (Firefox)

## Testing Touch Interactions

In DevTools device mode:
- **Single tap** = Click
- **Long press** = Right-click (usually)
- **Pinch zoom** = Hold `Shift` + scroll wheel (Chrome)
- **Pan** = Click and drag

## Testing Different Devices

Common viewport sizes:
- iPhone SE: 375×667
- iPhone 12/13: 390×844
- iPhone 14 Pro Max: 430×932
- Samsung Galaxy S20: 360×800
- iPad Mini: 768×1024

## Quick Toggle Script

Add this to browser console for quick switching:
```javascript
// Toggle mobile view
window.location.href = window.location.pathname + '?mobile=' + (window.innerWidth > 768);
```

## Debugging Tips

1. **Check mobile detection**:
   ```javascript
   console.log('Is mobile:', window.innerWidth < 768);
   ```

2. **Test orientation**:
   - In DevTools, click rotate icon to test landscape/portrait

3. **Performance**:
   - Enable CPU throttling in DevTools to simulate slower devices

4. **Touch events**:
   - DevTools shows touch points when in device mode

## Live Testing

To test on actual mobile device:
1. Make sure laptop and phone are on same network
2. Find laptop's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. On phone, visit: `http://[laptop-ip]:5173`
4. Add `?mobile=true` if needed