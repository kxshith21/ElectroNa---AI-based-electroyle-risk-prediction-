# ⚕ SaltGuard: Cirrhosis Mortality Risk Dashboard

### ⚡ Clinical Decision Support System (CDSS)
SaltGuard is a modern, data-driven web application for predicting patient-specific cirrhosis mortality risk using routine laboratory data. Designed with a clinical-first approach, it integrates an advanced **XGBoost Classifier** with a glassmorphic user interface to provide physicians with clear, actionable risk visualization.

---

### 🚀 Key Features
*   **Predictive AI Engine**: Real-time XGBoost inference providing a percentage mortality risk.
*   **Feature Engineering**: Automatically calculates clinical indicators like BUN/Creatinine ratios, renal dysfunction flags, and hyponatremia severity.
*   **Interactive Visualizations**: Dynamic risk gauges and horizontal severity bar charts.
*   **Patient Roster**: Searchable list of admission records linked to a local **SQLite** database.
*   **Secure Portal**: Includes a professional authentication layer for clinical access.
*   **One-Click Reports**: Generate and download printable patient risk profiles.

---

### 💻 Technology Stack
*   **Backend**: Python (Flask, Flask-CORS)
*   **Frontend**: HTML5, CSS3 (Vanilla Glassmorphism), JavaScript (Chart.js)
*   **Machine Learning**: XGBoost, Scikit-learn, Pandas, Joblib
*   **Database**: SQLite3

---

### 🛠️ Quick Installation

1.  **Clone & Install Dependencies**
    ```bash
    git clone https://github.com/YOUR_GITHUB_HERE/saltguard.git
    cd saltguard/ML-engine
    pip install -r requirements.txt
    ```

2.  **Run Locally**
    ```bash
    python app.py
    ```
    Access at **http://localhost:5000** (Default Login: `admin` / `password`)

---

### 🧠 Model Performance
The XGBoost model identifies high-risk mortality profiles based on:
1.  **Renal Status** (Creatinine, BUN)
2.  **Electrolytes** (Sodium / Hyponatremia severity)
3.  **Blood Work** (Hemoglobin, WBC)
4.  **Age Factors**

*Disclaimer: This tool is intended for research and educational purposes only and is not a substitute for clinical judgment.*
