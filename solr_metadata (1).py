import json
import requests
import random

# Get user inputs for Solr details
SOLR_HOST = input("Enter Solr host (e.g., http://localhost): ").strip()
SOLR_PORT = input("Enter Solr port (e.g., 8983): ").strip()
CORE_NAME = input("Enter Solr core name: ").strip()

# Solr API URLs
BASE_URL = f"{SOLR_HOST}:{SOLR_PORT}/solr/{CORE_NAME}"
UPDATE_URL = f"{BASE_URL}/update?commit=true"
QUERY_URL = f"{BASE_URL}/select?q=*:*&rows=2"
CORE_STATUS_URL = f"{SOLR_HOST}:{SOLR_PORT}/solr/admin/cores?action=STATUS&core={CORE_NAME}"

# Check if the core exists
def check_core_exists():
    response = requests.get(CORE_STATUS_URL)
    if response.status_code == 200:
        core_status = response.json()
        return CORE_NAME in core_status.get("status", {})
    print(f"Error checking core status: {response.text}")
    return False

if not check_core_exists():
    print(f"\u274c Error: Core '{CORE_NAME}' does not exist.")
    exit(1)

# Load data from data.json
try:
    with open("data.json", "r") as file:
        raw_data = json.load(file)
except FileNotFoundError:
    print("\u274c Error: data.json file not found.")
    exit(1)
except json.JSONDecodeError:
    print("\u274c Error: Invalid JSON format in data.json.")
    exit(1)

# Preprocess data to extract only first-level fields
def preprocess_data(data):
    processed = []
    for doc in data:
        new_doc = {key: value for key, value in doc.items() if not isinstance(value, dict)}
        new_doc["id"] = new_doc.get("id", str(random.randint(1000, 9999)))  # Ensure ID exists
        processed.append(new_doc)
    return processed

# Processed data for indexing
processed_data = preprocess_data(raw_data)

# Step 1: Delete existing data in the core
delete_response = requests.post(UPDATE_URL, json={"delete": {"query": "*:*"}})
if delete_response.status_code == 200:
    print("\u2705 Existing data deleted successfully.")
else:
    print(f"\u26a0 Error deleting data: {delete_response.text}")

# Step 2: Index new data
index_response = requests.post(UPDATE_URL, json=processed_data)
if index_response.status_code == 200:
    print(f"\u2705 Indexed {len(processed_data)} documents successfully.")
else:
    print(f"\u26a0 Error indexing data: {index_response.text}")

# Step 3: Fetch core metadata
metadata_response = requests.get(CORE_STATUS_URL)
if metadata_response.status_code == 200:
    core_status = metadata_response.json()
    core_info = core_status["status"].get(CORE_NAME, {})
    index_size = core_info.get("index", {}).get("sizeInBytes", "Unknown")
    doc_count = core_info.get("index", {}).get("numDocs", "Unknown")
else:
    print(f"\u26a0 Error fetching core metadata: {metadata_response.text}")
    index_size, doc_count = "Unknown", "Unknown"

# Step 4: Fetch 2 random documents
query_response = requests.get(QUERY_URL)
if query_response.status_code == 200:
    docs = query_response.json()["response"]["docs"]
    sample_docs = random.sample(docs, min(2, len(docs)))  # Pick 2 random docs if available
else:
    print(f"\u26a0 Error fetching documents: {query_response.text}")
    sample_docs = []

# Step 5: Save metadata to JSON file
metadata = {
    "core_name": CORE_NAME,
    "index_size_bytes": index_size,
    "document_count": doc_count,
    "sample_documents": sample_docs
}

with open("solr_metadata.json", "w") as file:
    json.dump(metadata, file, indent=4)

print("\u2705 Metadata extraction complete. Saved to solr_metadata.json.")
