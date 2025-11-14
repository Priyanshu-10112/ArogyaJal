# Send 20 Production-Ready Sensor Readings

Write-Host "Generating 20 sensor readings..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api/sensor-data"
$startTime = Get-Date
$count = 0
$success = 0

# 5 stations with 4 readings each
$stations = @(
    @{name="Ganga-Haridwar"; lat=29.9457; lon=78.1642; ph=7.2; temp=20.0; tds=120; do=8.5; turb=1.2},
    @{name="Yamuna-Delhi"; lat=28.6692; lon=77.2497; ph=7.6; temp=24.0; tds=380; do=6.0; turb=4.5},
    @{name="Godavari-Nashik"; lat=19.9975; lon=73.7898; ph=7.4; temp=22.5; tds=220; do=7.2; turb=2.8},
    @{name="Narmada-Jabalpur"; lat=23.1815; lon=79.9864; ph=8.1; temp=27.0; tds=620; do=5.2; turb=7.5},
    @{name="Kaveri-Mysore"; lat=12.2958; lon=76.6394; ph=8.6; temp=31.0; tds=880; do=4.0; turb=11.0}
)

foreach ($station in $stations) {
    Write-Host "Station: $($station.name)" -ForegroundColor Yellow
    
    for ($i = 0; $i -lt 4; $i++) {
        $count++
        $timeOffset = $count * 2
        $timestamp = $startTime.AddMinutes(-$timeOffset).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        
        $data = @{
            deviceId = $station.name
            timestamp = $timestamp
            location = @{lat = $station.lat; lon = $station.lon}
            sensors = @{
                PH = $station.ph + (Get-Random -Minimum -0.2 -Maximum 0.2)
                Temperature_C = $station.temp + (Get-Random -Minimum -1.5 -Maximum 1.5)
                TDS_ppm = [int]($station.tds + (Get-Random -Minimum -30 -Maximum 30))
                DO_mgL = $station.do + (Get-Random -Minimum -0.5 -Maximum 0.5)
                Turbidity_NTU = $station.turb + (Get-Random -Minimum -0.8 -Maximum 0.8)
            }
            battery = @{
                voltage = 3.7 + (Get-Random -Minimum -0.2 -Maximum 0.2)
                level = 75 + (Get-Random -Minimum -15 -Maximum 15)
                temperature = 25 + (Get-Random -Minimum -3 -Maximum 3)
                health = "GOOD"
                charging = ($i % 2 -eq 0)
            }
        } | ConvertTo-Json -Depth 10
        
        try {
            $response = Invoke-WebRequest -Uri $baseUrl -Method POST -ContentType "application/json" -Body $data -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                $success++
                Write-Host "  Reading $count sent" -ForegroundColor Green
            }
        } catch {
            Write-Host "  Reading $count failed" -ForegroundColor Red
        }
        
        Start-Sleep -Milliseconds 200
    }
}

Write-Host ""
Write-Host "Complete: $success / $count readings sent" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 3

# Check results
$devices = Invoke-WebRequest -Uri "http://localhost:8080/api/sensor-data/device-ids" | ConvertFrom-Json
$readings = Invoke-WebRequest -Uri "http://localhost:8080/api/sensor-data/all-readings" | ConvertFrom-Json
$alerts = Invoke-WebRequest -Uri "http://localhost:8080/api/alerts" | ConvertFrom-Json

Write-Host "System Status:" -ForegroundColor Cyan
Write-Host "  Devices: $($devices.count)" -ForegroundColor White
Write-Host "  Readings: $($readings.Count)" -ForegroundColor White
Write-Host "  Alerts: $($alerts.Count)" -ForegroundColor White
Write-Host ""
Write-Host "Production demo data ready!" -ForegroundColor Green
