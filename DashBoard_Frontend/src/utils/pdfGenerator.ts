import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateLineChart, generateFactorBarChart, generateRiskGauge } from './chartGenerator';

interface ReportData {
  metadata: {
    regionName: string;
    timeRange: string;
    generatedAt: string;
    reportType: string;
    scope: string;
    configuredDevices: number;
    reportingDevices24h: number;
  };
  waterQualitySummary: {
    totalSensors: number;
    activeSensors: number;
    ph: { min: number; max: number; avg: number };
    tds: { min: number; max: number; avg: number };
    turbidity: { min: number; max: number; avg: number };
    temperature: { min: number; max: number; avg: number };
  };
  sensorHistory: Array<{
    deviceId: string;
    location: string;
    readings: Array<{
      timestamp: string;
      ph: number;
      tds: number;
      turbidity: number;
      temperature: number;
      wqi: number;
    }>;
  }>;
  alerts: Array<{
    alertId: string;
    type: string;
    severity: string;
    timestamp: string;
    status: string;
    description: string;
    deviceId?: string;
  }>;
  mlPrediction: {
    riskScore: number;
    riskLevel: string;
    confidence: number;
    contributingFactors: Record<string, number>;
    recommendations: string[];
    explanation?: string;
  };
  clarificationMessage?: string;
}

export const generatePDF = async (data: ReportData, captureCharts: boolean = true): Promise<void> => {
  // Step 1: Fetch JSON (already done - data is passed in)
  console.log('📊 Step 1: Data received');

  // Step 2-4: Generate charts using canvas-based approach (more reliable than DOM rendering)
  console.log('📊 Step 2-4: Generating charts...');
  const chartImages: Record<string, string | null> = {};
  let chartsEmbedded = 0;
  let chartsFailed = 0;

  // Wait a moment for browser to be ready
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    // Generate risk gauge using canvas
    if (data.mlPrediction && data.mlPrediction.riskLevel !== 'UNKNOWN') {
      try {
        console.log('Generating risk gauge with:', {
          score: data.mlPrediction.riskScore,
          level: data.mlPrediction.riskLevel,
          confidence: data.mlPrediction.confidence
        });
        chartImages.riskGauge = generateRiskGauge(
          data.mlPrediction.riskScore,
          data.mlPrediction.riskLevel,
          data.mlPrediction.confidence,
          600,
          400
        );
        console.log('Risk gauge result:', chartImages.riskGauge ? 'SUCCESS (length: ' + chartImages.riskGauge.length + ')' : 'NULL');
        if (chartImages.riskGauge) {
          chartsEmbedded++;
          console.log('✅ Risk gauge generated');
        } else {
          chartsFailed++;
          console.warn('⚠️ Risk gauge returned null');
        }
      } catch (error) {
        chartsFailed++;
        console.error('⚠️ Risk gauge generation failed:', error);
      }
    }

    // Generate factor bar chart using canvas
    if (data.mlPrediction?.contributingFactors && Object.keys(data.mlPrediction.contributingFactors).length > 0) {
      try {
        console.log('Generating factor bar chart with factors:', data.mlPrediction.contributingFactors);
        chartImages.factorBar = generateFactorBarChart(data.mlPrediction.contributingFactors, 800, 400);
        console.log('Factor bar result:', chartImages.factorBar ? 'SUCCESS (length: ' + chartImages.factorBar.length + ')' : 'NULL');
        if (chartImages.factorBar) {
          chartsEmbedded++;
          console.log('✅ Factor bar chart generated');
        } else {
          chartsFailed++;
          console.warn('⚠️ Factor bar chart returned null');
        }
      } catch (error) {
        chartsFailed++;
        console.error('⚠️ Factor bar chart generation failed:', error);
      }
    }

    // Generate sensor line charts using canvas
    const topSensors = data.sensorHistory.slice(0, 2);
    for (let i = 0; i < topSensors.length; i++) {
      const sensor = topSensors[i];
      if (sensor.readings.length > 0) {
        // Sample readings to max 24 points
        const sampledReadings = sensor.readings.length > 24
          ? sensor.readings.filter((_, idx) => idx % Math.ceil(sensor.readings.length / 24) === 0)
          : sensor.readings;

        const labels = sampledReadings.map(r => {
          const date = new Date(r.timestamp);
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        });

        // pH chart
        try {
          chartImages[`ph_${i}`] = generateLineChart(
            {
              labels,
              values: sampledReadings.map(r => r.ph),
              label: `pH Levels - ${sensor.deviceId}`,
              color: '#2563eb'
            },
            800,
            300
          );
          if (chartImages[`ph_${i}`]) {
            chartsEmbedded++;
            console.log(`✅ pH chart ${i + 1} generated`);
          }
        } catch (error) {
          chartsFailed++;
          console.warn(`⚠️ pH chart ${i + 1} generation failed:`, error);
        }

        // WQI chart
        try {
          chartImages[`wqi_${i}`] = generateLineChart(
            {
              labels,
              values: sampledReadings.map(r => r.wqi),
              label: `Water Quality Index - ${sensor.deviceId}`,
              color: '#dc2626'
            },
            800,
            300
          );
          if (chartImages[`wqi_${i}`]) {
            chartsEmbedded++;
            console.log(`✅ WQI chart ${i + 1} generated`);
          }
        } catch (error) {
          chartsFailed++;
          console.warn(`⚠️ WQI chart ${i + 1} generation failed:`, error);
        }
      }
    }

    console.log(`📊 Charts generated: ${chartsEmbedded}, Failed: ${chartsFailed}`);

  } catch (error) {
    console.error('❌ Error during chart generation:', error);
  }

  // Step 5: Embed images in PDF
  console.log('📊 Step 5: Generating PDF with embedded charts...');
  const doc = new jsPDF();
  let yPos = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number = 170) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * 7);
  };

  // Helper to check if we need a new page
  const checkPageBreak = (requiredSpace: number = 40) => {
    if (yPos > 280 - requiredSpace) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // ========== PAGE 1: HEADER ==========
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ArogyaJal Lab Report', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(data.metadata.regionName, 105, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(10);
  doc.text(data.metadata.timeRange, 105, yPos, { align: 'center' });
  
  yPos += 6;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date(data.metadata.generatedAt).toLocaleString()}`, 105, yPos, { align: 'center' });
  doc.text(`Scope: ${data.metadata.scope || 'All Regions'}`, 105, yPos + 4, { align: 'center' });
  
  yPos += 15;
  doc.setTextColor(0);

  // ========== CONTEXT PARAGRAPH ==========
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPos = addText(
    'This report summarises water quality, alerts, and outbreak risk for the selected region over the last 24 hours. ' +
    'It is intended for use by district health officials and water quality teams.',
    20, yPos, 170
  );
  yPos += 8;

  // ========== SENSOR COVERAGE INFO ==========
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Sensor Coverage:', 20, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  
  const configuredDevices = data.metadata.configuredDevices || 0;
  const reportingDevices = data.metadata.reportingDevices24h || 0;
  
  if (configuredDevices > 0) {
    const coveragePercent = ((reportingDevices / configuredDevices) * 100).toFixed(0);
    doc.text(
      `Out of ${configuredDevices} configured sensors, ${reportingDevices} reported data in the last 24 hours (${coveragePercent}% coverage).`,
      20, yPos
    );
  } else {
    doc.text('Sensor coverage information not available.', 20, yPos);
  }
  yPos += 10;

  // ========== CLARIFICATION MESSAGE (if no data) ==========
  if (data.clarificationMessage && reportingDevices === 0) {
    checkPageBreak(50);
    
    // Draw a light blue info box
    doc.setDrawColor(59, 130, 246);
    doc.setFillColor(239, 246, 255);
    doc.setLineWidth(0.5);
    
    // Calculate box height based on text
    const messageLines = doc.splitTextToSize(data.clarificationMessage, 160);
    const boxHeight = messageLines.length * 5 + 10;
    
    doc.roundedRect(20, yPos, 170, boxHeight, 3, 3, 'FD');
    
    // Add icon and title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('ℹ️ No Recent Activity', 25, yPos + 7);
    
    // Add message text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 64, 175);
    doc.text(messageLines, 25, yPos + 14);
    
    doc.setTextColor(0);
    yPos += boxHeight + 10;
  }

  // ========== SECTION 1: SUMMARY ==========
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summary = data.waterQualitySummary;
  
  if (summary.totalSensors === 0) {
    doc.setTextColor(200, 0, 0);
    yPos = addText('⚠ No sensor data recorded in the last 24 hours for this region.', 20, yPos);
    doc.setTextColor(0);
  } else {
    doc.text(`Total Sensors: ${summary.totalSensors}`, 20, yPos);
    doc.text(`Active Sensors: ${summary.activeSensors}`, 120, yPos);
    yPos += 10;

    // Water Quality Parameters Table
    autoTable(doc, {
      startY: yPos,
      head: [['Parameter', 'Min', 'Max', 'Average', 'Status']],
      body: [
        ['pH', summary.ph.min.toFixed(2), summary.ph.max.toFixed(2), summary.ph.avg.toFixed(2), 
         summary.ph.avg >= 6.5 && summary.ph.avg <= 8.5 ? '✓ Good' : '✗ Poor'],
        ['TDS (ppm)', summary.tds.min.toFixed(0), summary.tds.max.toFixed(0), summary.tds.avg.toFixed(0),
         summary.tds.avg < 500 ? '✓ Good' : '✗ High'],
        ['Turbidity (NTU)', summary.turbidity.min.toFixed(2), summary.turbidity.max.toFixed(2), summary.turbidity.avg.toFixed(2),
         summary.turbidity.avg < 5 ? '✓ Good' : '✗ High'],
        ['Temperature (°C)', summary.temperature.min.toFixed(1), summary.temperature.max.toFixed(1), summary.temperature.avg.toFixed(1),
         summary.temperature.avg >= 15 && summary.temperature.avg <= 30 ? '✓ Good' : '⚠ Check']
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== SECTION 2: ML PREDICTION ==========
  checkPageBreak(60);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Outbreak Risk Prediction', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const ml = data.mlPrediction;
  
  // Check if prediction is available
  if (ml.riskLevel === 'UNKNOWN' || (ml.riskScore === 0 && Object.keys(ml.contributingFactors || {}).length === 0)) {
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    yPos = addText(ml.explanation || 'Prediction not available for this region in the last 24 hours.', 20, yPos, 170);
    doc.setTextColor(0);
    yPos += 10;
  } else {
    // Embed captured risk gauge chart
    if (chartImages.riskGauge) {
      checkPageBreak(80);
      
      yPos = embedChartImage(
        doc,
        chartImages.riskGauge,
        20,
        yPos,
        170,
        60,
        'Chart rendering failed — live view available in dashboard.'
      );
      yPos += 5;
    } else {
      // Fallback: Risk Score Box
      doc.setDrawColor(0);
      doc.setFillColor(ml.riskScore >= 75 ? 220 : ml.riskScore >= 50 ? 255 : ml.riskScore >= 25 ? 255 : 76, 
                       ml.riskScore >= 75 ? 53 : ml.riskScore >= 50 ? 193 : ml.riskScore >= 25 ? 235 : 175,
                       ml.riskScore >= 75 ? 69 : ml.riskScore >= 50 ? 7 : ml.riskScore >= 25 ? 59 : 80);
      doc.rect(20, yPos, 60, 20, 'F');
      
      doc.setTextColor(255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${ml.riskScore.toFixed(1)}`, 50, yPos + 10, { align: 'center' });
      doc.setFontSize(10);
      doc.text(ml.riskLevel, 50, yPos + 16, { align: 'center' });
      
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      doc.text(`Confidence: ${ml.confidence.toFixed(1)}%`, 90, yPos + 12);
      
      yPos += 25;
    }

    // Human-readable explanation
    if (ml.explanation) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      yPos = addText(ml.explanation, 20, yPos, 170);
      yPos += 8;
    }

    // Contributing Factors with bar chart
    if (ml.contributingFactors && Object.keys(ml.contributingFactors).length > 0) {
      checkPageBreak(80);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Contributing Factors:', 20, yPos);
      yPos += 6;

      // Embed captured factor bar chart
      if (chartImages.factorBar) {
        yPos = embedChartImage(
          doc,
          chartImages.factorBar,
          20,
          yPos,
          170,
          60,
          'Chart rendering failed — live view available in dashboard.'
        );
        yPos += 5;
      } else {
        // Fallback: text list
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text('Chart rendering failed — live view available in dashboard.', 20, yPos);
        doc.setTextColor(0);
        yPos += 6;
        
        const sortedFactors = Object.entries(ml.contributingFactors)
          .sort(([, a], [, b]) => b - a);
        
        sortedFactors.forEach(([key, value]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const description = getFactorDescription(key, value);
          doc.text(`• ${label}: ${value.toFixed(1)} - ${description}`, 25, yPos);
          yPos += 5;
        });
        
        yPos += 3;
      }
    }

    // Recommendations
    if (ml.recommendations && ml.recommendations.length > 0) {
      checkPageBreak(30);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations:', 20, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      ml.recommendations.forEach((rec) => {
        checkPageBreak(10);
        yPos = addText(`• ${rec}`, 25, yPos, 165);
        yPos += 2;
      });
    }
  }

  yPos += 10;

  // ========== SECTION 3: ALERTS ==========
  checkPageBreak(40);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Alerts (Last 24 Hours)', 20, yPos);
  yPos += 8;

  if (data.alerts.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 150, 0);
    doc.text('✓ No alerts recorded in the last 24 hours.', 20, yPos);
    doc.setTextColor(0);
    yPos += 10;
  } else {
    // Alert counts by severity
    const severityCounts = data.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total: ${data.alerts.length} | `, 20, yPos);
    let xOffset = 50;
    
    // Display in severity order
    const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    severityOrder.forEach(severity => {
      if (severityCounts[severity]) {
        doc.text(`${severity}: ${severityCounts[severity]}  `, xOffset, yPos);
        xOffset += 35;
      }
    });
    yPos += 8;

    // Sort alerts by severity (CRITICAL → HIGH → MEDIUM → LOW)
    const severityPriority: Record<string, number> = { 
      'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 
    };
    
    const sortedAlerts = [...data.alerts].sort((a, b) => {
      const priorityA = severityPriority[a.severity] ?? 999;
      const priorityB = severityPriority[b.severity] ?? 999;
      return priorityA - priorityB;
    });

    // Alerts Table
    const alertRows = sortedAlerts.slice(0, 20).map(alert => [
      new Date(alert.timestamp).toLocaleString('en-US', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }),
      alert.deviceId || '-',
      alert.severity,
      alert.type,
      alert.description.substring(0, 35) + (alert.description.length > 35 ? '...' : '')
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Time', 'Device', 'Severity', 'Type', 'Description']],
      body: alertRows,
      theme: 'striped',
      headStyles: { fillColor: [231, 76, 60], textColor: 255 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 22 },
        2: { cellWidth: 20 },
        3: { cellWidth: 28 },
        4: { cellWidth: 'auto' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== SECTION 4: SENSOR TRENDS ==========
  if (data.sensorHistory.length > 0) {
    checkPageBreak(60);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Sensor Trends (Last 24 Hours)', 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Visual representation of water quality parameters over time:', 20, yPos);
    yPos += 10;

    // Embed captured line charts for top sensors
    const topSensors = data.sensorHistory.slice(0, 2);
    
    for (let i = 0; i < topSensors.length; i++) {
      const sensor = topSensors[i];
      checkPageBreak(80);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`${sensor.deviceId} - ${sensor.location}`, 20, yPos);
      yPos += 5;
      
      if (sensor.readings.length > 0) {
        // Embed pH chart
        if (chartImages[`ph_${i}`]) {
          yPos = embedChartImage(
            doc,
            chartImages[`ph_${i}`],
            20,
            yPos,
            170,
            50,
            'Chart rendering failed — live view available in dashboard.'
          );
          yPos += 5;
        } else {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text('pH chart rendering failed — live view available in dashboard.', 20, yPos);
          doc.setTextColor(0);
          yPos += 8;
        }
        
        checkPageBreak(60);
        
        // Embed WQI chart
        if (chartImages[`wqi_${i}`]) {
          yPos = embedChartImage(
            doc,
            chartImages[`wqi_${i}`],
            20,
            yPos,
            170,
            50,
            'Chart rendering failed — live view available in dashboard.'
          );
          yPos += 5;
        } else {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text('WQI chart rendering failed — live view available in dashboard.', 20, yPos);
          doc.setTextColor(0);
          yPos += 8;
        }
        
        // Latest reading summary
        const latest = sensor.readings[sensor.readings.length - 1];
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(
          `Latest: pH ${latest.ph.toFixed(2)}, TDS ${latest.tds.toFixed(0)} ppm, ` +
          `Turbidity ${latest.turbidity.toFixed(2)} NTU, Temp ${latest.temperature.toFixed(1)}°C, ` +
          `WQI ${latest.wqi.toFixed(1)}`,
          20, yPos
        );
        doc.setFontSize(9);
        yPos += 8;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.text('No readings available', 20, yPos);
        yPos += 8;
      }
    }
    
    yPos += 5;
  }

  // ========== SECTION 5: SENSOR DETAILS TABLE ==========
  if (data.sensorHistory.length > 0) {
    checkPageBreak(40);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Sensor Details', 20, yPos);
    yPos += 8;

    // Create summary table
    const sensorRows = data.sensorHistory.slice(0, 10).map(sensor => {
      const latest = sensor.readings.length > 0 ? sensor.readings[sensor.readings.length - 1] : null;
      return [
        sensor.deviceId,
        sensor.location.substring(0, 25) + (sensor.location.length > 25 ? '...' : ''),
        sensor.readings.length.toString(),
        latest ? latest.ph.toFixed(2) : '-',
        latest ? latest.wqi.toFixed(1) : '-',
        latest ? getWQIStatus(latest.wqi) : '-'
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Device ID', 'Location', 'Readings', 'pH', 'WQI', 'Status']],
      body: sensorRows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 20 }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== FOOTER ==========
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`ArogyaJal Water Quality Report - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  // ========== SAVE PDF ==========
  const regionName = data.metadata.regionName.replace(/[^a-zA-Z0-9]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  const filename = `ArogyaJal_Report_${regionName}_${date}.pdf`;
  
  console.log('📊 Step 6: Triggering PDF download...');
  doc.save(filename);
  
  console.log(`✅ PDF generated successfully with ${chartsEmbedded} charts embedded`);
};

// Helper function to get factor description
const getFactorDescription = (key: string, value: number): string => {
  if (value === 0) return 'No contribution';
  
  switch (key) {
    case 'cluster_factor':
      return value > 30 ? 'Multiple active clusters' : value > 15 ? 'Active cluster detected' : 'Minor cluster activity';
    case 'report_factor':
      return value > 15 ? 'High symptom reports' : value > 8 ? 'Moderate reports' : 'Low report activity';
    case 'quality_factor':
      return value > 15 ? 'Widespread poor quality' : value > 8 ? 'Some quality issues' : 'Minor quality concerns';
    case 'source_factor':
      return value > 7 ? 'Multiple contaminated sources' : value > 3 ? 'Source contamination detected' : 'Minor source issues';
    default:
      return value > 10 ? 'High' : value > 5 ? 'Moderate' : 'Low';
  }
};

// Helper function to get WQI status
const getWQIStatus = (wqi: number): string => {
  if (wqi <= 25) return 'Excellent';
  if (wqi <= 50) return 'Good';
  if (wqi <= 75) return 'Fair';
  if (wqi <= 100) return 'Poor';
  return 'Very Poor';
};

// Helper function to embed captured image into PDF
const embedChartImage = (
  doc: jsPDF,
  imageData: string | null,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  fallbackText: string
): number => {
  if (imageData && imageData.startsWith('data:image')) {
    try {
      // Use fixed aspect ratio based on canvas dimensions
      // Most charts are 800x400 or 800x300, so aspect ratio is ~2:1 or ~2.67:1
      // We'll use a safe default aspect ratio
      const aspectRatio = 2.0; // width:height ratio
      
      let width = maxWidth;
      let height = width / aspectRatio;
      
      // If height exceeds max, scale down
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      
      // Ensure dimensions are valid numbers
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        throw new Error('Invalid dimensions calculated');
      }
      
      // Center the image
      const xOffset = x + (maxWidth - width) / 2;
      
      // Add image to PDF
      doc.addImage(imageData, 'JPEG', xOffset, y, width, height);
      return y + height + 5;
    } catch (error) {
      console.error('Error embedding image:', error);
      // Fall through to fallback
    }
  }
  
  // Fallback: show message
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(fallbackText, x, y);
  doc.setTextColor(0);
  return y + 10;
};
