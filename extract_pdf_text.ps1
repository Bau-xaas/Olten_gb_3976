$file = Get-Item -Path "*Grobe*.pdf"
$path = $file.FullName
$bytes = [System.IO.File]::ReadAllBytes($path)
$text = [System.Text.Encoding]::ASCII.GetString($bytes)
$text -split '[^\x20-\x7E]+' | Where-Object { $_.Length -gt 30 } | Select-Object -Unique | ForEach-Object { $_ }
