Write-Host "🔍 Monitoring ZaloPay callback..." -ForegroundColor Yellow

# Lấy ngrok URL
try {
    $ngrokResponse = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get -TimeoutSec 5
    $ngrokUrl = $ngrokResponse.tunnels[0].public_url
    Write-Host "🌐 Ngrok URL: $ngrokUrl" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ngrok not running! Please start ngrok first." -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Make a real payment on ZaloPay" -ForegroundColor White
Write-Host "2. Check ngrok logs at: http://127.0.0.1:4040" -ForegroundColor White
Write-Host "3. Look for POST requests to /api/v1/zalopay/callback" -ForegroundColor White
Write-Host "4. Real ZaloPay callbacks will have different User-Agent" -ForegroundColor White

Write-Host "`n🔗 Ngrok Web UI: http://127.0.0.1:4040" -ForegroundColor Cyan
Write-Host "🔗 Callback URL: $ngrokUrl/api/v1/zalopay/callback" -ForegroundColor Cyan

Write-Host "`n⏳ Monitoring... (Press Ctrl+C to stop)" -ForegroundColor Green

# Monitor ngrok logs
while ($true) {
    try {
        $logs = Invoke-RestMethod -Uri "http://localhost:4040/api/requests/http" -Method Get -TimeoutSec 5
        
        foreach ($log in $logs.logs.entries) {
            if ($log.request.uri.path -eq "/api/v1/zalopay/callback" -and $log.request.method -eq "POST") {
                Write-Host "`n🎯 ZaloPay callback detected!" -ForegroundColor Green
                Write-Host "📅 Time: $($log.startedDateTime)" -ForegroundColor Cyan
                Write-Host "🌐 From: $($log.clientIPAddress)" -ForegroundColor Cyan
                Write-Host "📱 User-Agent: $($log.request.headers | Where-Object {$_.name -eq "user-agent"} | Select-Object -ExpandProperty value)" -ForegroundColor Cyan
                Write-Host "📦 Body: $($log.request.postData.text)" -ForegroundColor Gray
                Write-Host "📊 Response: $($log.response.status)" -ForegroundColor Cyan
            }
        }
        
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "❌ Error monitoring: $($_.Exception.Message)" -ForegroundColor Red
        Start-Sleep -Seconds 5
    }
} 