# Koch 3PP - Patent Analysis Tool

A modern full-stack web application for AI-powered patent analysis using OpenAI's GPT models. Upload patent data in CSV/Excel format, configure analysis parameters, and get intelligent insights with a beautiful, responsive interface.

## 🚀 Features

- **Smart File Upload**: Drag-and-drop support for CSV and Excel files
- **Dynamic Column Mapping**: Automatically detect and map patent data columns
- **AI-Powered Analysis**: Configurable OpenAI prompts for patent analysis
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Real-time Results**: Paginated, sortable, and searchable results
- **Export Functionality**: Download analysis results as CSV
- **Docker Support**: Full containerization with Docker Compose

## 🏗️ Project Structure

```
koch-3pp/
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── analyzer.py           # OpenAI analysis logic
│   │   ├── config.py             # Environment configuration
│   │   └── routes.py             # API endpoints
│   ├── main.py                   # FastAPI app entrypoint
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Backend container config
│   └── test.xlsx                 # Sample test data
├── frontend/                     # React + Vite Frontend
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── PatentForm.jsx    # Main form component
│   │   │   └── ResultsTable.jsx  # Results display component
│   │   ├── App.jsx               # Main app component
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx              # React entrypoint
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile                # Frontend container config
├── .env                          # Environment variables
├── .gitignore
├── .python-version               # Python version specification
├── docker-compose.yml            # Multi-service orchestration
├── package.json                  # Root package.json (Tailwind)
├── postcss.config.js             # PostCSS configuration
├── pyproject.toml                # Python project configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── uv.lock                       # UV lock file
├── hello.py                      # Sample Python script
├── test.py                       # Test script
└── README.md                     # This file
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **Python 3.12+**: Latest Python version with type hints
- **OpenAI API**: GPT models for intelligent patent analysis
- **Pandas**: Data manipulation and analysis
- **OpenPyXL**: Excel file processing
- **Uvicorn**: ASGI server for FastAPI

### Frontend
- **React 19**: Latest React with modern hooks and features
- **Vite**: Fast build tool and development server
- **Tailwind CSS 4**: Utility-first CSS framework
- **JavaScript (JSX)**: Modern ES6+ syntax
- **Responsive Design**: Mobile-first approach

### DevOps & Tools
- **Docker & Docker Compose**: Containerization and orchestration
- **UV**: Fast Python package manager
- **ESLint**: JavaScript linting
- **PostCSS**: CSS processing
- **Git**: Version control

## 🚦 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker (optional)
- OpenAI API Key

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd koch-3pp
```

2. Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
VITE_API_URL=http://localhost:8000
```

### Option 1: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Option 2: Manual Setup

#### Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies using UV (recommended)
uv sync

# Or use pip
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📚 API Documentation

### Endpoints

#### `POST /columns`
Upload a file and get available columns for mapping.

**Request:**
- Form data with `file` field (CSV or Excel)

**Response:**
```json
{
  "columns": ["Title", "Abstract", "Claims", "Patent_ID"]
}
```

#### `POST /analyze`
Analyze patents with AI.

**Request:**
- Form data with:
  - `file`: Patent data file
  - `title_col`: Column name for patent titles
  - `abstract_col`: Column name for abstracts
  - `claims_col`: Column name for claims
  - `custom_prompt`: AI analysis prompt
  - `page`: Page number (optional)
  - `search`: Search query (optional)
  - `sort_by`: Sort field (optional)
  - `sort_order`: Sort order (optional)

**Response:**
```json
{
  "results": [
    {
      "title": "Patent Title",
      "relevance_score": 8.5,
      "reasoning": "Analysis reasoning...",
      "follow_up_recommended": true,
      "summary": "Brief summary..."
    }
  ],
  "metadata": {
    "page": 1,
    "total_pages": 5,
    "total_items": 50
  }
}
```

## 🎨 UI Features

- **Modern Design**: Glass morphism effects and gradient backgrounds
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, smooth animations, and transitions
- **Accessible**: Proper focus states and keyboard navigation
- **Loading States**: Beautiful loading animations and feedback
- **Error Handling**: User-friendly error messages and validation

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key
- `VITE_API_URL`: Backend API URL for frontend

### Customization
- Modify AI prompts in the frontend interface
- Adjust pagination and sorting in `backend/app/routes.py`
- Customize UI colors and styling in `tailwind.config.js`

## 📝 Usage

1. **Upload File**: Drag and drop or select a CSV/Excel file containing patent data
2. **Map Columns**: Select which columns contain patent titles, abstracts, and claims
3. **Configure AI**: Customize the analysis prompt for your specific needs
4. **Analyze**: Start the AI analysis process
5. **Review Results**: Browse, sort, and search through the analysis results
6. **Export**: Download results as CSV for further processing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
