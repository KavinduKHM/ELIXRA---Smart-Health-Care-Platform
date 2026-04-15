param(
  [string]$BaseUrl = "http://localhost:8084"
)

$ErrorActionPreference = "Stop"

Write-Host "== Health check =="
try {
  $health = Invoke-RestMethod -Method Get -Uri "$BaseUrl/actuator/health" -TimeoutSec 10
  $health | ConvertTo-Json -Depth 10
} catch {
  Write-Host "Health check failed: $($_.Exception.Message)"
}

Write-Host "== Booking request =="
$body = @{
  patientId = 4
  doctorId = 8
  appointmentTime = "2026-04-19T10:30:00"
  durationMinutes = 30
  symptoms = "Eye pain"
} | ConvertTo-Json

try {
  $resp = Invoke-WebRequest -Method Post -Uri "$BaseUrl/api/appointments" -ContentType "application/json" -Body $body -TimeoutSec 30 -UseBasicParsing
  Write-Host "Status: $($resp.StatusCode)"
  $resp.Content
} catch {
  if ($_.Exception.Response) {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "Status: $status"
    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $sr.ReadToEnd()
  } else {
    Write-Host "Request failed: $($_.Exception.Message)"
  }
}

