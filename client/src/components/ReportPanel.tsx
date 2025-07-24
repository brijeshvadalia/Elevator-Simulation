import React, { useState } from 'react';
import './ReportPanel.css';

interface ReportPanelProps {
  onGenerate: () => Promise<string>;
}

export const ReportPanel: React.FC<ReportPanelProps> = ({ onGenerate }) => {
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const generatedReport = await onGenerate();
      setReport(generatedReport);
    } finally {
      setIsLoading(false);
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
      
      {report && (
        <div className="report-content">
          <pre>{report}</pre>
          <button 
            onClick={() => navigator.clipboard.writeText(report)}
            className="copy-btn"
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
      )}
    </div>
  );
};