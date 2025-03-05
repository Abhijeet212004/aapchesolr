import React from "react";

function MetadataDisplay({ metadata }) {
  return (
    <div className="mt-6 p-6 bg-white shadow-md rounded-lg w-96">
      <h2 className="text-xl font-bold">Extracted Metadata</h2>
      <p><strong>Core Name:</strong> {metadata.core_name}</p>
      <p><strong>Index Size (bytes):</strong> {metadata.index_size_bytes}</p>
      <p><strong>Document Count:</strong> {metadata.document_count}</p>

      <h3 className="mt-4 font-bold">Sample Documents</h3>
      {metadata.sample_documents.map((doc, index) => (
        <pre key={index} className="bg-gray-100 p-2 rounded">{JSON.stringify(doc, null, 2)}</pre>
      ))}
    </div>
  );
}

export default MetadataDisplay;
