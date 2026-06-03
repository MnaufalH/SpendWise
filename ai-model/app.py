import os
import joblib
import keras
import numpy as np
from flask import Flask, request, jsonify
from keras import layers

app = Flask(__name__)


# Recreated ResidualBlock custom layer matching the training configuration
class ResidualBlock(layers.Layer):
    def __init__(self, units, dropout_rate=0.3, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.dropout_rate = dropout_rate

    def build(self, input_shape):
        input_dim = input_shape[-1]
        self.dense1 = layers.Dense(self.units, use_bias=False, name='dense1')
        self.bn1 = layers.BatchNormalization(name='bn1')
        
        self.dense2 = layers.Dense(self.units, use_bias=False, name='dense2')
        self.bn2 = layers.BatchNormalization(name='bn2')
        
        self.dropout = layers.Dropout(self.dropout_rate, name='dropout')
        
        if input_dim != self.units:
            self.shortcut = layers.Dense(self.units, use_bias=False, name='shortcut')
            self.bn_sc = layers.BatchNormalization(name='bn_sc')
        else:
            self.shortcut = None
            self.bn_sc = None
            
        super().build(input_shape)

    def call(self, inputs, training=False):
        x = self.dense1(inputs)
        x = self.bn1(x, training=training)
        x = layers.Activation('relu')(x)
        
        x = self.dense2(x)
        x = self.bn2(x, training=training)
        
        if self.shortcut is not None:
            shortcut = self.shortcut(inputs)
            shortcut = self.bn_sc(shortcut, training=training)
        else:
            shortcut = inputs
            
        x = layers.add([x, shortcut])
        x = layers.Activation('relu')(x)
        x = self.dropout(x, training=training)
        return x

    def get_config(self):
        config = super().get_config()
        config.update({
            "units": self.units,
            "dropout_rate": self.dropout_rate
        })
        return config

# Manually register the custom class in Keras custom objects
keras.saving.get_custom_objects()['ResidualBlock'] = ResidualBlock

# Global variables for model and scaler
model = None
scaler = None

def init_resources():
    global model, scaler
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "models", "model_monthly.keras")
    scaler_path = os.path.join(base_dir, "models", "scaler.joblib")
    
    print(f"Loading scaler from: {scaler_path}")
    scaler = joblib.load(scaler_path)
    
    print(f"Loading model from: {model_path}")
    # Load model with compile=False for inference (bypasses custom loss deserialization)
    model = keras.models.load_model(model_path, compile=False)
    print("AI Model resources loaded successfully!")

# Initialize resources
init_resources()

# Feature order expected by the scaler and model
FEATURE_NAMES = [
    'Rent_Ratio', 'Loan_Repayment_Ratio', 'Insurance_Ratio', 'Groceries_Ratio',
    'Transport_Ratio', 'Eating_Out_Ratio', 'Entertainment_Ratio', 'Utilities_Ratio',
    'Healthcare_Ratio', 'Education_Ratio', 'Miscellaneous_Ratio'
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'ratios' not in data:
            return jsonify({'success': False, 'message': 'Missing ratios in request body'}), 400
        
        ratios_dict = data['ratios']
        
        # Susun fitur sesuai urutan FEATURE_NAMES
        features = [ratios_dict.get(feat, 0.0) for feat in FEATURE_NAMES]
        features_arr = np.array([features])
        
        # Lakukan scaling input
        scaled_features = scaler.transform(features_arr)
        
        # Prediksi menggunakan model
        prediction = model.predict(scaled_features)
        pred_distribution = prediction[0].tolist()
        
        predicted_class = int(np.argmax(pred_distribution))
        confidence = float(pred_distribution[predicted_class]) * 100
        
        # Map kelas prediksi ke status keuangan (0: Sehat, 1: Moderate, 2: Rentan)
        status_map = {
            0: "Sehat",
            1: "Moderate",
            2: "Rentan"
        }
        status_label = status_map.get(predicted_class, "Unknown")
        
        print("\n=== Prediction Debug ===")
        print("Ratios received:", ratios_dict)
        print("Raw features:", features)
        print("Prediction distribution:", pred_distribution)
        print("Predicted class:", predicted_class)
        print("Status label mapped:", status_label)
        print("========================\n")
        
        return jsonify({
            'success': True,
            'class': predicted_class,
            'status': status_label,
            'confidence': round(confidence, 2),
            'probabilities': [round(p, 4) for p in pred_distribution]
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # Flask runs on port 5000 as expected by the backend
    app.run(host='0.0.0.0', port=5000, debug=False)
