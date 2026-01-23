// Import useState and useEffect hooks from React library
// useState: Used to manage component state (data that can change)
// useEffect: Used to run side effects (like setting up timers, fetching data)
import { useState, useEffect } from 'react';

// Import the CSS file for styling this component
import './App.css';

// Main App component function - this is the root component of our banking ATM app
function App() {
  // useState creates a state variable "insight" and a function "setInsight" to update it
  // "" is the initial value (empty string)
  // This stores the AI transaction analysis text
  const [insight, setInsight] = useState("");

  // State variable to track if data is currently being loaded/processed
  // false = not loading, true = loading in progress
  const [loading, setLoading] = useState(false);

  // State variable to store the current time as a string
  // Updated every second to show live time on ATM screen
  const [time, setTime] = useState("");

  // State variable to store account information
  // This object contains account number, cardholder name, and bank name
  // The [] means this data doesn't change after initial setup
  const [accountInfo] = useState({
    account: "••••••5892",
    holder: "CARDHOLDER",
    bank: "GDC BANK"
  });

  // useEffect hook: Runs code when component first loads ([] means run once)
  // This sets up the live clock display on the ATM screen
  useEffect(() => {
    // Function to get current time and format it as HH:MM:SS
    const updateTime = () => {
      // Create a new Date object with current date/time
      const now = new Date();
      // Convert to local time string and update state
      setTime(now.toLocaleTimeString());
    };

    // Call updateTime immediately to show time right away
    updateTime();

    // setInterval runs a function repeatedly every X milliseconds
    // 1000 milliseconds = 1 second, so updateTime runs every second
    const timer = setInterval(updateTime, 1000);

    // Cleanup function: runs when component unmounts to prevent memory leaks
    // clearInterval stops the timer so it doesn't keep running after component is removed
    return () => clearInterval(timer);
  }, []); // Empty dependency array [] means this effect runs only once when component loads

  // Async function to fetch AI insights from the backend API
  // async/await allows us to wait for data without blocking the UI
  const getAiInsights = async () => {
    // Set loading to true to show user that processing is happening
    setLoading(true);

    // Clear previous insight text to show fresh results
    setInsight("");

    // Try-catch block: "try" runs code, "catch" handles errors if they occur
    try {
      // fetch() makes an HTTP request to the backend server
      // await waits for the response to come back before continuing
      const response = await fetch('http://localhost:8080/api/v1/ai/transactions/insights/stream', {
        method: 'POST', // POST request sends data to the server
        headers: { 'Content-Type': 'application/json' }, // Tell server we're sending JSON
        body: JSON.stringify({ accountNumber: "2026395892" }) // Convert object to JSON string
      });

      // Check if response was successful (status 200-299)
      // throw Error if not successful to go to catch block
      if (!response.ok) throw new Error("Backend unreachable");

      // Check if response has a body (stream of data)
      // For Server-Sent Events (SSE), we need to read from the stream
      if (!response.body) {
        throw new Error("ReadableStream not yet supported or empty response");
      }

      // getReader() gets access to read the stream data in chunks
      const reader = response.body.getReader();

      // TextDecoder converts bytes to readable text
      const decoder = new TextDecoder();

      // Infinite loop to read stream chunks one at a time
      while (true) {
        // read() gets the next chunk of data from the stream
        // done: boolean - true when stream is complete
        // value: the actual data (bytes)
        const { done, value } = await reader.read();

        // If done is true, the stream is finished - exit the loop
        if (done) break;

        // Decode the bytes to text string
        const chunk = decoder.decode(value);

        // Parse the Server-Sent Events format
        // SSE sends data in "data: {JSON}" format
        // This regex finds all JSON objects after "data:"
        const regex = /data:\s*({.+?})\n?/g;
        let match;
        let cleanText = "";

        // Loop through all matches of the regex pattern
        while ((match = regex.exec(chunk)) !== null) {
          // Extract the JSON string from the match
          const jsonStr = match[1];

          // Skip if this is the end marker
          if (jsonStr.includes("[DONE]")) continue;

          // Try to parse the JSON to get the actual text content
          try {
            // Parse JSON string to object
            const parsed = JSON.parse(jsonStr);

            // Navigate through object structure to get the text content
            // choices[0] = first choice, delta = incremental change, content = actual text
            const content = parsed.choices?.[0]?.delta?.content || "";

            // Add the text to our accumulator
            cleanText += content;
          } catch (e) {
            // If JSON parsing fails, just use the raw string as fallback
            cleanText += jsonStr;
          }
        }

        // Update insight state by appending new text to previous text
        // (prev) => prev + cleanText is a function that takes previous state and returns new state
        setInsight((prev) => prev + cleanText);
      }
    } catch (err) {
      // If any error occurs, log it to browser console for debugging
      console.error(err);

      // Show error message on ATM screen
      setInsight("Error: " + err);
    } finally {
      // finally block runs whether error occurred or not
      // Set loading to false to hide loading indicator
      setLoading(false);
    }
  };

  // Return the JSX (HTML-like code) that renders on screen
  // This is the UI structure of our ATM machine
  return (
    // Main container div with CSS class for styling
    <div className="atm-container">
      {/* ATM Machine outer shell */}
      <div className="atm-machine">
        {/* ATM Header Section - Shows bank name and account info */}
        <div className="atm-header">
          {/* Bank branding area */}
          <div className="bank-branding">
            {/* Display the bank name from state */}
            <div className="bank-name">{accountInfo.bank}</div>
            {/* Decorative divider line */}
            <div className="bank-divider"></div>
          </div>

          {/* Account information display area */}
          <div className="account-info-header">
            {/* First account detail: Account number */}
            <div className="account-detail">
              {/* Label for account number */}
              <span className="label">ACCOUNT</span>
              {/* Display the masked account number from state */}
              <span className="value">{accountInfo.account}</span>
            </div>

            {/* Second account detail: Cardholder name */}
            <div className="account-detail">
              {/* Label for cardholder name */}
              <span className="label">CARDHOLDER</span>
              {/* Display the cardholder name from state */}
              <span className="value">{accountInfo.holder}</span>
            </div>
          </div>
        </div>

        {/* ATM Screen Section - Shows analysis results */}
        <div className="atm-screen">
          {/* Container for screen content */}
          <div className="screen-content">
            {/* Screen header with title and time */}
            <div className="screen-header">
              {/* Static title label */}
              <span className="screen-status">ANALYSIS</span>
              {/* Live time display (updated every second by useEffect) */}
              <span className="screen-time" id="time"></span>
            </div>

            {/* Main display area for analysis results */}
            <div className="screen-display">
              {/* Ternary operator: if insight exists, show it; otherwise show placeholder */}
              {insight ? (
                // If insight is not empty, display the analysis text
                <div className="analysis-text">{insight}</div>
              ) : (
                // If insight is empty, show placeholder instruction text
                <div className="placeholder-text">
                  Press 'ANALYZE' to retrieve<br />
                  AI-powered transaction insights
                </div>
              )}
            </div>

            {/* Footer area showing loading status */}
            <div className="screen-footer">
              {/* If loading is true, show loading indicator */}
              {loading && <span className="loading-indicator">● PROCESSING...</span>}
            </div>
          </div>
        </div>

        {/* ATM Keypad/Buttons Section */}
        <div className="atm-keypad">
          {/* ANALYZE Button */}
          <button
            className={`atm-button analyze-btn ${loading ? 'loading' : ''}`} // Add 'loading' class if loading is true
            onClick={getAiInsights} // When clicked, call getAiInsights function
            disabled={loading} // Disable button while loading
          >
            {/* Button main label */}
            <span className="button-label">ANALYZE</span>
            {/* Button secondary label */}
            <span className="button-sublabel">Get AI Insights</span>
          </button>

          {/* CLEAR Button */}
          <button
            className="atm-button clear-btn" // CSS class for styling
            onClick={() => setInsight("")} // When clicked, clear the insight text (empty string)
            disabled={loading} // Disable button while loading
          >
            {/* Button main label */}
            <span className="button-label">CLEAR</span>
            {/* Button secondary label */}
            <span className="button-sublabel">Reset Screen</span>
          </button>
        </div>

        {/* ATM Footer Section - Speaker and status indicators */}
        <div className="atm-footer">
          {/* Decorative speaker element */}
          <div className="speaker"></div>

          {/* Status indicator section */}
          <div className="status-indicators">
            {/* Status light indicator */}
            {/* Template literal with conditional: add 'active' class if not loading */}
            <div className={`indicator ${!loading ? 'active' : ''}`}></div>
            {/* Status text label */}
            <span className="status-text">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export default: Makes this component available to import in other files (like main.tsx)
export default App;