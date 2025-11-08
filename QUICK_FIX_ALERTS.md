# 🚨 Quick Fix: Alerts Page

## The Issue
Backend error: `No static resource api/alerts/statistics`

## The Cause
AlertController.java was just created and needs to be compiled.

## The Fix (30 seconds)

### 1. Stop Backend
Press `Ctrl+C` in the terminal running the backend

### 2. Restart Backend
```powershell
cd backend
./mvnw clean spring-boot:run
```

### 3. Wait for Success
Look for: `Started ArogyajalBackendApplication`

### 4. Create Test Alerts
```powershell
.\test-alerts.ps1
```

### 5. View Alerts
Open: `http://localhost:3000/alerts`

## Done! ✅

You should now see:
- Statistics dashboard with counts
- 3 test alerts listed
- Filters working
- Acknowledge/Resolve buttons working

---

**Need help?** Run: `.\fix-alerts-backend.ps1`
