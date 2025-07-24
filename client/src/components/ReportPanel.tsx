import React, { useState, useEffect } from 'react';
import './ReportPanel.css';

interface ReportPanelProps {
  apiBaseUrl?: string;
  onGenerate?: () => Promise<string>;
}

export const ReportPanel: React.FC<ReportPanelProps> = ({ 
  apiBaseUrl, 
  onGenerate 
}) => {
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'unknown'|'checking'|'online'|'offline'>('unknown');

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      if (onGenerate) return; // Skip check if using legacy mode
      
      setApiStatus('checking');
      try {
        const baseUrl = apiBaseUrl || process.env.REACT_APP_API_URL;
        if (!baseUrl) throw new Error('API URL not configured');
        
        const response = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        setApiStatus(response.ok ? 'online' : 'offline');
      } catch {
        setApiStatus('offline');
      }
    };

    checkApiStatus();
  }, [apiBaseUrl, onGenerate]);

  const handleGenerate = async () => {
    if (apiStatus === 'offline') {
      setError('Backend API is currently unavailable');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport('');
    
    try {
      let generatedReport: string;

      if (onGenerate) {
        generatedReport = await onGenerate();
      } else {
        const baseUrl = apiBaseUrl || process.env.REACT_APP_API_URL;
        if (!baseUrl) {
          throw new Error('API endpoint not configured');
        }

        const response = await fetch(`${baseUrl}/report`, {
          headers: {
            'Accept': 'text/markdown'
          }
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        generatedReport = await response.text();
      }

      setReport(generatedReport);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      console.error('Report error:', { error: err, timestamp: new Date().toISOString() });
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
      console.error('Copy failed:', err);
      setError('Failed to copy to clipboard. Please check browser permissions.');
    }
  };

  return (
    <div className="report-panel">
      <div className="report-header">
        <h3>Simulation Report</h3>
        <div className="api-status" data-status={apiStatus}>
          API Status: {apiStatus.toUpperCase()}
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isLoading || apiStatus === 'offline'}
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
