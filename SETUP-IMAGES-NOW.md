# 🎯 QUICK IMAGE SETUP GUIDE

## Current Situation
Your images are located in:
```
C:\Users\SBS\Downloads\-Chifaa-Care-11-02-2025\-Chifaa-Care-11-02-2025\-Chifaa-Care-samedatabase\chifaacare-homepage\src\assets\images\
```

## What You Need To Do

### Option 1: Copy Using Windows Explorer (EASIEST)

1. Open Windows Explorer (Win + E)
2. Navigate to:
   ```
   C:\Users\SBS\Downloads\-Chifaa-Care-11-02-2025\-Chifaa-Care-11-02-2025\-Chifaa-Care-samedatabase\chifaacare-homepage\src\assets\images\
   ```

3. Copy these 5 files:
   - `470203439_122183903306115260_8407236134122793375_n.jpg` (Libya Pharm)
   - `491842433_1220689186734293_3249271571888617937_n.jpg` (Alqalaa)
   - `Alafia-logo-2.png` (ALAFIA)
   - `Pharma-Libya-Full-01-2.png` (PharmaLibya)
   - `17047819323389.png` (Libya Insurance)

4. Paste them into:
   ```
   C:\Users\SBS\Downloads\-Chifaa-Care-11-02-2025\-Chifaa-Care-11-02-2025\-Chifaa-Care-samedatabase\src\assets\ads\
   ```

5. Rename the files:
   - `470203439_122183903306115260_8407236134122793375_n.jpg` → `libya-pharm.png`
   - `491842433_1220689186734293_3249271571888617937_n.jpg` → `alqalaa.png`
   - `Alafia-logo-2.png` → `alafia.png`
   - `Pharma-Libya-Full-01-2.png` → `pharmalibya.png`
   - `17047819323389.png` → `insurance.png`

### Option 2: Use Command Prompt (FAST)

1. Open Command Prompt (Win + R, type `cmd`, press Enter)
2. Copy and paste these commands:

```batch
cd C:\Users\SBS\Downloads\-Chifaa-Care-11-02-2025\-Chifaa-Care-11-02-2025\-Chifaa-Care-samedatabase

copy "chifaacare-homepage\src\assets\images\470203439_122183903306115260_8407236134122793375_n.jpg" "src\assets\ads\libya-pharm.png"

copy "chifaacare-homepage\src\assets\images\491842433_1220689186734293_3249271571888617937_n.jpg" "src\assets\ads\alqalaa.png"

copy "chifaacare-homepage\src\assets\images\Alafia-logo-2.png" "src\assets\ads\alafia.png"

copy "chifaacare-homepage\src\assets\images\Pharma-Libya-Full-01-2.png" "src\assets\ads\pharmalibya.png"

copy "chifaacare-homepage\src\assets\images\17047819323389.png" "src\assets\ads\insurance.png"
```

3. Press Enter after pasting

### Option 3: Use PowerShell Script

Save this as `copy-ad-images.ps1` and run it:

```powershell
$sourceDir = "C:\Users\SBS\Downloads\-Chifaa-Care-11-02-2025\-Chifaa-Care-11-02-2025\-Chifaa-Care-samedatabase\chifaacare-homepage\src\assets\images"
$destDir = "C:\Users\SBS\Downloads\-Chifaa-Care-11-02-2025\-Chifaa-Care-11-02-2025\-Chifaa-Care-samedatabase\src\assets\ads"

# Create destination folder if it doesn't exist
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir
}

# Copy and rename files
Copy-Item "$sourceDir\470203439_122183903306115260_8407236134122793375_n.jpg" "$destDir\libya-pharm.png"
Copy-Item "$sourceDir\491842433_1220689186734293_3249271571888617937_n.jpg" "$destDir\alqalaa.png"
Copy-Item "$sourceDir\Alafia-logo-2.png" "$destDir\alafia.png"
Copy-Item "$sourceDir\Pharma-Libya-Full-01-2.png" "$destDir\pharmalibya.png"
Copy-Item "$sourceDir\17047819323389.png" "$destDir\insurance.png"

Write-Host "✅ All images copied successfully!"
Write-Host "Location: $destDir"
```

## Verify Setup

After copying, check that you have these files:
```
src/assets/ads/
├── libya-pharm.png
├── alqalaa.png
├── alafia.png
├── pharmalibya.png
└── insurance.png
```

## Run Your Application

```bash
cd C:\Users\SBS\Downloads\-Chifaa-Care-11-02-2025\-Chifaa-Care-11-02-2025\-Chifaa-Care-samedatabase
ng serve
```

## Expected Result

✅ Left banner: Animates through pharmacy logos (libya-pharm → alqalaa → alafia → pharmalibya)
✅ Right banner: Static Libya Insurance logo
✅ Both: Fixed position, stay visible when scrolling
✅ Animation: 2 seconds per image, smooth fade transitions

## Troubleshooting

### Images not showing?
Run this command to check if files exist:
```batch
dir "src\assets\ads"
```

You should see all 5 PNG files listed.

### Wrong images showing?
- Clear browser cache (Ctrl + Shift + R)
- Check console for errors (F12)
- Verify file names match exactly (case-sensitive)

## File Size Note
Note: The JPG files will be copied as PNG. Windows will handle this automatically.
If you want to convert them properly to PNG format, you can use an image editor or online converter.

---

**Ready? Choose Option 1 or Option 2 and your ad banners will be live!** 🚀
