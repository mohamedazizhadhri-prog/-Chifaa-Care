# Ad Banner Setup Instructions - SIMPLIFIED VERSION

## Overview
The ad banner system displays fixed-position advertisements on your website:
- **Left Banner**: Animated slideshow cycling through 4 pharmacy logos (pure CSS animation)
- **Right Banner**: Static Libya Insurance logo

## Quick Setup (3 Steps)

### Step 1: Save Your Images

Save the following images to `src/assets/ads/`:

1. **libya-pharm.png** - Libya Pharm pharmacy logo (ليبيا فارم - إختيارك الافضل)
2. **alqalaa.png** - Alqalaa Pharmacy logo (صيدلية القلعة)
3. **alafia.png** - ALAFIA pharmaceutical & medical equipment logo
4. **pharmalibya.png** - PharmaLibya Expo logo (فارما ليبيا)
5. **insurance.png** - Libya Insurance logo (الثامن مصنك - شركة ليبيا للتأمين)

**Expected folder structure:**
```
src/assets/ads/
├── libya-pharm.png
├── alqalaa.png
├── alafia.png
├── pharmalibya.png
└── insurance.png
```

### Step 2: Image Requirements

- **Format**: PNG or JPG (PNG recommended for logos with transparency)
- **Size**: Recommended width ~800px (will be responsive)
- **Optimization**: Keep file sizes under 200KB each for best performance
- **Aspect Ratio**: Try to keep similar aspect ratios for all pharmacy logos

### Step 3: Run Your Application

That's it! The banners are already integrated into your application. Just run:
```bash
ng serve
```

## How It Works

### Left Banner Animation
- Automatically cycles through 4 pharmacy logos
- Each logo displays for 2 seconds
- Smooth fade transition between images
- Total loop time: 8 seconds
- Infinite loop

### Right Banner
- Static display of Libya Insurance logo
- Always visible (no animation)

### Both Banners
- Slide down from top on page load
- Fixed position - stays visible when scrolling
- Hover effect - lifts up slightly
- Positioned below navbar with spacing
- Hidden on mobile devices (< 768px) to avoid clutter

## Customization

### Change Animation Speed

Edit `ad-banner.component.scss`:

```scss
// Change total loop duration (default: 8s for 4 images)
animation: imageSlideshow 8s infinite;

// Change individual image delays
&:nth-child(1) { animation-delay: 0s; }   // 1st image
&:nth-child(2) { animation-delay: 2s; }   // 2nd image  
&:nth-child(3) { animation-delay: 4s; }   // 3rd image
&:nth-child(4) { animation-delay: 6s; }   // 4th image
```

### Change Position

```scss
.ad-banner-left {
  top: calc(var(--nav-h) + 20px);  // Distance from navbar
  left: 20px;                       // Distance from left edge
}

.ad-banner-right {
  top: calc(var(--nav-h) + 20px);  // Distance from navbar
  right: 20px;                      // Distance from right edge
}
```

### Change Size

```scss
.ad-banner-left,
.ad-banner-right {
  width: clamp(180px, 15vw, 250px); // min, preferred, max
}
```

## Technical Details

- **Technology**: Pure CSS animations (no JavaScript, no external libraries)
- **Performance**: Lightweight, no impact on page load
- **Browser Support**: All modern browsers
- **Responsive**: Adapts to screen size

## Advantages of This Approach

✅ **No GIF required** - Uses individual PNG images  
✅ **Better quality** - Full resolution, no compression artifacts  
✅ **Smaller file size** - Individual PNGs are smaller than animated GIF  
✅ **Easy to update** - Just replace individual images  
✅ **Pure CSS** - No JavaScript overhead  
✅ **SEO friendly** - Each image has proper alt text  

## Alternative: Using GIF (If Preferred)

If you prefer to use an animated GIF instead:

1. Use the GIF Generator tool (see artifact)
2. Generate `pharmacy-banner.gif` from your 4 images
3. Update `ad-banner.component.ts`:

```typescript
// Replace the pharmacy-slideshow div with:
<img src="assets/ads/pharmacy-banner.gif" alt="Pharmacy Advertisement" class="ad-image" />
```

4. Save the GIF to `src/assets/ads/pharmacy-banner.gif`

## Troubleshooting

### Images not showing?
1. ✓ Check files are in `src/assets/ads/`
2. ✓ Verify exact file names match (case-sensitive)
3. ✓ Clear browser cache (Ctrl+Shift+R)
4. ✓ Check browser console for errors

### Animation not smooth?
1. ✓ Optimize image file sizes (< 200KB each)
2. ✓ Ensure images have similar dimensions
3. ✓ Check if hardware acceleration is enabled in browser

### Banners overlapping content?
1. ✓ Adjust `z-index` in SCSS
2. ✓ Modify `top` and `left`/`right` positioning
3. ✓ Check navbar height (`--nav-h` variable)

## File Locations

```
src/
├── app/
│   ├── components/
│   │   └── ad-banner/
│   │       ├── ad-banner.component.ts    ← Component code
│   │       └── ad-banner.component.scss  ← Styles & animations
│   └── app.component.ts                  ← Already integrated
└── assets/
    └── ads/                              ← PUT YOUR IMAGES HERE
        ├── libya-pharm.png
        ├── alqalaa.png
        ├── alafia.png
        ├── pharmalibya.png
        └── insurance.png
```

## Quick Checklist

- [ ] Created `src/assets/ads/` folder
- [ ] Saved all 5 images with correct names
- [ ] Optimized images (< 200KB each)
- [ ] Verified images display correctly
- [ ] Tested on different screen sizes
- [ ] Checked animation timing

## Support

Need help? Check:
- Component code: `src/app/components/ad-banner/ad-banner.component.ts`
- Styles: `src/app/components/ad-banner/ad-banner.component.scss`
- Main integration: `src/app/app.component.ts`

---

**That's it!** Your ad banners are now live on your website. The pharmacy logos will automatically cycle, and the insurance logo will stay fixed on the right side.
