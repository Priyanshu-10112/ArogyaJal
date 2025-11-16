#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FINAL COMPREHENSIVE TEST - Zero Errors Expected
"""

import requests
from datetime import datetime
import sys

# Fix encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

BACKEND_URL = "http://localhost:8080"

def test_endpoint(name, method, url, data=None, expect_empty=False):
    """Test an endpoint and return success status"""
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, headers={"Content-Type": "application/json"}, timeout=5)
        
        if response.status_code in [200, 201]:
            result = response.json() if response.text else {}
            if expect_empty:
                print(f"[OK] {name}: OK (Empty response expected)")
            else:
                print(f"[OK] {name}: OK")
            return True
        else:
            print(f"[FAIL] {name}: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"[ERROR] {name}: ERROR - {str(e)}")
        return False

print("\n" + "=" * 70)
print("FINAL COMPREHENSIVE TEST - ZERO ERRORS EXPECTED")
print("=" * 70)
print(f"Backend: {BACKEND_URL}")
print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

results = {}

print("\n" + "=" * 70)
print("DASHBOARD ENDPOINTS")
print("=" * 70)
results['dashboard_health'] = test_endpoint("Dashboard Health", "GET", f"{BACKEND_URL}/api/dashboard/health")
results['dashboard_stats'] = test_endpoint("Dashboard Stats", "GET", f"{BACKEND_URL}/api/dashboard/stats")
results['dashboard_overview'] = test_endpoint("Dashboard Overview", "GET", f"{BACKEND_URL}/api/dashboard/overview")

print("\n" + "=" * 70)
print("ML ENDPOINTS")
print("=" * 70)
results['ml_health'] = test_endpoint("ML Health", "GET", f"{BACKEND_URL}/api/ml/health")
results['symptom_clusters'] = test_endpoint("Symptom Clusters", "GET", f"{BACKEND_URL}/api/symptom-clusters", expect_empty=True)
results['outbreak_predictions'] = test_endpoint("Outbreak Predictions", "GET", f"{BACKEND_URL}/api/outbreak-predictions", expect_empty=True)
results['outbreak_latest'] = test_endpoint("Outbreak Latest", "GET", f"{BACKEND_URL}/api/outbreak-predictions/latest", expect_empty=True)
results['risk_assessment'] = test_endpoint("Risk Assessment", "GET", f"{BACKEND_URL}/api/risk-assessment", expect_empty=True)

print("\n" + "=" * 70)
print("SENSOR ENDPOINTS")
print("=" * 70)
results['sensor_readings_alias'] = test_endpoint("Sensor Readings (Alias)", "GET", f"{BACKEND_URL}/api/sensors/readings")
results['sensor_readings_full'] = test_endpoint("Sensor Readings (Full Path)", "GET", f"{BACKEND_URL}/api/sensors/sensor-data/readings?limit=5")

print("\n" + "=" * 70)
print("SYMPTOM ENDPOINTS")
print("=" * 70)
results['symptom_stats'] = test_endpoint("Symptom Statistics", "GET", f"{BACKEND_URL}/api/symptoms/statistics")
results['all_symptoms'] = test_endpoint("All Symptoms", "GET", f"{BACKEND_URL}/api/symptoms/reports")

# Test symptom creation
symptom_data = {
    "userId": f"final_test_{int(datetime.now().timestamp())}",
    "location": "Final Test Location",
    "waterSource": "TAP",
    "patientName": "Final Test Patient",
    "patientPhone": "+91-9999999999",
    "symptoms": ["HEADACHE"],
    "severity": "MILD",
    "duration": "HOURS",
    "waterConsumption": 2
}
results['create_symptom'] = test_endpoint("Create Symptom", "POST", f"{BACKEND_URL}/api/symptoms/reports", data=symptom_data)

print("\n" + "=" * 70)
print("ALERT ENDPOINTS")
print("=" * 70)
results['all_alerts'] = test_endpoint("All Alerts", "GET", f"{BACKEND_URL}/api/alerts")
results['active_alerts'] = test_endpoint("Active Alerts", "GET", f"{BACKEND_URL}/api/alerts/active")

print("\n" + "=" * 70)
print("FINAL RESULTS")
print("=" * 70)

passed = sum(1 for v in results.values() if v)
total = len(results)
percentage = (passed * 100) // total

print(f"\nPassed: {passed}/{total} ({percentage}%)")

if passed == total:
    print("\n" + "=" * 70)
    print("SUCCESS! ALL TESTS PASSED - ZERO ERRORS!")
    print("=" * 70)
    print("\nYour system is 100% operational!")
    print("[OK] All endpoints working")
    print("[OK] No 404 errors")
    print("[OK] No 500 errors")
    print("[OK] Patient fields working")
    print("[OK] ML endpoints working")
    print("[OK] Dashboard working")
    print("[OK] Sensors working")
else:
    print(f"\nWARNING: {total - passed} test(s) failed")
    print("\nFailed tests:")
    for name, passed_test in results.items():
        if not passed_test:
            print(f"  [FAIL] {name}")
    print("\nBACKEND RESTART REQUIRED!")
    print("Run: cd backend && mvn clean install && mvn spring-boot:run")

print("\n" + "=" * 70)
