import React, { useState } from "react";
import axios from "axios";

function UploadForm({ onMetadataUpdate }) {
  const [solrHost, setSolrHost] = useState("");
  const [solrPort, setSolrPort] = useState("");
  const [coreName, setCoreName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a JSON file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("solr_host", solrHost);
    formData.append("solr_port", solrPort);
    formData.append("core_name", coreName);
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData);
      onMetadataUpdate(response.data);
    } catch (error) {
      alert("Error uploading file!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="bg-white p-6 shadow-lg rounded-lg w-96" onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium">Solr Host</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={solrHost}
          onChange={(e) => setSolrHost(e.target.value)}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium">Solr Port</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={solrPort}
          onChange={(e) => setSolrPort(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Core Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={coreName}
          onChange={(e) => setCoreName(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Upload JSON File</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
      </div>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
        {loading ? "Uploading..." : "Submit"}
      </button>
    </form>
  );
}

export default UploadForm;
