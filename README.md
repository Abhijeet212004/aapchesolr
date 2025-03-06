# Solr Metadata Extractor

## 📌 Project Description
The **Solr Metadata Extractor** is a Python-based project that:
- Reads structured JSON data from a file (`data.json`).
- Extracts only **first-level fields** while ignoring nested data.
- Uploads the extracted data to **Apache Solr**.
- Fetches **core metadata**, including document count and sample documents.
- Saves the metadata as a JSON file (`solr_metadata.json`).
- Provides an interface for integration with a **React UI**.

## 🛠️ Installation & Setup
### **1. Install Apache Solr**
Download and install Apache Solr from the official website:  
🔗 [https://solr.apache.org/downloads.html](https://solr.apache.org/downloads.html)

Start Solr using:
```sh
solr start
```
Create a new core:
```sh
solr create -c my_core
```

### **2. Install Dependencies**
Ensure you have **Python 3+** installed. Then, install the required Python packages:
```sh
pip install requests
```
```

## 🚀 Usage
### **Command-Line Execution**
Run the script to extract and index metadata into Solr:
```sh
python solr_metadata.py
```
The script will prompt for:
- **Solr host** (e.g., `http://localhost`)
- **Solr port** (e.g., `8983`)
- **Core name** (e.g., `my_core`)

If the core exists, it:
1. Deletes existing data.
2. Indexes first-level JSON data.
3. Fetches Solr metadata (document count, index size, sample docs).
4. Saves metadata in `solr_metadata.json`.

## 🔗 Solr API Usage
### **1. Checking if Core Exists**
```sh
GET http://localhost:8983/solr/admin/cores?action=STATUS&core=my_core
```
### **2. Deleting Existing Data**
```json
POST http://localhost:8983/solr/my_core/update?commit=true
{
    "delete": {"query": "*:*"}
}
```
### **3. Indexing Processed Data**
```json
POST http://localhost:8983/solr/my_core/update?commit=true
[ 
    { "id": "1", "title": "Introduction to Solr", "author": "John Doe", "published_year": 2022 } 
]
```
### **4. Querying Sample Documents**
```sh
GET http://localhost:8983/solr/my_core/select?q=*:*&rows=2
```

## 📜 Output Example (`solr_metadata.json`)
```json
{
  "core_name": "my_core",
  "index_size_bytes": "123456",
  "document_count": 3,
  "sample_documents": [
    { "id": "1", "title": "Introduction to Solr", "author": "John Doe" },
    { "id": "2", "title": "Advanced Solr Techniques", "author": "Jane Smith" }
  ]
}
```

## 🎯 Future Improvements
- **Improved React UI for better visualization**
- **Real-time data updates in Solr**


