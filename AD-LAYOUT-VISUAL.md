# Visual Layout Guide - Ad Placement

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVIGATION BAR                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐                                    ┌──────────────┐
│              │                                    │              │
│  TOP LEFT    │        MAIN CONTENT AREA          │  TOP RIGHT   │
│   ROTATING   │                                    │   STATIC     │
│   AD BOX     │                                    │   AD BOX     │
│              │                                    │              │
│  [INSURANCE] │                                    │ [INSURANCE]  │
│    AD 1      │                                    │              │
│              │                                    │              │
│  Rotates     │                                    │              │
│  Every 5s    │                                    │              │
│              │                                    │              │
│  • ad.PNG    │                                    │              │
│  • insurance │                                    │              │
└──────────────┘                                    └──────────────┘


              Your hero section, content, etc.
              
              
              
              
┌─────────────────────────────────────────────────────────────────┐
│                    BOTTOM TICKER BANNER                         │
│  [Libya Pharm] • [Alqalaa] • [Pharma Libya] • [Alafia] • ...   │
│            ← Scrolls continuously from right to left            │
└─────────────────────────────────────────────────────────────────┘
```

## 📍 Positioning Details

### Top Left Rotating Banner
- **Position**: Fixed, Top Left
- **Distance from top**: Navigation height + 50px
- **Distance from left**: 5px
- **Size**: 250-300px width × 200px height
- **Behavior**: Rotates every 5 seconds
- **Content**: Insurance company ads

### Top Right Static Banner  
- **Position**: Fixed, Top Right
- **Distance from top**: Navigation height + 50px
- **Distance from right**: 5px
- **Size**: 250-300px width × 200px height
- **Behavior**: Static (doesn't rotate)
- **Content**: Insurance ad

### Bottom Ticker
- **Position**: Fixed, Bottom
- **Height**: 80px
- **Behavior**: Continuous horizontal scroll
- **Content**: Pharmacy logos
- **Style**: Glassmorphism effect (semi-transparent)

## 🎨 Style Features

### Ad Boxes (Left & Right)
```css
✓ White background with border-radius
✓ Box shadow for depth
✓ Hover effect (lifts up slightly)
✓ Smooth transitions
✓ Border: 2px solid #e5e7eb
```

### Bottom Ticker
```css
✓ Glassmorphism (transparent + blur)
✓ Continuous scrolling animation
✓ Hover to pause
✓ Logo hover effects (scale + lift)
```

## 📱 Responsive Behavior

### Desktop (> 1200px)
```
[LEFT AD]         CONTENT         [RIGHT AD]
─────────────────────────────────────────────
              [BOTTOM TICKER]
```

### Tablet (768px - 1200px)
```
[LEFT]         CONTENT         [RIGHT]
    (smaller)                (smaller)
─────────────────────────────────────────────
              [BOTTOM TICKER]
```

### Mobile (< 768px)
```
            CONTENT
─────────────────────────────────────────────
        [BOTTOM TICKER ONLY]
     (Left & Right ads hidden)
```

## 🎯 Rotation Sequence

### Top Left Banner Rotation:
```
Start → ad.PNG (5s) → insurance.png (5s) → ad.PNG (5s) → ...
         ↑_____________Loop back_____________↑
```

### Bottom Ticker Movement:
```
[Logo 1] [Logo 2] [Logo 3] [Logo 4] → → → (continuous)
       ↑ Scroll left infinitely ↑
```

## 🔄 Animation Timings

| Element | Animation | Duration | Type |
|---------|-----------|----------|------|
| Left Ad | Rotation | 5 seconds | Interval |
| Bottom Ticker | Scroll | 30 seconds | Continuous |
| Ad Hover | Lift | 0.3 seconds | On hover |
| Logo Hover | Scale | 0.3 seconds | On hover |

---

✨ **All three ad zones working together!**
