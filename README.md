# ElectroNa – AI Clinical Decision Support for Cirrhosis & GI Bleeding Risk Analysis

## Introduction
**ElectroNa** is an AI-powered Clinical Decision Support System designed for early risk stratification of liver cirrhosis complications and Gastrointestinal (GI) bleeding using electrolyte imbalance, renal dysfunction markers, and explainable AI techniques.

The system combines Machine Learning, rule-based clinical intelligence, and SHAP explainability to assist healthcare professionals in identifying high-risk patients through laboratory findings such as Sodium, Creatinine, BUN, Hemoglobin, and MELD-based severity indicators.

ElectroNa provides a modern interactive dashboard with real-time clinical insights, risk contribution analysis, differential diagnosis support, complication prediction, and automated patient reporting.

The project aims to support preventive hepatology and emergency clinical assessment by transforming complex laboratory data into understandable and actionable insights.

## Key Points
- **Goal**: Early detection of cirrhosis severity and GI bleeding-associated complications.
- **Method**: Machine Learning + Clinical Rule Engine + SHAP Explainability.
- **Features**: Risk prediction, differential diagnosis, complication analysis, and automated clinical reporting.
- **Explainability**: SHAP-based contribution analysis for transparent predictions.
- **Clinical Indicators**: Sodium, Creatinine, BUN, Hemoglobin, WBC, MELD Score.
- **Benefit**: Faster clinical decision-making and scalable preventive healthcare support.
- **Deployment**: Interactive AI-powered web dashboard.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Dataset](#dataset)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Model Architecture](#model-architecture)
6. [Features](#features)
7. [Results](#results)
8. [Project Screenshots](#project-screenshots)
9. [Future Scope](#future-scope)
10. [Technologies Used](#technologies-used)
11. [Clinical Disclaimer](#clinical-disclaimer)
12. [Author](#author)

## Project Structure
```text
ElectroNa/
├── .venv/
├── dashboard/
│   ├── index.html
│   ├── login.html
│   ├── script.js
│   └── styles.css
├── ML-engine/
│   ├── __pycache__/
│   ├── admissions.csv
│   ├── analyze_model.py
│   ├── app.py
│   ├── check_importance.py
│   ├── cols.txt
│   ├── d_labitems.csv
│   ├── final.csv
│   ├── gi_bleeding_analysis.py
│   ├── init_db.py
│   ├── labevents.csv
│   ├── model_analysis.txt
│   ├── patients.csv
│   ├── requirements.txt
│   ├── saltguard.db
│   ├── saltguard.ipynb
│   ├── temp_fe.txt
│   ├── temp_fe2.txt
│   ├── test_gender.py
│   ├── test_sensitivity.py
│   ├── xgb_feature_columns.pkl
│   └── xgb_mortality_model.pkl
└── .gitignore
```

### Folder & File Descriptions
| Folder / File | Description |
| :--- | :--- |
| **.venv/** | Python virtual environment directory. |
| **dashboard/** | Frontend interface files for the AI clinical dashboard. |
| **dashboard/index.html** | Main dashboard HTML page. |
| **dashboard/login.html** | Login page for user authentication. |
| **dashboard/script.js** | JavaScript logic for dashboard interactivity. |
| **dashboard/styles.css** | CSS styling for the dashboard UI. |
| **ML-engine/** | Core machine learning backend and data processing scripts. |
| **ML-engine/admissions.csv** | Hospital admissions dataset. |
| **ML-engine/analyze_model.py** | Script for model analysis and evaluation. |
| **ML-engine/app.py** | Main Flask application entry point. |
| **ML-engine/check_importance.py** | Feature importance checking utility. |
| **ML-engine/cols.txt** | Column/feature names reference file. |
| **ML-engine/d_labitems.csv** | Lab items dictionary dataset. |
| **ML-engine/final.csv** | Final processed dataset used for training. |
| **ML-engine/gi_bleeding_analysis.py** | GI bleeding risk analysis module. |
| **ML-engine/init_db.py** | Database initialization script. |
| **ML-engine/labevents.csv** | Laboratory events dataset. |
| **ML-engine/model_analysis.txt** | Model analysis results and notes. |
| **ML-engine/patients.csv** | Patient records dataset. |
| **ML-engine/requirements.txt** | Python dependencies for the ML engine. |
| **ML-engine/saltguard.db** | SQLite database file. |
| **ML-engine/saltguard.ipynb** | Jupyter notebook for exploration and prototyping. |
| **ML-engine/temp_fe.txt** | Temporary feature engineering output. |
| **ML-engine/temp_fe2.txt** | Secondary temporary feature engineering output. |
| **ML-engine/test_gender.py** | Gender-based model testing script. |
| **ML-engine/test_sensitivity.py** | Sensitivity analysis testing script. |
| **ML-engine/xgb_feature_columns.pkl** | Saved XGBoost feature column names. |
| **ML-engine/xgb_mortality_model.pkl** | Trained XGBoost mortality prediction model. |
| **.gitignore** | Specifies files and folders excluded from Git version control. |

## Dataset
The project uses a clinical laboratory dataset focused on liver cirrhosis severity assessment and GI bleeding-associated risk indicators.

### Key Features Used
- Sodium (Na⁺)
- Creatinine
- Blood Urea Nitrogen (BUN)
- Hemoglobin
- WBC Count
- MELD Score
- Age
- Gender
- BUN/Creatinine Ratio
- Mortality Indicators

### Prediction Targets
- Cirrhosis Severity Risk
- GI Bleeding Association Risk
- Mortality Risk Patterns
- Hepatorenal Syndrome (HRS)
- Acute Kidney Injury (AKI)
- Hepatic Encephalopathy

## Installation
1. **Clone the Repository**
   ```bash
   git clone <repository-link>
   cd ElectroNa
   ```
2. **Create a Virtual Environment**
   ```bash
   python -m venv venv
   ```
3. **Activate the Environment**
   - **Windows**:
     ```bash
     venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```
4. **Install Dependencies**
   ```bash
   pip install -r ML-engine/requirements.txt
   ```

## Usage
### Train the Model
```bash
python ML-engine/train_model.py
```
### Run the Flask Application
```bash
python ML-engine/app.py
```
The application will start a local web server for accessing the AI Clinical Dashboard.

## Model Architecture
The system uses an **XGBoost Classifier** optimized for clinical biomarker patterns. It integrates a feature engineering pipeline that transforms raw lab values into clinical indicators (e.g., BUN/Cr ratio, Hyponatremia severity). Model explainability is provided via **SHAP (SHapley Additive exPlanations)** to show how each lab value contributes to the specific patient's risk profile.

## Features
### AI Clinical Insight Dashboard
- Real-time risk analysis
- Severity categorization
- Trend monitoring
- Model confidence scoring
- MELD score comparison

### GI Bleeding Risk Association Module
- GI bleeding probability prediction
- Electrolyte association analysis
- Renal dysfunction correlation
- Mortality pattern explainability

### Explainable AI (SHAP)
- Transparent feature contribution
- Clinical interpretation support
- Sodium contribution analysis
- Risk importance visualization

### Differential Diagnosis Engine
Supports prediction of:
- Hepatorenal Syndrome (HRS)
- Hepatic Encephalopathy
- Upper GI Bleed
- Acute Kidney Injury (AKI)
- Decompensated Liver Cirrhosis

### Automated Clinical Reports
- Structured patient summaries
- Laboratory interpretation
- Risk categorization
- Clinical recommendations
- PDF export support

## Results
The ElectroNa Clinical AI Engine successfully predicts cirrhosis severity and GI bleeding-associated complications using laboratory biomarkers and explainable AI techniques.

### Achievements
- Accurate risk stratification
- Explainable clinical predictions
- Automated report generation
- Differential diagnosis assistance
- Real-time dashboard visualization

## Project Screenshots

### Fig. 1: AI Clinical Insight Dashboard
![AI Clinical Insight Dashboard](assets/dashboard_overview.png)

### Fig. 2: GI Bleeding Risk Association Module
![GI Bleeding Risk Association Module](assets/gi_bleeding.png)

### Fig. 3: Differential Diagnosis & Complications
![Differential Diagnosis & Complications](assets/differential_diagnosis.png)

### Fig. 4: Abnormal Value Highlighting
![Abnormal Value Highlighting](assets/clinical_insight.png)

### Fig. 5: SHAP Explainability & Risk Contribution
![SHAP Explainability & Risk Contribution](assets/gi_bleeding.png)

### Fig. 6: Automated Patient Reporting
![Automated Patient Reporting](assets/patient_report.png)

## Future Scope
- Integration with Hospital EHR Systems
- Real-time ICU Monitoring
- NLP-based Clinical Summarization
- Multi-disease Prediction Expansion
- GenAI-powered Clinical Recommendation System
- Integration of Gut Microbiome Risk Analysis
- Cloud Deployment for Hospital Scalability

## Technologies Used
| Category | Tools / Libraries |
| :--- | :--- |
| **Language** | Python |
| **Web Framework** | Flask |
| **Machine Learning** | Scikit-learn, XGBoost |
| **Explainability** | SHAP |
| **Data Processing** | Pandas, NumPy |
| **Frontend** | HTML, CSS, JavaScript, Bootstrap |

## Clinical Disclaimer
This project is intended for educational, research, and clinical decision-support purposes only. It is not a replacement for professional medical diagnosis or treatment.

## Author
**Kankshith Nukala**
