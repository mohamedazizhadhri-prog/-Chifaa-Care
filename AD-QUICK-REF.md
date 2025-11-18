# ⚡ QUICK REFERENCE - Ad System

## What You Have Now

```
[LEFT: 4 Pharmacy Logos] ←→ [RIGHT: 2 Insurance Ads]
        Rotating 5s              Rotating 5s
                                 (includes ad.PNG)
```

## File Locations

**Component:** `src/app/components/ad-banner/ad-banner.component.ts`
**Styles:** `src/app/components/ad-banner/ad-banner.component.scss`
**Images:** `src/assets/ads/`

## Current Ads

### Left Box (Pharmacy):
1. `libya-pharm.png`
2. `alqalaa.png`
3. `pharmalibya.png`
4. `alafia.png`

### Right Box (Insurance):
1. `ad.PNG` ✨ (Your main insurance ad)
2. `insurance.png`

## Quick Edits

### Add Pharmacy Ad (Left):
Find line ~140 in `ad-banner.component.ts`:
```typescript
private setupPharmacyAds() {
  this.pharmacyAds = [
    // ... existing ads ...
    {
      id: 'pharmacy-5',
      imageUrl: 'assets/ads/YOUR-NEW-PHARMACY.png',
      altText: 'Your Pharmacy Name',
      type: 'left',
      duration: 5000
    }
  ];
}
```

### Add Insurance Ad (Right):
Find line ~115 in `ad-banner.component.ts`:
```typescript
private setupInsuranceAds() {
  this.insuranceAds = [
    // ... existing ads ...
    {
      id: 'insurance-3',
      imageUrl: 'assets/ads/YOUR-NEW-INSURANCE.png',
      altText: 'Your Insurance Company',
      type: 'right',
      duration: 5000
    }
  ];
}
```

### Change Speed:
Lines ~175 and ~183:
```typescript
}, 5000); // ← Change this number (milliseconds)
```

## What Was Removed

❌ Bottom scrolling ticker
❌ WebSocket connection code
❌ Complex ad processing logic

## What Was Added

✅ Independent left and right rotating boxes
✅ Simple, clean implementation
✅ ad.PNG now rotates in right box
✅ Pharmacy logos now rotate in left box

## Test It

```bash
npm start
```

Watch the top left and top right corners!

---

**That's it! Simple and clean.** 🎉
