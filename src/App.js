import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);

  // Efficiently reset all download-related state
  const resetDownloadState = useCallback(() => {
    setMessage('');
    setMessageType('');
    setSuggestions([]);
    setCloudinaryUrl('');
    setVideoInfo(null);
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
      // Use Puppeteer endpoint for better session handling with Instagram CDN
      const response = await axios.post('/api/download-puppeteer', { url });
      if (response.data.success) {
        showMessage('Video extracted and uploaded to Cloudinary successfully!', 'success');
        setUrl('');
        setCloudinaryUrl(response.data.cloudinaryUrl);
        setVideoInfo({
          cloudinaryId: response.data.cloudinaryId,
          format: response.data.format,
          duration: response.data.duration,
          size: response.data.size,
          dimensions: response.data.dimensions,
          createdAt: response.data.createdAt,
          extractionMethod: response.data.extractionMethod
        });
      } else {
        showMessage('Failed to process video', 'error');
      }
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error.response?.data?.error || 'An error occurred while processing the video';
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
                  Processing...
                </>
              ) : (
                <>
                  <span className="download-icon">☁️</span>
                  Process & Upload
                </>
              )}
            </button>
          </form>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          {cloudinaryUrl && (
            <div className="download-link-section">
              <h4>✅ Video Successfully Uploaded to Cloudinary!</h4>
              <div className="video-info">
                <p><strong>Cloudinary ID:</strong> {videoInfo?.cloudinaryId}</p>
                <p><strong>Extraction Method:</strong> {videoInfo?.extractionMethod}</p>
                <p><strong>Format:</strong> {videoInfo?.format}</p>
                <p><strong>Duration:</strong> {videoInfo?.duration} seconds</p>
                <p><strong>Size:</strong> {(videoInfo?.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Dimensions:</strong> {videoInfo?.dimensions?.width} x {videoInfo?.dimensions?.height}</p>
                <p><strong>Uploaded:</strong> {new Date(videoInfo?.createdAt).toLocaleString()}</p>
              </div>
              <a 
                href={cloudinaryUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="download-link-btn"
              >
                🌐 View Video on Cloudinary
              </a>
              <a 
                href={cloudinaryUrl} 
                download={`${videoInfo?.cloudinaryId}.${videoInfo?.format}`}
                className="download-link-btn secondary"
              >
                📥 Download Video
              </a>
              <p className="download-note">
                Your video has been uploaded to Cloudinary and is now accessible online
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
              <li>Copy the URL of the Instagram reel you want to process</li>
              <li>Paste it in the input field above</li>
              <li>Click "Download Reel"</li>
              <li>The video will be extracted and uploaded to Cloudinary</li>
              <li>View or download the video from the provided Cloudinary link</li>
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