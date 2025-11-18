# 🚀 Quick Start - Ad Rotation System

## What Was Done ✅

Your ad system now has **THREE zones**:

1. **TOP LEFT** - Rotating insurance ads (NEW!)
2. **TOP RIGHT** - Static insurance ad (existing)
3. **BOTTOM** - Scrolling pharmacy ticker (existing)

## The Top Left Ad Box

### Current Rotation:
```
ad.PNG → insurance.png → ad.PNG → insurance.png → ...
(5 sec)    (5 sec)       (5 sec)    (5 sec)
```

### How to Add More Ads:

**Step 1**: Add your image to the ads folder
```
src/assets/ads/your-new-ad.png
```

**Step 2**: Edit the component file
Open: `src/app/components/ad-banner/ad-banner.component.ts`

Find the `setupInsuranceAds()` method and add your ad:

```typescript
private setupInsuranceAds() {
  this.insuranceAds = [
    {
      id: 'insurance-1',
      imageUrl: 'assets/ads/ad.PNG',
      altText: 'Insurance Company Ad',
      type: 'left',
      duration: 5000
    },
    {
      id: 'insurance-2',
      imageUrl: 'assets/ads/insurance.png',
      altText: 'Libya Insurance',
      type: 'left',
      duration: 5000
    },
    // 👇 ADD NEW ADS HERE 👇
    {
      id: 'insurance-3',
      imageUrl: 'assets/ads/your-new-ad.png',
      altText: 'Your Company Name',
      type: 'left',
      duration: 5000
    }
  ];
}
```

**Step 3**: Save and the app will auto-reload!

## Change Rotation Speed

To make ads rotate faster or slower, find this line:

```typescript
private startInsuranceRotation() {
  this.intervalId = setInterval(() => {
    // ... rotation code ...
  }, 5000); // 👈 Change this number (in milliseconds)
}
```

**Examples:**
- 3 seconds = 3000
- 5 seconds = 5000 (current)
- 10 seconds = 10000

## Testing It

1. Start your development server:
```bash
npm start
```

2. Open your browser to `http://localhost:4200`

3. Watch the top left corner - you should see the ad changing every 5 seconds!

## Troubleshooting

### Ad not showing?
- Check the file name matches exactly (case-sensitive!)
- Make sure the file is in `src/assets/ads/`
- Check browser console for errors (F12)

### Ad showing but not rotating?
- Check the browser console for JavaScript errors
- Make sure you added the ad to the `insuranceAds` array
- Verify the component is properly initialized

### Image not loading?
- File path must be `assets/ads/filename.png` (no leading slash)
- Check file extension matches (PNG vs png)
- Clear browser cache (Ctrl + Shift + R)

## File Locations

```
project/
├── src/
│   ├── assets/
│   │   └── ads/
│   │       ├── ad.PNG           ← Your main insurance ad
│   │       ├── insurance.png    ← Second insurance ad
│   │       ├── libya-pharm.png  (ticker)
│   │       ├── alqalaa.png      (ticker)
│   │       ├── pharmalibya.png  (ticker)
│   │       └── alafia.png       (ticker)
│   │
│   └── app/
│       └── components/
│           └── ad-banner/
│               ├── ad-banner.component.ts    ← Edit this to add ads
│               └── ad-banner.component.scss  ← Styling
│
└── AD-ROTATION-SETUP.md         ← Full documentation
```

## What's Different from Before?

**BEFORE:**
- Only right side ad box
- Only bottom ticker

**NOW:**
- ✅ Left side ad box (rotating)
- ✅ Right side ad box (static)
- ✅ Bottom ticker (scrolling)

## Current Ad Images

Your `ad.PNG` file is already in the assets folder and will be displayed in the top left corner, rotating with `insurance.png`.

---

🎉 **That's it! Your rotating ad system is ready!**

Need to add more ads? Just follow **Step 1-3** above.
