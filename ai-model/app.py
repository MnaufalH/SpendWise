from flask import Flask, request, jsonify
import os
import shutil
import zipfile
import json
import joblib
import numpy as np
import keras
from keras import layers

app = Flask(__name__)

# Custom ResidualBlock definition required to load the model
class ResidualBlock(layers.Layer):
    def __init__(self, units, dropout_rate=0.2, **kwargs):
        super(ResidualBlock, self).__init__(**kwargs)
        self.units = units
        self.dropout_rate = dropout_rate

    def build(self, input_shape):
        self.dense1 = layers.Dense(self.units, use_bias=False, name="dense1")
        self.bn1 = layers.BatchNormalization(name="bn1")
        self.dropout = layers.Dropout(self.dropout_rate, name="dropout")
        self.dense2 = layers.Dense(self.units, use_bias=False, name="dense2")
        self.bn2 = layers.BatchNormalization(name="bn2")
        self.shortcut = layers.Dense(self.units, use_bias=False, name="shortcut")
        self.bn_sc = layers.BatchNormalization(name="bn_sc")
        super(ResidualBlock, self).build(input_shape)

    def call(self, inputs, training=False):
        x = self.dense1(inputs)
        x = self.bn1(x, training=training)
        x = keras.activations.relu(x)
        x = self.dropout(x, training=training)
        
        x = self.dense2(x)
        x = self.bn2(x, training=training)
        
        shortcut_val = self.shortcut(inputs)
        shortcut_val = self.bn_sc(shortcut_val, training=training)
        
        return keras.activations.relu(x + shortcut_val)

    def get_config(self):
        config = super(ResidualBlock, self).get_config()
        config.update({
            "units": self.units,
            "dropout_rate": self.dropout_rate
        })
        return config

# Global variables for model and scaler
model = None
scaler = None

def fix_and_load_model():
    global model, scaler
    base_dir = os.path.dirname(os.path.abspath(__file__))
    keras_path = os.path.join(base_dir, 'model_production.keras')
    temp_path = os.path.join(base_dir, 'model_production_temp.keras')
    fixed_path = os.path.join(base_dir, 'model_production_fixed.keras')
    scaler_path = os.path.join(base_dir, 'scaler.joblib')

    # Load scaler
    print("Loading scaler...")
    scaler = joblib.load(scaler_path)

    # Check if fixed model already exists
    if not os.path.exists(fixed_path):
        print("Modifying Keras model to remove quantization_config conflicts...")
        shutil.copyfile(keras_path, temp_path)
        with zipfile.ZipFile(temp_path, 'r') as yin:
            config_data = yin.read('config.json').decode('utf-8')
            config_dict = json.loads(config_data)

            # Recursive function to remove quantization_config from layer configurations
            def remove_quantization_config(obj):
                if isinstance(obj, dict):
                    if 'quantization_config' in obj:
                        del obj['quantization_config']
                    for k, v in list(obj.items()):
                        remove_quantization_config(v)
                elif isinstance(obj, list):
                    for item in obj:
                        remove_quantization_config(item)

            remove_quantization_config(config_dict)

            with zipfile.ZipFile(fixed_path, 'w') as yout:
                for item in yin.infolist():
                    if item.filename == 'config.json':
                        yout.writestr(item, json.dumps(config_dict))
                    else:
                        yout.writestr(item, yin.read(item.filename))
        
        if os.path.exists(temp_path):
            os.remove(temp_path)

    print("Loading Keras model...")
    model = keras.models.load_model(fixed_path, custom_objects={'ResidualBlock': ResidualBlock})
    print("Model and scaler loaded successfully!")

# Initialize model and scaler on startup
fix_and_load_model()

# Category mapping to ratios features index
FEATURE_NAMES = [
    'Rent_Ratio', 'Loan_Repayment_Ratio', 'Insurance_Ratio', 'Groceries_Ratio',
    'Transport_Ratio', 'Eating_Out_Ratio', 'Entertainment_Ratio', 'Utilities_Ratio',
    'Healthcare_Ratio', 'Education_Ratio', 'Miscellaneous_Ratio'
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data or 'ratios' not in data:
            return jsonify({'success': False, 'message': 'Missing ratios field in JSON payload'}), 400

        ratios_dict = data['ratios']
        
        # Build features list in correct order
        features = []
        for feat in FEATURE_NAMES:
            features.append(ratios_dict.get(feat, 0.0))

        # Scale features
        features_arr = np.array([features])
        scaled_features = scaler.transform(features_arr)

        # Run model prediction
        predictions = model.predict(scaled_features)
        pred_distribution = predictions[0].tolist()  # Probability list

        predicted_class = int(np.argmax(pred_distribution))
        confidence = float(pred_distribution[predicted_class]) * 100

        # Mapping predicted class to status label
        # 0: Healthy, 1: Warning, 2: Critical
        status_map = {
            0: "Healthy",
            1: "Warning",
            2: "Critical"
        }
        status_label = status_map.get(predicted_class, "Unknown")

        return jsonify({
            'success': True,
            'class': predicted_class,
            'status': status_label,
            'confidence': round(confidence, 1),
            'probabilities': [round(p, 4) for p in pred_distribution]
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
