# Solr Indexing and Extraction Tool

A web application for managing Apache Solr cores, indexing JSON documents, and extracting metadata.

## Features

- Create and manage Solr cores dynamically
- Upload and index JSON documents
- Extract metadata from Solr cores
- Support for basic field types (strings, numbers, booleans, arrays)
- Clean and modern web interface

## Prerequisites

- Python 3.x
- Node.js and npm
- Apache Solr 8.x or higher

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd solr-indexing-and-extraction
```

2. Set up the backend:
```bash
cd backend
pip install -r requirements.txt
python app.py
```

3. Set up the frontend:
```bash
cd frontend
npm install
npm start
```

## Usage

1. Start your Apache Solr server
2. Open the web application (default: http://localhost:3000)
3. Enter your Solr connection details:
   - Host (default: localhost)
   - Port (default: 8983)
   - Core Name (will be created if it doesn't exist)
4. Upload JSON documents or retrieve metadata from existing cores

## API Endpoints

### POST /upload
Uploads and indexes JSON documents to a Solr core.

### POST /get_metadata
Retrieves metadata about a Solr core.

## Project Structure

```
.
├── backend/
│   ├── app.py              # Flask backend server
│   ├── solr_metadata.py    # Solr metadata extraction
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/               # React source code
│   ├── package.json      # Node dependencies
│   └── public/           # Static assets
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
