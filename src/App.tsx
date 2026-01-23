// Import useState and useEffect hooks from React library
// useState: Used to manage component state (data that can change)
// useEffect: Used to run side effects (like setting up timers, fetching data)
import { useState, useEffect } from 'react';

import './App.css';

function App() {
  const [insight, setInsight] = useState("");

  const [loading, setLoading] = useState(false);

  const [time, setTime] = useState("");

  const [accountInfo] = useState({
    account: "••••••5892",
    holder: "Michel S.",
    bank: "GDC BANK"
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
    };

    updateTime();

    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  const getAiInsights = async () => {
    setLoading(true);

    setInsight("");

    try {
      const response = await fetch('http://localhost:8080/api/v1/ai/transactions/insights/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber: "2026395892" })
      });

      if (!response.ok) throw new Error("Backend unreachable");

      if (!response.body) {
        throw new Error("ReadableStream not yet supported or empty response");
      }

      const reader = response.body.getReader();

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        const cleanText = chunk
          .split("data:")
          .map(line => {
            if (!line) return "";
            return line.replace(/\n/g, "");
          })
          .join("");

        setInsight((prev) => prev + cleanText);
      }
    } catch (err) {
      console.error(err);

      setInsight("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="atm-container">
      <div className="atm-machine">
        <div className="atm-header">
          <div className="bank-branding">
            <div className="bank-name">{accountInfo.bank}</div>
            <div className="bank-divider"></div>
          </div>

          <div className="account-info-header">
            <div className="account-detail">
              <span className="label">ACCOUNT</span>
              <span className="value">{accountInfo.account}</span>
            </div>

            <div className="account-detail">
              <span className="label">CARDHOLDER</span>
              <span className="value">{accountInfo.holder}</span>
            </div>
          </div>
        </div>

        <div className="atm-screen">
          <div className="screen-content">
            <div className="screen-header">
              <span className="screen-status">ANALYSIS</span>
              <span className="screen-time" id="time"></span>
            </div>

            <div className="screen-display">
              {insight ? (
                <div className="analysis-text">{insight}</div>
              ) : (
                <div className="placeholder-text">
                  Press 'ANALYZE' to retrieve<br />
                  AI-powered transaction insights
                </div>
              )}
            </div>

            <div className="screen-footer">
              {loading && <span className="loading-indicator">● PROCESSING...</span>}
            </div>
          </div>
        </div>

        <div className="atm-keypad">
          <button
            className={`atm-button analyze-btn ${loading ? 'loading' : ''}`}
            onClick={getAiInsights}
            disabled={loading}
          >
            <span className="button-label">ANALYZE</span>
            <span className="button-sublabel">Get AI Insights</span>
          </button>

          <button
            className="atm-button clear-btn"
            onClick={() => setInsight("")}
            disabled={loading}
          >
            <span className="button-label">CLEAR</span>
            <span className="button-sublabel">Reset Screen</span>
          </button>
        </div>

        <div className="atm-footer">
          <div className="speaker"></div>

          <div className="status-indicators">
            <div className={`indicator ${!loading ? 'active' : ''}`}></div>
            <span className="status-text">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;