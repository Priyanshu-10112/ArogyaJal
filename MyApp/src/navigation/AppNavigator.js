import React, { useState } from 'react';
import LaunchScreen from '../screens/LaunchScreen';
import HomeScreen from '../screens/HomeScreen';
import BoardingScreen from '../screens/BoardingScreen';
import AshaLoginScreen from '../screens/AshaLoginScreen';
import AshaDashboardScreen from '../screens/AshaDashboardScreen';
import AshaReportCaseScreen from '../screens/AshaReportCaseScreen';
import SensorUploadScreen from '../screens/SensorUploadScreen';
import GeneratedDataScreen from '../screens/GeneratedDataScreen';
import AlertsScreen from '../screens/AlertsScreen';

export default function AppNavigator() {
  const [route, setRoute] = useState('Launch');

  const navigation = {
    navigate: (name) => setRoute(name),
  };

  if (route === 'AshaLogin') {
    return <AshaLoginScreen navigation={navigation} />;
  }

  if (route === 'AshaDashboard') {
    return <AshaDashboardScreen navigation={navigation} />;
  }

  if (route === 'AshaReportCase') {
    return <AshaReportCaseScreen navigation={navigation} />;
  }

  if (route === 'SensorUpload') {
    return <SensorUploadScreen navigation={navigation} />;
  }

  if (route === 'GeneratedData') {
    return <GeneratedDataScreen navigation={navigation} route={{ params: {} }} />;
  }

  if (route === 'Alerts') {
    return <AlertsScreen navigation={navigation} />;
  }

  if (route === 'Boarding') {
    return <BoardingScreen navigation={navigation} />;
  }

  if (route === 'Home') {
    return <HomeScreen navigation={navigation} />;
  }

  return <LaunchScreen navigation={navigation} />;
}


