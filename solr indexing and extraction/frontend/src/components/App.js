import React, { useState } from "react";
import axios from "axios";

function App() {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [coreName, setCoreName] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/get_metadata", {
        host,
        port,
        coreName,
      });
      setMetadata(response.data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      setMetadata({ error: "Failed to fetch metadata" });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Solr Indexing & Metadata Extraction</h2>
      <div>
        <label>Host:</label>
        <input type="text" value={host} onChange={(e) => setHost(e.target.value)} />
      </div>
      <div>
        <label>Port:</label>
        <input type="text" value={port} onChange={(e) => setPort(e.target.value)} />
      </div>
      <div>
        <label>Core Name:</label>
        <input type="text" value={coreName} onChange={(e) => setCoreName(e.target.value)} />
      </div>
      <button onClick={fetchMetadata} disabled={loading}>
        {loading ? "Fetching..." : "Get Metadata"}
      </button>

      {metadata && (
        <div>
          <h3>Metadata Output</h3>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
