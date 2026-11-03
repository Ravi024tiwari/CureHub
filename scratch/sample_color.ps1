Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\HP\.gemini\antigravity\brain\e9020cd2-78a1-428e-b6f1-49d3a8046c24\.user_uploaded\media_1793729110668_ca0021b2.jpg')
$p1 = $img.GetPixel(40, 40)
$p2 = $img.GetPixel(150, 100)
$p3 = $img.GetPixel(240, 80)
Write-Output "Pixel 1: R=$($p1.R) G=$($p1.G) B=$($p1.B) (#$($p1.R.ToString('X2'))$($p1.G.ToString('X2'))$($p1.B.ToString('X2')))"
Write-Output "Pixel 2: R=$($p2.R) G=$($p2.G) B=$($p2.B) (#$($p2.R.ToString('X2'))$($p2.G.ToString('X2'))$($p2.B.ToString('X2')))"
Write-Output "Pixel 3: R=$($p3.R) G=$($p3.G) B=$($p3.B) (#$($p3.R.ToString('X2'))$($p3.G.ToString('X2'))$($p3.B.ToString('X2')))"
$img.Dispose()
