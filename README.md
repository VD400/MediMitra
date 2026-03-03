# 🩺 MediMitra - Your Digital Health Companion

MediMitra is an advanced AI-powered health platform designed to simplify medical record management and provide actionable health insights. From deciphering handwritten prescriptions to analyzing complex lab reports, MediMitra bridge the gap between clinical data and patient understanding.

## 🚀 Key Features

- **Handwriting Decipher AI**: Upload handwritten prescriptions and get a structured, digital summary including dosages, frequency, and "Normal Human" context for each medicine.
- **Health Score Analyzer**: Analyze historical medical reports (up to 3 years) or single lab results to get a comprehensive health score, trend charts, and risk assessments.
- **Interactive Health Trends**: Visualize your health data through dynamic charts (Line, Area, and Pie charts) showing parameter snapshots and historical progress.
- **Smart Medicine Search**: Find local pharmacies near you with real-time distance calculation and estimated pricing for your entire prescription.
- **MediBot AI**: A conversational medical assistant to help answer your health-related queries instantly.
- **Secure Report Downloads**: OTP-protected PDF generation for your health assessments, ensuring your data remains private.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Lucide Icons.
- **Visualizations**: Recharts (for medical data graphing).
- **AI/ML**: Hugging Face Inference API (Llama 3.1 8B), Tesseract.js (for OCR).
- **Backend**: Node.js, Express.
- **Services**: Nodemailer (for OTP verification), OpenStreetMap/Overpass API (for pharmacy locations).
- **Utilities**: jsPDF & html2canvas (for report generation).

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- A Hugging Face API Token

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/medimitra.git
cd medimitra
```

### 2. Backend Configuration
Navigate to the `server` directory and create a `.env` file:
```bash
cd server
touch .env
```
Add the following credentials:
```env
HF_TOKEN=your_huggingface_token
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_app_password
PORT=5000
```

### 3. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 4. Run the Application
```bash
# Start the backend server (from /server)
node index.js

# Start the frontend dev server (from root)
npm run dev
```

## 🔒 Security & Privacy
MediMitra prioritizes user privacy. All medical reports are processed using secure API calls, and report downloads are protected by email-based OTP verification.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---
*Made with ❤️ by Team Dhruva*