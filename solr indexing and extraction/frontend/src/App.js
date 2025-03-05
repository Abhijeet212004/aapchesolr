import React, { useState } from "react";
import axios from "axios";

function App() {
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("8983");
  const [coreName, setCoreName] = useState("document_store");
  const [metadata, setMetadata] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchMetadata = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!host || !port || !coreName) {
        throw new Error("Please fill in all fields");
      }
      const response = await axios.post("http://localhost:5002/get_metadata", {
        host,
        port,
        coreName,
      });
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      setMetadata(response.data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      if (error.response) {
        // Server responded with an error
        setError(error.response.data?.error || "Server error occurred");
      } else if (error.request) {
        // Request was made but no response
        setError("Could not connect to the server. Please make sure the backend is running.");
      } else {
        // Other errors
        setError(error.message || "Failed to fetch metadata");
      }
      setMetadata(null);
    }
    setLoading(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      setSelectedFile(file);
      setError(null);
      // Read and analyze the JSON file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          const metadata = {
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(2) + " KB",
            lastModified: new Date(file.lastModified).toLocaleString(),
            documentCount: Array.isArray(content) ? content.length : 1,
            fields: Array.isArray(content) 
              ? Object.keys(content[0] || {})
              : Object.keys(content),
            preview: Array.isArray(content) 
              ? content.slice(0, 2) 
              : content
          };
          setFileMetadata(metadata);
        } catch (error) {
          setError("Invalid JSON file format");
          setFileMetadata(null);
        }
      };
      reader.readAsText(file);
    } else {
      setError("Please select a valid JSON file");
      setSelectedFile(null);
      setFileMetadata(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }
    if (!host || !port || !coreName) {
      setError("Please fill in all Solr connection details");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("solr_host", host);
    formData.append("solr_port", port);
    formData.append("core_name", coreName);

    try {
      const response = await axios.post("http://localhost:5002/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      setMetadata(response.data);
      setUploadSuccess(true);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.response) {
        setError(error.response.data?.error || "Server error occurred");
      } else if (error.request) {
        setError("Could not connect to the server. Please make sure the backend is running.");
      } else {
        setError(error.message || "Failed to upload file");
      }
    }
    setLoading(false);
  };

  const containerStyle = {
    minHeight: "100vh",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    fontFamily: "'Segoe UI', Arial, sans-serif"
  };

  const cardStyle = {
    maxWidth: "1000px",
    margin: "0 auto",
    background: "white",
    borderRadius: "15px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    padding: "30px",
  };

  const headerStyle = {
    color: "#2c3e50",
    marginBottom: "30px",
    textAlign: "center",
    fontSize: "2.5em",
    fontWeight: "600",
    borderBottom: "3px solid #3498db",
    paddingBottom: "15px"
  };

  const formSectionStyle = {
    background: "#f8f9fa",
    padding: "25px",
    borderRadius: "10px",
    marginBottom: "25px",
  };

  const sectionHeaderStyle = {
    color: "#2c3e50",
    fontSize: "1.3em",
    marginBottom: "20px",
    fontWeight: "500",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "16px",
    transition: "border-color 0.3s ease",
    outline: "none",
    "&:focus": {
      borderColor: "#3498db"
    }
  };

  const buttonStyle = {
    backgroundColor: loading ? "#bdc3c7" : "#3498db",
    color: "white",
    padding: "12px 25px",
    border: "none",
    borderRadius: "8px",
    cursor: loading ? "not-allowed" : "pointer",
    fontSize: "16px",
    fontWeight: "500",
    transition: "transform 0.2s ease, background-color 0.2s ease",
    margin: "10px",
    "&:hover": {
      transform: "translateY(-2px)",
      backgroundColor: loading ? "#bdc3c7" : "#2980b9"
    }
  };

  const fileInputContainerStyle = {
    border: "2px dashed #3498db",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    marginBottom: "20px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#f7f9fc"
    }
  };

  const metadataContainerStyle = {
    background: "#f8f9fa",
    padding: "25px",
    borderRadius: "10px",
    marginTop: "30px",
  };

  const metadataCardStyle = {
    background: "#ffffff",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0"
  };

  const metadataFieldStyle = {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #eee"
  };

  const fieldLabelStyle = {
    color: "#34495e",
    fontWeight: "500"
  };

  const fieldValueStyle = {
    color: "#2c3e50"
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={headerStyle}>Solr Document Management</h1>
        
        <div style={formSectionStyle}>
          <h3 style={sectionHeaderStyle}>Connection Settings</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#34495e" }}>Host:</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="e.g., localhost"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#34495e" }}>Port:</label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="e.g., 8983"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#34495e" }}>Core Name:</label>
              <input
                type="text"
                value={coreName}
                onChange={(e) => setCoreName(e.target.value)}
                placeholder="Enter Solr core name"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div style={formSectionStyle}>
          <h3 style={sectionHeaderStyle}>Document Upload</h3>
          <div 
            style={fileInputContainerStyle}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input
              id="fileInput"
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div style={{ color: "#34495e" }}>
              <i className="fas fa-cloud-upload-alt" style={{ fontSize: "2em", marginBottom: "10px", color: "#3498db" }}></i>
              <p>Drag & drop your JSON file here or click to browse</p>
              {selectedFile && (
                <p style={{ color: "#27ae60", marginTop: "10px" }}>
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button 
            onClick={handleUpload} 
            disabled={loading || !selectedFile} 
            style={{
              ...buttonStyle,
              backgroundColor: (!selectedFile || loading) ? "#bdc3c7" : "#27ae60"
            }}
          >
            {loading ? "Processing..." : "Upload & Index"}
          </button>

          <button 
            onClick={fetchMetadata} 
            disabled={loading} 
            style={buttonStyle}
          >
            {loading ? "Fetching..." : "Get Metadata"}
          </button>
        </div>

        {error && (
          <div style={{ 
            color: "#c0392b",
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#fdeaea",
            borderRadius: "8px",
            borderLeft: "5px solid #e74c3c"
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {uploadSuccess && (
          <div style={{ 
            color: "#27ae60",
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e8f8f5",
            borderRadius: "8px",
            borderLeft: "5px solid #2ecc71"
          }}>
            File uploaded and indexed successfully!
          </div>
        )}

        {fileMetadata && (
          <div style={metadataContainerStyle}>
            <h3 style={{ ...sectionHeaderStyle, color: "#2980b9" }}>File Analysis</h3>
            
            <div style={metadataCardStyle}>
              <h4 style={{ color: "#2c3e50", marginBottom: "15px" }}>File Information</h4>
              <div style={metadataFieldStyle}>
                <span style={fieldLabelStyle}>File Name:</span>
                <span style={fieldValueStyle}>{fileMetadata.fileName}</span>
              </div>
              <div style={metadataFieldStyle}>
                <span style={fieldLabelStyle}>File Size:</span>
                <span style={fieldValueStyle}>{fileMetadata.fileSize}</span>
              </div>
              <div style={metadataFieldStyle}>
                <span style={fieldLabelStyle}>Last Modified:</span>
                <span style={fieldValueStyle}>{fileMetadata.lastModified}</span>
              </div>
              <div style={metadataFieldStyle}>
                <span style={fieldLabelStyle}>Document Count:</span>
                <span style={fieldValueStyle}>{fileMetadata.documentCount}</span>
              </div>
            </div>

            <div style={metadataCardStyle}>
              <h4 style={{ color: "#2c3e50", marginBottom: "15px" }}>Document Structure</h4>
              <div style={metadataFieldStyle}>
                <span style={fieldLabelStyle}>Available Fields:</span>
                <span style={fieldValueStyle}>
                  {fileMetadata.fields.join(", ")}
                </span>
              </div>
            </div>

            <div style={metadataCardStyle}>
              <h4 style={{ color: "#2c3e50", marginBottom: "15px" }}>Content Preview</h4>
              <pre style={{ 
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "6px",
                overflowX: "auto",
                fontSize: "14px",
                lineHeight: "1.5"
              }}>
                {JSON.stringify(fileMetadata.preview, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {metadata && (
          <div style={metadataContainerStyle}>
            <h3 style={{ ...sectionHeaderStyle, color: "#2980b9" }}>Solr Core Metadata</h3>
            <div style={metadataCardStyle}>
              <pre style={{ 
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "6px",
                overflowX: "auto",
                fontSize: "14px",
                lineHeight: "1.5"
              }}>
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
