$file = Get-Item -Path "*Grobe*.pdf"
$bytes = [System.IO.File]::ReadAllBytes($file.FullName)
$ascii = [System.Text.Encoding]::ASCII.GetString($bytes)
$streamPattern = 'stream'
$endPattern = 'endstream'
$pos = 0
while ($true) {
    $idx = $ascii.IndexOf($streamPattern, $pos)
    if ($idx -lt 0) { break }
    $start = $idx + $streamPattern.Length
    # skip possible line ending
    if ($bytes[$start] -eq 0x0D) { $start++ }
    if ($bytes[$start] -eq 0x0A) { $start++ }
    $endIdx = $ascii.IndexOf($endPattern, $start)
    if ($endIdx -lt 0) { break }
    $length = $endIdx - $start
    if ($length -gt 0) {
        $streamBytes = $bytes[$start..($endIdx-1)]
        try {
            $ms = New-Object System.IO.MemoryStream(,$streamBytes)
            $ds = New-Object System.IO.Compression.DeflateStream($ms,[System.IO.Compression.CompressionMode]::Decompress)
            $out = New-Object System.IO.MemoryStream
            $buffer = New-Object byte[] 8192
            while (($read = $ds.Read($buffer,0,$buffer.Length)) -gt 0) { $out.Write($buffer,0,$read) }
            $decoded = [System.Text.Encoding]::ASCII.GetString($out.ToArray())
            if ($decoded -match '[A-Za-z]{4,}') {
                Write-Output "--- STREAM at $idx length $length ---"
                Write-Output $decoded
                Write-Output ''
            }
        } catch {
            # ignore invalid streams
        }
    }
    $pos = $endIdx + $endPattern.Length
}
