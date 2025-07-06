# Script para generar iconos PWA
# Este es un template - reemplazar con iconos reales

# Tamaños requeridos para iOS
# 57x57, 60x60, 72x72, 76x76, 114x114, 120x120, 144x144, 152x152, 180x180

# Crear SVG base
$iconSvg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="90" fill="url(#grad)"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="white">🚗</text>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">Nueva Nave</text>
</svg>
"@

# Guardar icono base
$iconSvg | Out-File -FilePath "src/assets/icons/icon-base.svg" -Encoding UTF8

Write-Host "✅ Template de iconos PWA creado en src/assets/icons/"
Write-Host ""
Write-Host "📋 Tamaños de iconos necesarios para iOS:"
Write-Host "   - 57x57   (iPhone original)"
Write-Host "   - 60x60   (iPhone @2x)"
Write-Host "   - 72x72   (iPad)"
Write-Host "   - 76x76   (iPad)"
Write-Host "   - 114x114 (iPhone @2x)"
Write-Host "   - 120x120 (iPhone @3x)"
Write-Host "   - 144x144 (iPad @2x)"
Write-Host "   - 152x152 (iPad @2x)"
Write-Host "   - 180x180 (iPhone @3x)"
Write-Host ""
Write-Host "🔧 Para generar los iconos reales:"
Write-Host "   1. Usa el archivo icon-base.svg como base"
Write-Host "   2. Convierte a PNG en los tamaños necesarios"
Write-Host "   3. Usa herramientas como ImageMagick, GIMP, o servicios online"
Write-Host ""
Write-Host "💡 Ejemplo con ImageMagick:"
Write-Host "   magick convert icon-base.svg -resize 180x180 apple-touch-icon-180x180.png"
