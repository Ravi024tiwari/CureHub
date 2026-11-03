Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile('C:\Users\HP\.gemini\antigravity\brain\e9020cd2-78a1-428e-b6f1-49d3a8046c24\.user_uploaded\media_1793729110668_ca0021b2.jpg')

# The heart is roughly located from x=270 to x=480, y=0 to y=260
# Let's crop just the heart region and save it to test
$rect = New-Object System.Drawing.Rectangle(270, 0, ($src.Width - 270), $src.Height)
$crop = $src.Clone($rect, $src.PixelFormat)
$crop.Save('c:\Users\HP\Desktop\dev\CureHealth\frontend\src\assets\puremed-heart-crop.png', [System.Drawing.Imaging.ImageFormat]::Png)
$crop.Dispose()
$src.Dispose()
Write-Output "Heart cropped successfully!"
