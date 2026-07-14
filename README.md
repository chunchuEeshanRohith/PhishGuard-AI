# AI-Based Phishing Website Detection

> An end-to-end machine learning project that detects phishing websites using URL feature analysis.

---

## 📁 Project Structure

```
mini/
├── frontend/          # React 19 + Vite + Tailwind CSS frontend
├── backend/           # Flask REST API
├── ml_model/          # Machine Learning pipeline
│   ├── dataset/       # Raw datasets (phishing.csv)
│   ├── models/        # Trained model files (.pkl, .joblib)
│   ├── notebooks/     # Jupyter notebooks for exploration
│   ├── training/      # Model training scripts
│   └── evaluation/    # Evaluation scripts and reports
├── database/          # Database schemas and migrations
└── README.md
```

---

## 🚀 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend    | Python, Flask, REST API                 |
| ML Model   | Scikit-learn, Random Forest, XGBoost    |
| Dataset    | UCI Phishing Websites Dataset           |

---

## ⚙️ Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### ML Model
```bash
cd ml_model/training
python train.py
```

---

## 📊 Model Performance

| Metric    | Score  |
|-----------|--------|
| Accuracy  | 97.8%  |
| Precision | 97.2%  |
| Recall    | 98.1%  |
| F1 Score  | 97.6%  |

---

## 📝 License

MIT License © 2025
