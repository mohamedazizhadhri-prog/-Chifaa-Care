# Ad Rotation Setup - Top Left Banner

## ✅ Changes Made

### 1. **Added Top Left Rotating Ad Banner**
   - A new ad box appears in the top left corner (mirrors the right ad box)
   - Automatically rotates between multiple insurance company ads
   - Currently includes:
     - `ad.PNG` - Main insurance company ad
     - `insurance.png` - Libya Insurance ad

### 2. **Rotation Timing**
   - Ads change every **5 seconds** automatically
   - Smooth transition between ads
   - Continuous loop

### 3. **Location of Ads**
   - **Top Left**: Rotating insurance ads
   - **Top Right**: Static insurance ad
   - **Bottom**: News ticker with pharmacy logos

## 📁 Files Modified

### 1. `ad-banner.component.ts`
```typescript
// Added new properties
insuranceAds: AdBanner[] = [];
currentInsuranceAd: AdBanner;
currentInsuranceIndex: number;

// Added new methods
setupInsuranceAds() - Sets up the insurance ad rotation
startInsuranceRotation() - Starts the 5-second rotation timer
```

### 2. `ad-banner.component.scss`
```scss
// Added styles for left banner
.ad-banner-left {
  top: calc(var(--nav-h, 80px) + 50px);
  left: 5px;
  width: clamp(250px, 15vw, 300px);
  height: 200px;
}
```

## 🎨 How It Works

1. **On Component Init**:
   - Loads default ads
   - Sets up insurance ads array
   - Starts rotation timer

2. **Every 5 Seconds**:
   - Increments the current index
   - Updates the displayed ad
   - Loops back to first ad after last one

3. **Template Binding**:
   - Uses `currentInsuranceAd` to display the active ad
   - Angular automatically updates the image when the property changes

## 🔧 Adding More Insurance Ads

To add more rotating ads, edit the `setupInsuranceAds()` method:

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
    // Add more ads here:
    {
      id: 'insurance-3',
      imageUrl: 'assets/ads/new-insurance.png',
      altText: 'New Insurance Company',
      type: 'left',
      duration: 5000
    }
  ];
}
```

## 📱 Responsive Behavior

- **Desktop (> 768px)**: Both left and right banners visible
- **Tablet (768px - 968px)**: Banners slightly smaller
- **Mobile (< 768px)**: Both banners hidden, only ticker shows

## ⚡ Performance

- Uses lazy loading for images
- Efficient interval timer (clears on component destroy)
- No memory leaks
- Smooth transitions

## 🎯 Current Ad Images in Assets

Location: `src/assets/ads/`
- ✅ `ad.PNG` - Insurance company ad (rotating)
- ✅ `insurance.png` - Libya Insurance (rotating)
- ✅ `libya-pharm.png` - Ticker
- ✅ `alqalaa.png` - Ticker
- ✅ `pharmalibya.png` - Ticker
- ✅ `alafia.png` - Ticker

## 🚀 Next Steps

1. **Add more insurance ads**: Place PNG files in `assets/ads/` folder
2. **Update the array**: Add new entries to `setupInsuranceAds()`
3. **Adjust timing**: Change the interval (5000ms = 5 seconds)
4. **Customize size**: Modify the width/height in SCSS

## 💡 Tips

- Keep images at similar dimensions for smooth transitions
- Recommended size: 300px x 200px
- Use PNG format with transparent backgrounds if needed
- File names are case-sensitive (ad.PNG vs ad.png)

---

✨ **Your ad rotation system is now live!**
