Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile('C:\Users\HP\Desktop\dev\CureHealth\frontend\src\assets\puremed-heart-crop.png')
$out = New-Object System.Drawing.Bitmap($src.Width, $src.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Background color in cropped heart is around R: 140-165, G: 160-180, B: 245-255
# The heart itself is darker blue/indigo: R: 30-100, G: 40-120, B: 110-190
for ($y = 0; $y -lt $src.Height; $y++) {
    for ($x = 0; $x -lt $src.Width; $x++) {
        $pixel = $src.GetPixel($x, $y)
        
        # Check difference from typical periwinkle background
        # Bg is high blue (~250), moderate green (~170), moderate red (~150)
        # Difference from background color:
        $dist = [Math]::Sqrt([Math]::Pow($pixel.R - 150, 2) + [Math]::Pow($pixel.G - 170, 2) + [Math]::Pow($pixel.B - 253, 2))
        
        if ($dist -lt 35) {
            # Completely background
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($dist -lt 70) {
            # Feathered edge
            $alpha = [int](($dist - 35) / 35.0 * 255)
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $pixel.G, $pixel.B))
        } else {
            $out.SetPixel($x, $y, $pixel)
        }
    }
}

$out.Save('C:\Users\HP\Desktop\dev\CureHealth\frontend\src\assets\puremed-heart.png', [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose()
$src.Dispose()
Write-Output "Transparent puremed-heart.png created!"
