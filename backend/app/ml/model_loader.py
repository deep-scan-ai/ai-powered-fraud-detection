"""
ML Model Loader
Loads the trained fraud detection model and provides prediction interface
Loads the model and uses it to check transactions

Request Path:
Frontend 
  → api.js 
    → main.py 
      → routes.py 
        → model_loader.py 
          → (preprocessor.py) OPTIONAL
            → fraud_model.pkl (predict)
              → model_loader.py (result)
                → routes.py (format)
                  → api.js (receive)
                    → Frontend (display)


Training Path:
    train_model.py → fraud_model.pkl (created)                    
"""