import { useState } from 'react';
import axios from 'axios';
import { generatePDF } from '../utils/pdfGenerator';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

interface ReportFilters {
  state?: string;
  district?: string;
  city?: string;
  village?: string;
}

export const useReportDownload = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadReport = async (filters: ReportFilters) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('📊 Step 1: Requesting report with filters:', filters);

      // Build query params
      const params = new URLSearchParams();
      if (filters.state) params.append('state', filters.state);
      if (filters.district) params.append('district', filters.district);
      if (filters.city) params.append('city', filters.city);
      if (filters.village) params.append('village', filters.village);
      params.append('range', '24h');

      const url = `${API_BASE_URL}/api/report?${params.toString()}`;
      console.log('📡 Fetching report data from:', url);

      // Fetch report data
      const response = await axios.get(url, {
        timeout: 30000, // 30 second timeout
      });

      console.log('✅ Report data received');

      // Generate PDF with chart capture enabled
      console.log('📊 Generating PDF with charts... please wait');
      await generatePDF(response.data, true);

      console.log('✅ PDF generated successfully');
      
      return { success: true };

    } catch (err: any) {
      console.error('❌ Error generating report:', err);
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Could not generate report right now. Please try again.';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setIsGenerating(false);
    }
  };

  return {
    downloadReport,
    isGenerating,
    error,
    clearError: () => setError(null)
  };
};
