Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\HP\.gemini\antigravity\brain\e9020cd2-78a1-428e-b6f1-49d3a8046c24\.user_uploaded\media_1793729110668_ca0021b2.jpg')
Write-Output "Dimensions: $($img.Width) x $($img.Height)"
$img.Dispose()
