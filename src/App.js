import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadedFilename, setDownloadedFilename] = useState('');

  // Efficiently reset all download-related state
  const resetDownloadState = useCallback(() => {
    setMessage('');
    setMessageType('');
    setSuggestions([]);
    setDownloadUrl('');
    setDownloadedFilename('');
  }, []);

  // Efficiently show messages and handle suggestions
  const showMessage = useCallback((msg, type, errorSuggestions = []) => {
    setMessage(msg);
    setMessageType(type);
    setSuggestions(type === 'error' ? errorSuggestions : []);
    if (type !== 'error') {
      setTimeout(() => {
        setMessage('');
        setMessageType('');
        setSuggestions([]);
      }, 5000);
    }
  }, []);

  // Handler for input change
  const handleUrlChange = useCallback((e) => {
    setUrl(e.target.value);
  }, []);

  // Handler for download
  const handleDownload = useCallback(async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      showMessage('Please enter an Instagram URL', 'error');
      return;
    }

    if (!url.includes('instagram.com')) {
      showMessage('Please enter a valid Instagram URL', 'error');
      return;
    }

    setLoading(true);
    resetDownloadState();

    try {
      const response = await axios.post('/api/download', { url });
      if (response.data.success) {
        showMessage(`Video downloaded successfully! Filename: ${response.data.filename}`, 'success');
        setUrl('');
        setDownloadUrl(response.data.downloadUrl);
        setDownloadedFilename(response.data.filename);
      } else {
        showMessage('Failed to download video', 'error');
      }
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error.response?.data?.error || 'An error occurred while downloading the video';
      const errorSuggestions = error.response?.data?.suggestions || [];
      showMessage(errorMessage, 'error', errorSuggestions);
    } finally {
      setLoading(false);
    }
  }, [url, showMessage, resetDownloadState]);

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1 className="title">
            <span className="instagram-icon">📱</span>
            Instagram Reels Downloader
          </h1>
          <p className="subtitle">Download Instagram reels with ease</p>
        </header>

        <main className="main">
          <form onSubmit={handleDownload} className="download-form">
            <div className="input-group">
              <label htmlFor="url" className="label">
                Instagram Reel URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://www.instagram.com/reel/..."
                className="url-input"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`download-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Downloading...
                </>
              ) : (
                <>
                  <span className="download-icon">⬇️</span>
                  Download Reel
                </>
              )}
            </button>
          </form>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          {downloadUrl && (
            <div className="download-link-section">
              <h4>Download Your Video:</h4>
              <a 
                href={downloadUrl} 
                download={downloadedFilename}
                className="download-link-btn"
              >
                📥 Download {downloadedFilename}
              </a>
              <p className="download-note">
                Click the link above to download the video to your computer
              </p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="suggestions">
              <h4>Suggestions:</h4>
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="instructions">
            <h3>How to use:</h3>
            <ol>
              <li>Copy the URL of the Instagram reel you want to download</li>
              <li>Paste it in the input field above</li>
              <li>Click "Download Reel"</li>
              <li>The video will be processed and a download button will appear</li>
              <li>Click the download button to save the video to your computer</li>
            </ol>
            
            <div className="note">
              <strong>Important Note:</strong> Instagram has very strong anti-scraping measures and frequently blocks automated requests. 
              This tool uses multiple methods to try to bypass these restrictions, but success rates may vary.
            </div>
            
            <div className="limitations">
              <h4>Current Limitations:</h4>
              <ul>
                <li>Instagram actively blocks automated tools</li>
                <li>Success rate depends on Instagram's current blocking measures</li>
                <li>Private posts cannot be accessed</li>
                <li>Rate limiting may occur with frequent requests</li>
                <li>Some posts may be region-restricted</li>
              </ul>
            </div>
            
            <div className="tips">
              <h4>Tips for Better Success:</h4>
              <ul>
                <li>Use public posts only</li>
                <li>Wait a few minutes between attempts</li>
                <li>Try different posts if one fails</li>
                <li>Check that the URL is correct and the post is accessible</li>
              </ul>
            </div>
          </div>
        </main>

        <footer className="footer">
          <p>© 2024 Instagram Reels Downloader. For educational purposes only.</p>
        </footer>
      </div>
    </div>
  );
}

export default App; 