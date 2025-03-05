import json
import requests
import random

def extract_metadata(solr_host, solr_port, core_name):
    """Extract metadata from Solr core."""
    
    # Solr API URLs
    base_url = f"http://{solr_host}:{solr_port}/solr/{core_name}"
    update_url = f"{base_url}/update?commit=true"
    query_url = f"{base_url}/select?q=*:*&rows=2"
    core_status_url = f"http://{solr_host}:{solr_port}/solr/admin/cores?action=STATUS&core={core_name}"

    try:
        # Fetch core metadata
        metadata_response = requests.get(core_status_url)
        if metadata_response.status_code == 200:
            core_status = metadata_response.json()
            core_info = core_status["status"].get(core_name, {})
            index_size = core_info.get("index", {}).get("sizeInBytes", "Unknown")
            doc_count = core_info.get("index", {}).get("numDocs", "Unknown")
        else:
            print(f"Error fetching core metadata: {metadata_response.text}")
            index_size, doc_count = "Unknown", "Unknown"

        # Fetch 2 random documents
        query_response = requests.get(query_url)
        if query_response.status_code == 200:
            docs = query_response.json()["response"]["docs"]
            sample_docs = random.sample(docs, min(2, len(docs)))  # Pick 2 random docs if available
        else:
            print(f"Error fetching documents: {query_response.text}")
            sample_docs = []

        # Return metadata
        metadata = {
            "core_name": core_name,
            "index_size_bytes": index_size,
            "document_count": doc_count,
            "sample_documents": sample_docs
        }
        
        return metadata
        
    except Exception as e:
        raise Exception(f"Error extracting metadata: {str(e)}")

def preprocess_data(data):
    """Preprocess data to flatten nested fields."""
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
