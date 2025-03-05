from flask import Flask, request, jsonify
import os
import json
import requests
import time
from flask_cors import CORS
from solr_metadata import extract_metadata

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def create_solr_core(host, port, core_name):
    """Create a new Solr core if it doesn't exist and initialize its schema."""
    try:
        admin_url = f"http://{host}:{port}/solr/admin/cores"
        
        # Check if core exists
        status_params = {"action": "STATUS", "core": core_name}
        response = requests.get(admin_url, params=status_params)
        status_data = response.json()
        
        if response.status_code == 200 and core_name in status_data.get("status", {}):
            return True, "Core already exists"
        
        # Create new core with basic configuration
        create_params = {
            "action": "CREATE",
            "name": core_name,
            "instanceDir": core_name,
            "configSet": "_default"
        }
        create_response = requests.get(admin_url, params=create_params)
        
        if create_response.status_code != 200:
            return False, f"Failed to create core: {create_response.text}"
            
        # Wait a moment for core to initialize
        time.sleep(2)
            
        # Define schema fields
        schema_url = f"http://{host}:{port}/solr/{core_name}/schema"
        
        # Add fields to schema
        fields = [
            {
                "name": "id",
                "type": "string",
                "required": True,
                "stored": True
            },
            {
                "name": "title",
                "type": "text_general",
                "stored": True
            },
            {
                "name": "author",
                "type": "text_general",
                "stored": True
            },
            {
                "name": "content",
                "type": "text_general",
                "stored": True
            },
            {
                "name": "published_date",
                "type": "pdate",
                "stored": True
            },
            {
                "name": "tags",
                "type": "strings",
                "multiValued": True,
                "stored": True
            },
            # Dynamic field for any additional fields
            {
                "name": "*_t",
                "type": "text_general",
                "stored": True
            },
            {
                "name": "*_s",
                "type": "string",
                "stored": True
            }
        ]
        
        # Add each field to schema
        for field in fields:
            try:
                field_response = requests.post(
                    schema_url,
                    json={"add-field": field},
                    headers={"Content-type": "application/json"}
                )
                # Ignore if field already exists
                if field_response.status_code not in [200, 400]:
                    print(f"Warning: Could not add field {field['name']}: {field_response.text}")
            except Exception as e:
                print(f"Warning: Error adding field {field['name']}: {str(e)}")
                
        return True, "Core created and schema initialized successfully"
            
    except Exception as e:
        return False, f"Error creating core: {str(e)}"

def process_document(doc):
    """Process a document to make it Solr-compatible."""
    processed = {}
    
    # Ensure document has an ID
    if "id" not in doc:
        doc["id"] = str(hash(json.dumps(doc, sort_keys=True)))
    
    # Only process top-level fields
    for key, value in doc.items():
        # Skip nested objects and complex structures
        if isinstance(value, (str, int, float, bool)) or (isinstance(value, list) and all(isinstance(x, (str, int, float, bool)) for x in value)):
            processed[key] = value
            
    return processed

@app.route("/upload", methods=["POST"])
def upload_file():
    """Handles JSON file upload and indexing in Solr."""
    
    solr_host = request.form["solr_host"].strip()
    solr_port = request.form["solr_port"].strip()
    core_name = request.form["core_name"].strip()

    # First, ensure the core exists and schema is initialized
    success, message = create_solr_core(solr_host, solr_port, core_name)
    if not success:
        return jsonify({"error": message}), 500

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, "data.json")
    file.save(file_path)

    try:
        # Read JSON file
        with open(file_path, "r") as f:
            raw_data = json.load(f)

        # Ensure data is a list
        if not isinstance(raw_data, list):
            raw_data = [raw_data]

        # Process documents for Solr compatibility
        processed_docs = [process_document(doc) for doc in raw_data]

        # Solr Indexing
        base_url = f"http://{solr_host}:{solr_port}/solr/{core_name}"
        update_url = f"{base_url}/update?commit=true"

        # Clear existing data
        clear_response = requests.post(update_url, json={"delete": {"query": "*:*"}})
        if clear_response.status_code != 200:
            return jsonify({"error": f"Error clearing existing data: {clear_response.text}"}), 500

        # Index new data
        index_response = requests.post(update_url, json=processed_docs)
        if index_response.status_code != 200:
            return jsonify({"error": f"Error indexing data: {index_response.text}"}), 500

        # Wait a moment for Solr to commit changes
        time.sleep(1)

        # Fetch updated metadata
        try:
            metadata = extract_metadata(solr_host, solr_port, core_name)
            return jsonify({
                "message": f"Successfully created core '{core_name}' and indexed {len(processed_docs)} documents",
                "metadata": metadata
            })
        except Exception as e:
            return jsonify({
                "message": f"Data indexed successfully but error fetching metadata: {str(e)}",
                "documentCount": len(processed_docs)
            })

    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON file format"}), 400
    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@app.route("/get_metadata", methods=["POST"])
def get_metadata():
    """Handles metadata extraction from Solr."""
    data = request.json
    host = data.get("host", "").strip()
    port = data.get("port", "").strip()
    core_name = data.get("coreName", "").strip()
    
    if not all([host, port, core_name]):
        return jsonify({"error": "Missing required parameters"}), 400
    
    # First, check if core exists
    success, message = create_solr_core(host, port, core_name)
    if not success:
        return jsonify({"error": message}), 500
    
    try:
        metadata = extract_metadata(host, port, core_name)
        return jsonify({
            "message": f"Successfully retrieved metadata for core '{core_name}'",
            "metadata": metadata
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5002)
