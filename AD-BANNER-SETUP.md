# Ad Banner Setup Instructions

## Overview
The ad banner system displays fixed-position advertisements on your website:
- **Left Banner**: Animated GIF that cycles through pharmacy logos
- **Right Banner**: Static Libya Insurance logo

## Step-by-Step Setup

### Step 1: Generate the Animated GIF

1. Open the GIF Generator tool (created in an artifact)
2. Upload the 4 pharmacy images:
   - Libya Pharm pharmacy (صيدلية ليبيا فارم)
   - Alqalaa Pharmacy (صيدلية القلعة)
   - ALAFIA pharmaceutical & medical equipment
   - PharmaLibya Expo (فارما ليبيا)
   
3. Adjust settings:
   - **Frame Delay**: 1500ms (recommended) - Time each image displays
   - **Output Width**: 300px (recommended) - Width of the final GIF
   
4. Click "Generate GIF"
5. Download the generated GIF as `pharmacy-banner.gif`

### Step 2: Save the Insurance Image

1. Save the Libya Insurance image (الثامن مصنك - شركة ليبيا للتأمين) as `insurance-banner.png`

### Step 3: Place Images in Assets

Copy both files to the following location:
```
src/assets/ads/
├── pharmacy-banner.gif    (animated, for left side)
└── insurance-banner.png   (static, for right side)
```

## Features

### Left Banner (Animated)
- Appears with a top-to-bottom slide animation
- Loops through pharmacy logos infinitely
- Hovers effect: Lifts up slightly
- Fixed position: Stays in place when scrolling

### Right Banner (Static)
- Shows Libya Insurance logo
- Hovers effect: Lifts up slightly
- Fixed position: Stays in place when scrolling

### Responsive Design
- **Desktop**: Both banners visible
- **Tablet**: Slightly smaller banners
- **Mobile (< 768px)**: Hidden to avoid cluttering

## Technical Details

### Component Location
```
src/app/components/ad-banner/
├── ad-banner.component.ts    (TypeScript component)
└── ad-banner.component.scss  (Styles)
```

### Position Details
- Both banners are positioned below the navbar with 20px spacing
- Z-index: 999 (below navbar at 1000, above content)
- Width: Responsive, 15vw on large screens (min: 180px, max: 250px)

### Customization

To change the animation duration, edit the SCSS file:
```scss
animation: slideDownFade 1s ease-out forwards;
```

To change positioning:
```scss
.ad-banner-left {
  top: calc(var(--nav-h) + 20px);  // Adjust the 20px value
  left: 20px;                       // Adjust left margin
}

.ad-banner-right {
  top: calc(var(--nav-h) + 20px);  // Adjust the 20px value
  right: 20px;                      // Adjust right margin
}
```

## Important Notes

1. **Image Optimization**: Ensure images are optimized for web to reduce load times
2. **GIF Size**: Keep the GIF file size under 500KB for best performance
3. **Aspect Ratio**: Maintain consistent aspect ratios for better appearance
4. **Accessibility**: The images have alt text for screen readers

## Troubleshooting

### Images not showing?
1. Verify files are in `src/assets/ads/`
2. Check file names match exactly:
   - `pharmacy-banner.gif`
   - `insurance-banner.png`
3. Clear browser cache
4. Rebuild the Angular application

### Animation not working?
1. Ensure the GIF was created with proper looping enabled
2. Check browser console for errors
3. Verify the GIF file is valid

### Banners overlapping content?
1. Adjust the z-index in the SCSS file
2. Modify the positioning values
3. Check if content has a higher z-index

## File Structure
```
src/
├── app/
│   ├── components/
│   │   └── ad-banner/
│   │       ├── ad-banner.component.ts
│   │       └── ad-banner.component.scss
│   └── app.component.ts (updated to include banner)
└── assets/
    └── ads/
        ├── pharmacy-banner.gif
        └── insurance-banner.png
```

## Support

If you need to modify the banner behavior, refer to:
- Component: `src/app/components/ad-banner/ad-banner.component.ts`
- Styles: `src/app/components/ad-banner/ad-banner.component.scss`
- Main app: `src/app/app.component.ts`
