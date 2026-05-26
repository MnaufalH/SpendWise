"""
SpendWise AI — Training Script
Extracted from spendwise_modelling1.ipynb to train the multi-class model 
and export the model (.keras) and scaler (.joblib).
"""

import os
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay
import matplotlib
matplotlib.use("Agg")  # Run headless for saving plots
import matplotlib.pyplot as plt
import joblib

# ─── Custom Callback ──────────────────────────────────────────────────────────
class FinancialTrainingMonitor(callbacks.Callback):
    """Custom callback to stop training when target validation accuracy is reached."""
    def __init__(self, target_val_acc=0.99):
        super(FinancialTrainingMonitor, self).__init__()
        self.target_val_acc = target_val_acc

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        val_acc = logs.get('val_accuracy', 0)
        if val_acc >= self.target_val_acc:
            print(f"\n[Epoch {epoch+1}] Target validation accuracy of {self.target_val_acc*100}% met. Stopping training!")
            self.model.stop_training = True

# ─── Model Subclassing ────────────────────────────────────────────────────────
class SpendWiseClassifier(models.Model):
    """Deep Learning Network with L2 Regularization and Batch Normalization."""
    def __init__(self, num_classes=4, **kwargs):
        super(SpendWiseClassifier, self).__init__(**kwargs)
        self.num_classes = num_classes
        self.dense1 = layers.Dense(64, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.001))
        self.batch_norm1 = layers.BatchNormalization()
        self.dropout1 = layers.Dropout(0.2)
        
        self.dense2 = layers.Dense(32, activation='relu')
        self.batch_norm2 = layers.BatchNormalization()
        self.dropout2 = layers.Dropout(0.2)
        
        self.classifier = layers.Dense(num_classes, activation='softmax')

    def call(self, inputs, training=False):
        x = self.dense1(inputs)
        x = self.batch_norm1(x, training=training)
        x = self.dropout1(x, training=training)
        
        x = self.dense2(x)
        x = self.batch_norm2(x, training=training)
        x = self.dropout2(x, training=training)
        
        return self.classifier(x)

    def get_config(self):
        config = super(SpendWiseClassifier, self).get_config()
        config.update({
            "num_classes": self.num_classes
        })
        return config

def run_training():
    print("Loading datasets...")
    train_df = pd.read_csv('df_train2.csv')
    test_df = pd.read_csv('df_test2.csv')

    print(f"Train Shape: {train_df.shape}")
    print(f"Test Shape: {test_df.shape}")

    # Split features and target
    X_train = train_df.drop(columns=['Financial_Status']).values
    y_train = train_df['Financial_Status'].values
    X_test = test_df.drop(columns=['Financial_Status']).values
    y_test = test_df['Financial_Status'].values

    # Standardize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Save scaler for production use!
    scaler_filename = "financial_scaler.joblib"
    joblib.dump(scaler, scaler_filename)
    print(f"Scaler saved -> {scaler_filename}")

    # One-hot encode targets
    y_train_cat = tf.keras.utils.to_categorical(y_train, num_classes=4)
    y_test_cat = tf.keras.utils.to_categorical(y_test, num_classes=4)

    # Build model
    model = SpendWiseClassifier(num_classes=4)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    monitor = FinancialTrainingMonitor(target_val_acc=0.99)

    print("Starting training...")
    history = model.fit(
        X_train_scaled, y_train_cat,
        validation_data=(X_test_scaled, y_test_cat),
        epochs=20,
        batch_size=32,
        callbacks=[monitor],
        verbose=1
    )

    # Evaluate
    y_pred_probs = model.predict(X_test_scaled)
    y_pred = np.argmax(y_pred_probs, axis=1)

    print("\n=== Test Classification Report ===")
    print(classification_report(y_test, y_pred, target_names=["Status 0 (Critical)", "Status 1 (Risky)", "Status 2 (Moderate)", "Status 3 (Healthy)"]))

    # Save Confusion Matrix plot
    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=[0, 1, 2, 3])
    disp.plot(cmap=plt.cm.Blues, values_format='d')
    plt.title("Confusion Matrix - SpendWise AI Real Dataset")
    plt.xlabel("Predicted Financial Status")
    plt.ylabel("True Financial Status")
    plt.tight_layout()
    plt.savefig("confusion_matrix_m1.png", dpi=150)
    plt.close()
    print("Confusion matrix saved -> confusion_matrix_m1.png")

    # Save Keras model
    model_filename = "financial_behavior_model.keras"
    # Call the model on a dummy input to build it before saving
    model.predict(X_test_scaled[:1])
    model.save(model_filename, save_format="keras")
    print(f"Model saved -> {model_filename}")

if __name__ == "__main__":
    run_training()
