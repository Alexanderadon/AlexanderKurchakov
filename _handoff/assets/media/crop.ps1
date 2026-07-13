param(
  [Parameter(Mandatory=$true)][string]$In,
  [Parameter(Mandatory=$true)][string]$Out,
  [int]$SrcY = 0,
  [int]$SrcH = 0,
  [int]$MaxW = 800,
  [int]$Quality = 74
)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile((Resolve-Path $In).Path)
try {
  if ($SrcH -le 0) { $SrcH = $img.Height - $SrcY }
  $SrcH = [Math]::Min($SrcH, $img.Height - $SrcY)
  $scale = [Math]::Min(1.0, $MaxW / $img.Width)
  $w = [int]([Math]::Round($img.Width * $scale))
  $h = [int]([Math]::Round($SrcH * $scale))
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0,0,$w,$h)), (New-Object System.Drawing.Rectangle(0,$SrcY,$img.Width,$SrcH)), [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
  $bmp.Save($Out, $codec, $ep)
  $bmp.Dispose()
  Write-Output ("{0} -> {1} ({2}x{3}, {4} bytes)" -f (Split-Path $In -Leaf), (Split-Path $Out -Leaf), $w, $h, (Get-Item $Out).Length)
} finally {
  $img.Dispose()
}
