import React, { useState } from 'react';
import './ReportPanel.css';

export const ReportPanel: React.FC = () => {
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setReport('');
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) throw new Error('API URL not configured in environment variables');

      const response = await fetch(`${apiUrl}/report`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const generatedReport = await response.text();
      setReport(generatedReport);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      setReport(`# Error\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
    } catch (err) {
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
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {report && (
        <div className="report-content">
          <pre>{report}</pre>
          <div className="action-buttons">
            <button onClick={handleCopy} className="copy-btn">
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
