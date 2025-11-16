# ArogyaJal - Water Quality Monitoring System

**Real-time water quality monitoring with IoT integration & ML-powered predictions**

---

## 🚀 Quick Start

### Start All Services (Windows)
```bash
start_all_services.bat
```

### Manual Start
```bash
# Backend (Port 8080)
cd backend
mvn spring-boot:run

# Frontend (Port 3000)
cd DashBoard_Frontend
npm install
npm start

# ML Service (Port 5000)
cd ML
pip install -r requirements.txt
python api.py
```

---

## 📁 Project Structure

```
SihProject/
├── backend/                      # Spring Boot backend
├── DashBoard_Frontend/           # React dashboard
├── ML/                           # Flask ML service
├── PROJECT_DOCUMENTATION.md      # Complete documentation
├── FINAL_TEST.py                 # Comprehensive tests
├── clean_and_test_complete.py    # Clean DB + test
├── populate_database.py          # Seed database
└── start_all_services.bat        # Start all
```

---

## 🧪 Testing

```bash
# Run comprehensive tests
python FINAL_TEST.py

# Clean database + populate + test
python clean_and_test_complete.py

# Populate database only
python populate_database.py
```

---

## 📖 Documentation

**Complete documentation:** [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)

Includes:
- System Architecture
- API Reference
- IoT Integration Guide
- ML Integration
- Deployment Guide
- Testing Guide

---

## 🎯 Core Features

- ✅ Real-time water quality monitoring
- ✅ ML-powered WQI predictions (USP)
- ✅ IoT device integration (ESP32/Arduino)
- ✅ Automatic alert generation
- ✅ Interactive dashboard
- ✅ Trend analysis
- ✅ Geographic distribution

---

## 🛠️ Technology Stack

- **Frontend:** React + TypeScript
- **Backend:** Spring Boot (Java 17)
- **Database:** Firebase Firestore
- **ML:** Flask + scikit-learn (Python)
- **IoT:** ESP32/Arduino (C++)

---

## 📊 System Status

✅ **Production Ready**
- All endpoints working
- ML integration complete
- Database configured
- Tests passing
- Documentation complete

---

## 🔗 Endpoints

**Backend:** http://localhost:8080
**Frontend:** http://localhost:3000
**ML Service:** http://localhost:5000

---

## 📞 Support

Check [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for:
- Troubleshooting
- API reference
- Configuration
- Deployment guide

---

**Last Updated:** November 16, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
