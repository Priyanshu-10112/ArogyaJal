#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Populate clean database with test data
"""

import requests
import json
import time
from datetime import datetime
import sys

# Fix encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

BACKEND_URL = "http://localhost:8080"

def load_test_data():
    """Load test data from JSON file"""
    with open('TEST_DATA_COMPLETE.json', 'r') as f:
        return json.load(f)

def submit_sensor_data(sensor):
    """Submit sensor reading"""
    # Transform to match backend format
    payload = {
        "deviceId": sensor["deviceId"],
        "location": {
            "lat": sensor["latitude"],
            "lon": sensor["longitude"]
        },
        "sensors": {
            "pH": sensor["ph"],
            "temperature_C": sensor["temperature"],
            "turbidity_NTU": sensor["turbidity"],
            "DO_mgL": sensor["dissolvedOxygen"],
            "conductivity_uS_cm": sensor["conductivity"],
            "TDS_ppm": sensor["tds"]
        },
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/sensor-data",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            print(f"[OK] Sensor {sensor['deviceId']} - {sensor['location']}")
            return True
        else:
            print(f"[FAIL] Sensor {sensor['deviceId']} failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Sensor {sensor['deviceId']} error: {str(e)}")
        return False

def submit_symptom_report(symptom):
    """Submit symptom report"""
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/symptoms/reports",
            json=symptom,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 201:
            print(f"[OK] Symptom {symptom['patientName']} - {symptom['location']}")
            return True
        else:
            print(f"[FAIL] Symptom {symptom['patientName']} failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Symptom {symptom['patientName']} error: {str(e)}")
        return False

def main():
    print("\n" + "=" * 70)
    print("DATABASE POPULATION SCRIPT")
    print("=" * 70)
    print(f"Backend: {BACKEND_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\nWARNING: Make sure:")
    print("1. Backend is running on port 8080")
    print("2. Database is clean/empty")
    print("3. You want to populate with test data")
    
    input("\nPress ENTER to continue or Ctrl+C to cancel...")
    
    # Load test data
    print("\nLoading test data...")
    data = load_test_data()
    
    print(f"Found {len(data['sensors'])} sensors and {len(data['symptoms'])} symptom reports")
    
    # Submit sensors
    print("\n" + "=" * 70)
    print("SUBMITTING SENSOR DATA")
    print("=" * 70)
    
    sensor_success = 0
    for sensor in data['sensors']:
        if submit_sensor_data(sensor):
            sensor_success += 1
        time.sleep(0.5)  # Small delay between requests
    
    print(f"\nSensors: {sensor_success}/{len(data['sensors'])} submitted successfully")
    
    # Submit symptoms
    print("\n" + "=" * 70)
    print("SUBMITTING SYMPTOM REPORTS")
    print("=" * 70)
    
    symptom_success = 0
    for symptom in data['symptoms']:
        if submit_symptom_report(symptom):
            symptom_success += 1
        time.sleep(0.5)  # Small delay between requests
    
    print(f"\nSymptoms: {symptom_success}/{len(data['symptoms'])} submitted successfully")
    
    # Summary
    print("\n" + "=" * 70)
    print("POPULATION COMPLETE")
    print("=" * 70)
    print(f"[OK] Sensors: {sensor_success}/{len(data['sensors'])}")
    print(f"[OK] Symptoms: {symptom_success}/{len(data['symptoms'])}")
    
    total_success = sensor_success + symptom_success
    total_items = len(data['sensors']) + len(data['symptoms'])
    percentage = (total_success * 100) // total_items
    
    print(f"\nOverall: {total_success}/{total_items} ({percentage}%)")
    
    if total_success == total_items:
        print("\n" + "=" * 70)
        print("SUCCESS! DATABASE POPULATED SUCCESSFULLY!")
        print("=" * 70)
        print("\nYou now have:")
        print(f"- {sensor_success} sensor readings across 3 villages")
        print(f"- {symptom_success} symptom reports with patient info")
        print("- Data ready for ML clustering and outbreak detection")
        print("\nNext steps:")
        print("1. Run: python FINAL_TEST.py")
        print("2. Check dashboard at http://localhost:3000")
        print("3. View ML predictions")
    else:
        print(f"\nWARNING: {total_items - total_success} items failed to submit")
        print("Check backend logs for errors")
    
    print("=" * 70)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[CANCELLED] Cancelled by user")
    except Exception as e:
        print(f"\n\n[ERROR] Error: {str(e)}")
