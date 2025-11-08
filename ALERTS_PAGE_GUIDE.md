# Alerts Page - Complete Guide

## Overview

The Alerts page provides a comprehensive view of all system alerts and notifications, including water quality issues, sensor problems, and symptom clusters.

## Features

### 1. **Real-time Alert Monitoring**
- View all system alerts in one place
- Auto-refresh every 10 seconds (toggleable)
- Manual refresh button
- Last updated timestamp

### 2. **Alert Statistics Dashboard**
- **Total Alerts** - All alerts in the system
- **Active** - Alerts requiring attention
- **Acknowledged** - Alerts that have been seen
- **Resolved** - Alerts that have been fixed
- **Critical** - High-priority alerts

### 3. **Powerful Filtering**
- **Status Filter:** All, Active, Acknowledged, Resolved
- **Severity Filter:** All, Critical, High, Medium, Low
- **Search:** Search by title, description, or location
- Real-time filter results

### 4. **Alert Details**
Each alert shows:
- Title and description
- Severity badge (color-coded)
- Status badge (color-coded)
- Location (if applicable)
- Sensor ID (if applicable)
- Parameter and values (for water quality alerts)
- Timestamps (triggered, acknowledged, resolved)

### 5. **Alert Actions**
- **Acknowledge:** Mark alert as seen
- **Resolve:** Mark alert as fixed
- Actions available based on current status

## Alert Types

### Water Quality Alerts
Triggered when water parameters exceed thresholds:
- **pH:** Outside 6.5-8.5 range
- **Turbidity:** Above 5 NTU
- **Conductivity:** Above 1000 μS/cm

### Sensor Offline Alerts
Triggered when sensors stop reporting

### Symptom Cluster Alerts
Triggered when multiple symptom reports occur in same location

## Severity Levels

### Critical (Red)
- Immediate action required
- Severe water quality issues
- Multiple affected users

### High (Orange)
- Urgent attention needed
- Significant parameter deviations
- Potential health risks

### Medium (Yellow)
- Moderate concern
- Parameters approaching thresholds
- Monitor closely

### Low (Green)
- Minor issues
- Informational alerts
- No immediate action needed

## Status Workflow

```
ACTIVE → ACKNOWLEDGED → RESOLVED
```

### Active
- New alert, not yet seen
- Requires attention
- Actions: Acknowledge or Resolve

### Acknowledged
- Alert has been seen
- Being worked on
- Actions: Resolve

### Resolved
- Issue has been fixed
- No further action needed
- Archived for records

## How to Use

### View Alerts

1. Navigate to `/alerts`
2. See all alerts listed with details
3. Check statistics at the top

### Filter Alerts

1. **By Status:**
   - Select from dropdown: All, Active, Acknowledged, Resolved
   
2. **By Severity:**
   - Select from dropdown: All, Critical, High, Medium, Low
   
3. **By Search:**
   - Type in search box
   - Searches title, description, location

### Acknowledge an Alert

1. Find the alert (must be ACTIVE status)
2. Click "Acknowledge" button
3. Alert status changes to ACKNOWLEDGED
4. Timestamp recorded

### Resolve an Alert

1. Find the alert (ACTIVE or ACKNOWLEDGED)
2. Click "Resolve" button
3. Alert status changes to RESOLVED
4. Timestamp recorded

### Enable Auto-refresh

1. Check the "Auto-refresh (10s)" checkbox
2. Page updates every 10 seconds automatically
3. Uncheck to disable

## API Endpoints Used

### Get Alerts
- `GET /api/alerts` - All alerts
- `GET /api/alerts/active` - Active alerts only
- `GET /api/alerts/critical` - Critical alerts only
- `GET /api/alerts/status/{status}` - Filter by status
- `GET /api/alerts/severity/{severity}` - Filter by severity

### Manage Alerts
- `POST /api/alerts/{id}/acknowledge` - Acknowledge alert
- `POST /api/alerts/{id}/resolve` - Resolve alert

### Statistics
- `GET /api/alerts/statistics` - Get alert counts

## Backend Integration

### Alert Creation

Alerts are automatically created by the backend when:

1. **Water Quality Issues Detected:**
```java
// In SensorService
if (reading.getPh() < 6.5 || reading.getPh() > 8.5) {
    alertService.createAlert(waterQualityAlert);
}
```

2. **Symptom Clusters Detected:**
```java
// In SymptomController
if (recentReports.size() >= 5) {
    alertService.createSymptomClusterAlert(location);
}
```

### Alert Storage

Alerts are stored in Firestore:
- Collection: `alerts`
- Auto-generated IDs
- Indexed by status, severity, location

## Testing

### Create Test Alert

```bash
# Send sensor data with bad pH
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "location": {"lat": 26.91, "lon": 75.78},
    "sensors": {
      "pH": 4.5,
      "turbidity_NTU": 25,
      "TDS_ppm": 450,
      "DO_mgL": 7.5,
      "temperature_C": 26.0
    }
  }'

# Alert will be created automatically
# Check alerts page to see it
```

### Verify Alerts

```bash
# Get all alerts
curl http://localhost:8080/api/alerts

# Get active alerts
curl http://localhost:8080/api/alerts/active

# Get statistics
curl http://localhost:8080/api/alerts/statistics
```

### Acknowledge Alert

```bash
curl -X POST http://localhost:8080/api/alerts/{alert-id}/acknowledge \
  -H "Content-Type: application/json" \
  -d '{"userId": "admin"}'
```

### Resolve Alert

```bash
curl -X POST http://localhost:8080/api/alerts/{alert-id}/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "resolvedBy": "admin",
    "resolutionNotes": "Fixed pH levels"
  }'
```

## Color Coding

### Severity Colors
- **Critical:** #F44336 (Red)
- **High:** #FF9800 (Orange)
- **Medium:** #FFC107 (Amber)
- **Low:** #4CAF50 (Green)

### Status Colors
- **Active:** #F44336 (Red)
- **Acknowledged:** #FF9800 (Orange)
- **Resolved:** #4CAF50 (Green)

## Troubleshooting

### No Alerts Showing

**Check:**
1. Backend is running: `curl http://localhost:8080/api/health`
2. Alerts exist: `curl http://localhost:8080/api/alerts`
3. Browser console for errors
4. Network tab for failed requests

**Solution:**
- Create test alerts by sending bad sensor data
- Check backend logs for errors
- Verify Firestore connection

### Can't Acknowledge/Resolve

**Check:**
1. Alert status (must be ACTIVE to acknowledge)
2. Backend logs for errors
3. Network requests in browser

**Solution:**
- Refresh the page
- Check backend is running
- Verify alert ID is correct

### Auto-refresh Not Working

**Check:**
1. Checkbox is checked
2. Browser console for errors
3. Network requests every 10 seconds

**Solution:**
- Uncheck and recheck the box
- Refresh the page
- Check browser console

## Performance

- Loads 100+ alerts smoothly
- Filtering is instant (client-side)
- Auto-refresh uses minimal bandwidth
- Responsive on mobile devices

## Future Enhancements

### Planned Features
- [ ] Bulk acknowledge/resolve
- [ ] Alert notifications (email, SMS)
- [ ] Alert history chart
- [ ] Export alerts to CSV
- [ ] Alert templates
- [ ] Custom alert rules
- [ ] Alert escalation
- [ ] Alert comments/notes

### Advanced Features
- [ ] Real-time WebSocket updates
- [ ] Alert grouping by location
- [ ] Alert trends analysis
- [ ] Predictive alerts
- [ ] Integration with external systems
- [ ] Mobile app notifications

## Best Practices

### For Operators

1. **Check alerts regularly** - At least every hour
2. **Acknowledge promptly** - Let others know you're on it
3. **Resolve with notes** - Document what was done
4. **Monitor critical alerts** - Prioritize by severity
5. **Use filters** - Focus on what matters

### For Administrators

1. **Review alert thresholds** - Adjust as needed
2. **Monitor alert frequency** - Too many = alert fatigue
3. **Train operators** - Ensure proper alert handling
4. **Analyze trends** - Identify recurring issues
5. **Maintain system** - Keep sensors calibrated

## Integration with Other Pages

### Dashboard
- Shows alert count
- Links to alerts page
- Displays critical alerts

### Trends
- Water quality trends help predict alerts
- Historical data shows alert patterns

### Map
- Shows alert locations
- Visual representation of problem areas

## Conclusion

The Alerts page provides comprehensive alert management with real-time updates, powerful filtering, and easy action handling. It's the central hub for monitoring and responding to system issues.

---

**Status:** ✅ Fully Functional
**Date:** November 8, 2025
**Backend:** Spring Boot + Firestore
**Frontend:** React + TypeScript
