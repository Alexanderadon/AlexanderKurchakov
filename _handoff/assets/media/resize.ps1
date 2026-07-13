param(
  [Parameter(Mandatory=$true)][string]$In,
  [Parameter(Mandatory=$true)][string]$Out,
  [int]$MaxW = 800,
  [double]$CropRatio = 0,
  [int]$Quality = 78
)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile((Resolve-Path $In).Path)
try {
  $scale = [Math]::Min(1.0, $MaxW / $img.Width)
  $w = [int]([Math]::Round($img.Width * $scale))
  $h = [int]([Math]::Round($img.Height * $scale))
  $targetH = $h
  if ($CropRatio -gt 0) {
    $targetH = [int][Math]::Min($h, [Math]::Round($w / $CropRatio))
  }
  $bmp = New-Object System.Drawing.Bitmap($w, $targetH)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $srcH = [int][Math]::Round($targetH / $scale)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0,0,$w,$targetH)), (New-Object System.Drawing.Rectangle(0,0,$img.Width,$srcH)), [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
  $bmp.Save($Out, $codec, $ep)
  $bmp.Dispose()
  Write-Output ("{0} -> {1} ({2}x{3}, {4} bytes)" -f (Split-Path $In -Leaf), (Split-Path $Out -Leaf), $w, $targetH, (Get-Item $Out).Length)
} finally {
  $img.Dispose()
}
