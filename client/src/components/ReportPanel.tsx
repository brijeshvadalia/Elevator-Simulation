import React, { useState } from 'react';
import './ReportPanel.css';

interface ReportPanelProps {
  /**
   * Optional API base URL for report generation
   * If not provided, will use REACT_APP_API_URL environment variable
   */
  apiBaseUrl?: string;
  /**
   * Legacy report generator function
   * @deprecated Use apiBaseUrl instead
   */
  onGenerate?: () => Promise<string>;
}

export const ReportPanel: React.FC<ReportPanelProps> = ({ 
  apiBaseUrl, 
  onGenerate 
}) => {
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setReport('');
    
    try {
      let generatedReport: string;

      if (onGenerate) {
        // Legacy mode - use callback prop
        generatedReport = await onGenerate();
      } else {
        // Modern mode - call API directly
        const baseUrl = apiBaseUrl || process.env.REACT_APP_API_URL;
        if (!baseUrl) {
          throw new Error('API endpoint not configured. Set REACT_APP_API_URL or provide apiBaseUrl prop');
        }

        const response = await fetch(`${baseUrl}/report`);
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        generatedReport = await response.text();
      }

      setReport(generatedReport);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Report generation failed:', errorMessage);
      setError(errorMessage);
      setReport(`# Error Generating Report\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
    } catch (err) {
      console.error('Failed to copy report:', err);
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
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true"></span>
              Generating...
            </>
          ) : (
            'Generate Report'
          )}
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
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
              Download Report
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
