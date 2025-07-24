import React, { useState } from 'react';
import './ReportPanel.css';

interface ReportPanelProps {
  apiBaseUrl?: string; 
}

export const ReportPanel: React.FC<ReportPanelProps> = ({ apiBaseUrl }) => {
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the provided API base URL or fallback to environment variable
      const baseUrl = apiBaseUrl || process.env.REACT_APP_API_URL;
      if (!baseUrl) {
        throw new Error('API base URL not configured');
      }

      const response = await fetch(`${baseUrl}/report`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const generatedReport = await response.text();
      setReport(generatedReport);
    } catch (err) {
      console.error('Report generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      setReport('# Error Generating Report\n' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
    } catch (err) {
      console.error('Copy failed:', err);
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="report-panel">
      <div className="report-header">
        <h3>Simulation Report</h3>
        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="generate-btn"
          aria-busy={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {report && (
        <div className="report-content">
          <pre>{report}</pre>
          <div className="action-buttons">
            <button 
              onClick={handleCopy}
              className="copy-btn"
              disabled={!report}
            >
              Copy to Clipboard
            </button>
            <a 
              href={`data:text/markdown;charset=utf-8,${encodeURIComponent(report)}`}
              download="elevator-report.md"
              className="download-btn"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
