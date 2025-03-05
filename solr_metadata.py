import json
import requests
import random

# Take user inputs for Solr details
SOLR_HOST = input("Enter Solr host (e.g., http://localhost): ").strip()
SOLR_PORT = input("Enter Solr port (e.g., 8983): ").strip()
CORE_NAME = input("Enter Solr core name: ").strip()

# Solr API URLs
BASE_URL = f"{SOLR_HOST}:{SOLR_PORT}/solr/{CORE_NAME}"
UPDATE_URL = f"{BASE_URL}/update?commit=true"
QUERY_URL = f"{BASE_URL}/select?q=*:*&rows=2"
CORE_STATUS_URL = f"{SOLR_HOST}:{SOLR_PORT}/solr/admin/cores?action=STATUS&core={CORE_NAME}"

# Load data from data.json
with open("data.json", "r") as file:
    raw_data = json.load(file)

# Preprocess data to flatten nested fields
def preprocess_data(data):
    processed = []
    for doc in data:
        new_doc = {
            "id": doc["id"],
            "email": doc.get("email", ""),
            "roles": doc.get("roles", [])
        }

        # Flatten purchase history
        if "purchase_history" in doc:
            new_doc["purchase_history_dates"] = [p["date"] for p in doc["purchase_history"]]
            new_doc["purchase_item_ids"] = [p["item_id"] for p in doc["purchase_history"]]
            new_doc["purchase_prices"] = [p["price"] for p in doc["purchase_history"]]

        # Flatten preferences
        if "preferences" in doc:
            new_doc["preferences_language"] = doc["preferences"].get("language", "")
            if "notifications" in doc["preferences"]:
                new_doc["notifications_email"] = doc["preferences"]["notifications"].get("email", False)
                new_doc["notifications_sms"] = doc["preferences"]["notifications"].get("sms", False)

        processed.append(new_doc)
    return processed

# Processed data for indexing
processed_data = preprocess_data(raw_data)

# Step 1: Delete existing data in the core
delete_response = requests.post(UPDATE_URL, json={"delete": {"query": "*:*"}})
if delete_response.status_code == 200:
    
else:
    print(f"Error deleting data: {delete_response.text}")

# Step 2: Index new data
index_response = requests.post(UPDATE_URL, json=processed_data)
if index_response.status_code == 200:
    print("New data indexed successfully.")
else:
    print(f"Error indexing data: {index_response.text}")

# Step 3: Fetch core metadata
metadata_response = requests.get(CORE_STATUS_URL)
if metadata_response.status_code == 200:
    core_status = metadata_response.json()
    core_info = core_status["status"].get(CORE_NAME, {})
    index_size = core_info.get("index", {}).get("sizeInBytes", "Unknown")
    doc_count = core_info.get("index", {}).get("numDocs", "Unknown")
else:
    print(f"Error fetching core metadata: {metadata_response.text}")
    index_size, doc_count = "Unknown", "Unknown"

# Step 4: Fetch 2 random documents
query_response = requests.get(QUERY_URL)
if query_response.status_code == 200:
    docs = query_response.json()["response"]["docs"]
    sample_docs = random.sample(docs, min(2, len(docs)))  # Pick 2 random docs if available
else:
    print(f"Error fetching documents: {query_response.text}")
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

print("Metadata extraction complete. Saved to solr_metadata.json.")
