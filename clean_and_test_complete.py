#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete Clean Database + Populate + Test Script
Database clean karke fresh data bhejenge aur sab test karenge
"""

import requests
import time
from datetime import datetime
import sys

# Fix encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

BACKEND_URL = "http://localhost:8080"

print("=" * 70)
print("STEP 1: DATABASE CLEANUP")
print("=" * 70)
print("\nWARNING: Manual step: Firebase Console se database clean karo")
print("Ya phir existing data ke saath hi test karte hain\n")
input("Press Enter to continue...")

print("\n" + "=" * 70)
print("STEP 2: SENDING MULTIPLE SENSOR READINGS")
print("=" * 70)

# EXACT format jo IoT device bhejegi (matching SensorData.java DTO)
sensor_readings = [
    {
        "deviceId": "SENSOR_001",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "location": {"lat": 28.6139, "lon": 77.2090},
        "sensors": {
            "PH": 7.2,
            "Turbidity_NTU": 2.1,
            "TDS_ppm": 350,
            "DO_mgL": 6.8,
            "Temperature_C": 25.5
        },
        "battery": {"voltage": 3.7, "level": 85.0}
    },
    {
        "deviceId": "SENSOR_002",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "location": {"lat": 28.7041, "lon": 77.1025},
        "sensors": {
            "PH": 6.8,
            "Turbidity_NTU": 3.5,
            "TDS_ppm": 420,
            "DO_mgL": 5.9,
            "Temperature_C": 26.2
        },
        "battery": {"voltage": 3.6, "level": 75.0}
    },
    {
        "deviceId": "SENSOR_003",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "location": {"lat": 28.5355, "lon": 77.3910},
        "sensors": {
            "PH": 8.1,
            "Turbidity_NTU": 1.8,
            "TDS_ppm": 280,
            "DO_mgL": 7.2,
            "Temperature_C": 24.8
        },
        "battery": {"voltage": 3.8, "level": 92.0}
    },
    {
        "deviceId": "SENSOR_004",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "location": {"lat": 28.4595, "lon": 77.0266},
        "sensors": {
            "PH": 5.5,
            "Turbidity_NTU": 8.5,
            "TDS_ppm": 650,
            "DO_mgL": 4.2,
            "Temperature_C": 31.5
        },
        "battery": {"voltage": 3.4, "level": 45.0}
    },
    {
        "deviceId": "SENSOR_005",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "location": {"lat": 28.6692, "lon": 77.4538},
        "sensors": {
            "PH": 7.5,
            "Turbidity_NTU": 2.8,
            "TDS_ppm": 390,
            "DO_mgL": 6.5,
            "Temperature_C": 25.9
        },
        "battery": {"voltage": 3.7, "level": 88.0}
    }
]

sensor_success = 0
for i, reading in enumerate(sensor_readings, 1):
    try:
        r = requests.post(f"{BACKEND_URL}/api/sensor-data", json=reading, timeout=5)
        if r.status_code in [200, 201]:
            print(f"[OK] Sensor {i}/5: {reading['deviceId']} - OK")
            sensor_success += 1
        else:
            print(f"[FAIL] Sensor {i}/5: {reading['deviceId']} - FAILED ({r.status_code})")
    except Exception as e:
        print(f"[ERROR] Sensor {i}/5: ERROR - {e}")
    time.sleep(0.5)

print(f"\nSensor Readings: {sensor_success}/5 successful")

print("\n" + "=" * 70)
print("STEP 3: SENDING MULTIPLE SYMPTOM REPORTS")
print("=" * 70)

# EXACT format jo ASHA worker app bhejegi (matching SymptomRequest.java DTO)
symptom_reports = [
    {
        "userId": "user_001",
        "location": "Delhi - Connaught Place",
        "geoLocation": {"latitude": 28.6139, "longitude": 77.2090},
        "waterSource": "TAP",
        "reporterType": "ASHA",
        "reporterId": "ASHA_001",
        "patientName": "Rahul Kumar",
        "patientPhone": "+91-9876543210",
        "patientAge": 35,
        "patientGender": "MALE",
        "symptoms": ["DIARRHEA", "NAUSEA"],
        "severity": "MODERATE",
        "duration": "DAYS",
        "waterConsumption": 3,
        "additionalNotes": "Patient reports symptoms started 2 days ago",
        "contactInfo": "Contact via phone"
    },
    {
        "userId": "user_002",
        "location": "Delhi - Rohini",
        "geoLocation": {"latitude": 28.7041, "longitude": 77.1025},
        "waterSource": "WELL",
        "reporterType": "ASHA",
        "reporterId": "ASHA_002",
        "patientName": "Priya Sharma",
        "patientPhone": "+91-9876543211",
        "patientAge": 28,
        "patientGender": "FEMALE",
        "symptoms": ["VOMITING", "FEVER"],
        "severity": "SEVERE",
        "duration": "DAYS",
        "waterConsumption": 2,
        "additionalNotes": "Severe dehydration, needs immediate attention",
        "contactInfo": "Emergency contact"
    },
    {
        "userId": "user_003",
        "location": "Delhi - Dwarka",
        "geoLocation": {"latitude": 28.5355, "longitude": 77.3910},
        "waterSource": "TAP",
        "reporterType": "VILLAGER",
        "reporterId": "SELF",
        "patientName": "Amit Singh",
        "patientPhone": "+91-9876543212",
        "patientAge": 42,
        "patientGender": "MALE",
        "symptoms": ["STOMACH_PAIN", "HEADACHE"],
        "severity": "MILD",
        "duration": "HOURS",
        "waterConsumption": 4,
        "additionalNotes": "Mild symptoms, monitoring",
        "contactInfo": "Self report"
    },
    {
        "userId": "user_004",
        "location": "Delhi - Connaught Place",
        "geoLocation": {"latitude": 28.6142, "longitude": 77.2092},
        "waterSource": "TAP",
        "reporterType": "ASHA",
        "reporterId": "ASHA_001",
        "patientName": "Sneha Patel",
        "patientPhone": "+91-9876543213",
        "patientAge": 32,
        "patientGender": "FEMALE",
        "symptoms": ["DIARRHEA", "DEHYDRATION"],
        "severity": "SEVERE",
        "duration": "DAYS",
        "waterConsumption": 2,
        "additionalNotes": "Part of cluster in Connaught Place",
        "contactInfo": "ASHA worker contact"
    },
    {
        "userId": "user_005",
        "location": "Delhi - Karol Bagh",
        "geoLocation": {"latitude": 28.6692, "longitude": 77.4538},
        "waterSource": "BOTTLED",
        "reporterType": "VILLAGER",
        "reporterId": "SELF",
        "patientName": "Vikram Mehta",
        "patientPhone": "+91-9876543214",
        "patientAge": 45,
        "patientGender": "MALE",
        "symptoms": ["NAUSEA"],
        "severity": "MILD",
        "duration": "HOURS",
        "waterConsumption": 3,
        "additionalNotes": "Using bottled water, isolated case",
        "contactInfo": "Self report"
    },
    {
        "userId": "user_006",
        "location": "Delhi - Connaught Place",
        "geoLocation": {"latitude": 28.6140, "longitude": 77.2088},
        "waterSource": "TAP",
        "reporterType": "ASHA",
        "reporterId": "ASHA_001",
        "patientName": "Anjali Verma",
        "patientPhone": "+91-9876543215",
        "patientAge": 29,
        "patientGender": "FEMALE",
        "symptoms": ["VOMITING", "DIARRHEA", "FEVER"],
        "severity": "SEVERE",
        "duration": "DAYS",
        "waterConsumption": 1,
        "additionalNotes": "Cluster case - same water source as others",
        "contactInfo": "ASHA worker"
    },
    {
        "userId": "user_007",
        "location": "Delhi - Lajpat Nagar",
        "geoLocation": {"latitude": 28.5677, "longitude": 77.2431},
        "waterSource": "TAP",
        "reporterType": "CLINIC",
        "reporterId": "CLINIC_001",
        "patientName": "Rajesh Gupta",
        "patientPhone": "+91-9876543216",
        "patientAge": 50,
        "patientGender": "MALE",
        "symptoms": ["STOMACH_PAIN"],
        "severity": "MODERATE",
        "duration": "HOURS",
        "waterConsumption": 3,
        "additionalNotes": "Clinic visit, prescribed medication",
        "contactInfo": "Clinic: 011-12345678"
    }
]

symptom_success = 0
for i, report in enumerate(symptom_reports, 1):
    try:
        r = requests.post(f"{BACKEND_URL}/api/symptoms/reports", json=report, timeout=5)
        if r.status_code in [200, 201]:
            print(f"[OK] Symptom {i}/7: {report['patientName']} - {report['location']} - OK")
            symptom_success += 1
        else:
            print(f"[FAIL] Symptom {i}/7: {report['patientName']} - FAILED ({r.status_code})")
    except Exception as e:
        print(f"[ERROR] Symptom {i}/7: ERROR - {e}")
    time.sleep(0.5)

print(f"\nSymptom Reports: {symptom_success}/7 successful")

print("\n" + "=" * 70)
print("STEP 4: RUNNING COMPREHENSIVE TESTS")
print("=" * 70)
time.sleep(2)  # Wait for data to be processed

test_results = {}

# Test 1: Dashboard Stats
try:
    r = requests.get(f"{BACKEND_URL}/api/dashboard/stats", timeout=5)
    if r.status_code == 200:
        data = r.json()
        print(f"[OK] Dashboard Stats: {data.get('totalSensors', 0)} sensors, {data.get('totalSymptoms', 0)} symptoms")
        test_results['dashboard_stats'] = True
    else:
        print(f"[FAIL] Dashboard Stats: FAILED")
        test_results['dashboard_stats'] = False
except Exception as e:
    print(f"[ERROR] Dashboard Stats: ERROR - {e}")
    test_results['dashboard_stats'] = False

# Test 2: Sensor Readings
try:
    r = requests.get(f"{BACKEND_URL}/api/sensors/readings", timeout=5)
    if r.status_code == 200:
        data = r.json()
        print(f"[OK] Sensor Readings: {len(data)} readings retrieved")
        test_results['sensor_readings'] = True
    else:
        print(f"[FAIL] Sensor Readings: FAILED")
        test_results['sensor_readings'] = False
except Exception as e:
    print(f"[ERROR] Sensor Readings: ERROR - {e}")
    test_results['sensor_readings'] = False

# Test 3: Sensor Readings (Full Path)
try:
    r = requests.get(f"{BACKEND_URL}/api/sensors/sensor-data/readings?limit=5", timeout=5)
    if r.status_code == 200:
        data = r.json()
        print(f"[OK] Sensor Readings (Full Path): {len(data)} readings retrieved")
        test_results['sensor_readings_full'] = True
    else:
        print(f"[FAIL] Sensor Readings (Full Path): FAILED")
        test_results['sensor_readings_full'] = False
except Exception as e:
    print(f"[ERROR] Sensor Readings (Full Path): ERROR - {e}")
    test_results['sensor_readings_full'] = False

# Test 4: All Symptoms
try:
    r = requests.get(f"{BACKEND_URL}/api/symptoms/reports", timeout=5)
    if r.status_code == 200:
        data = r.json()
        print(f"[OK] All Symptoms: {len(data)} reports retrieved")
        test_results['all_symptoms'] = True
    else:
        print(f"[FAIL] All Symptoms: FAILED")
        test_results['all_symptoms'] = False
except Exception as e:
    print(f"[ERROR] All Symptoms: ERROR - {e}")
    test_results['all_symptoms'] = False

# Test 5: Symptom Statistics
try:
    r = requests.get(f"{BACKEND_URL}/api/symptoms/statistics", timeout=5)
    if r.status_code == 200:
        data = r.json()
        print(f"[OK] Symptom Statistics: {data.get('totalReports', 0)} total reports")
        test_results['symptom_stats'] = True
    else:
        print(f"[FAIL] Symptom Statistics: FAILED")
        test_results['symptom_stats'] = False
except Exception as e:
    print(f"[ERROR] Symptom Statistics: ERROR - {e}")
    test_results['symptom_stats'] = False

# Test 6: Active Alerts
try:
    r = requests.get(f"{BACKEND_URL}/api/alerts/active", timeout=5)
    if r.status_code == 200:
        data = r.json()
        print(f"[OK] Active Alerts: {len(data)} active alerts")
        test_results['active_alerts'] = True
    else:
        print(f"[FAIL] Active Alerts: FAILED")
        test_results['active_alerts'] = False
except Exception as e:
    print(f"[ERROR] Active Alerts: ERROR - {e}")
    test_results['active_alerts'] = False

# Test 7: ML Health
try:
    r = requests.get(f"{BACKEND_URL}/api/ml/health", timeout=5)
    if r.status_code == 200:
        print(f"[OK] ML Health: OK")
        test_results['ml_health'] = True
    else:
        print(f"[FAIL] ML Health: FAILED")
        test_results['ml_health'] = False
except Exception as e:
    print(f"[ERROR] ML Health: ERROR - {e}")
    test_results['ml_health'] = False

print("\n" + "=" * 70)
print("FINAL RESULTS")
print("=" * 70)

passed = sum(1 for v in test_results.values() if v)
total = len(test_results)
percentage = (passed * 100) // total if total > 0 else 0

print(f"\nData Insertion:")
print(f"   Sensors: {sensor_success}/5")
print(f"   Symptoms: {symptom_success}/7")

print(f"\nAPI Tests:")
print(f"   Passed: {passed}/{total} ({percentage}%)")

if passed == total and sensor_success == 5 and symptom_success == 7:
    print("\n" + "=" * 70)
    print("SUCCESS! COMPLETE SUCCESS!")
    print("=" * 70)
    print("\n[OK] All sensor readings saved")
    print("[OK] All symptom reports saved")
    print("[OK] All API endpoints working")
    print("[OK] System 100% operational!")
else:
    print(f"\nWARNING: Some issues found:")
    if sensor_success < 5:
        print(f"   - {5 - sensor_success} sensor readings failed")
    if symptom_success < 7:
        print(f"   - {7 - symptom_success} symptom reports failed")
    if passed < total:
        print(f"   - {total - passed} API tests failed")

print("\n" + "=" * 70)
