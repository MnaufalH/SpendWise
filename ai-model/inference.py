"""
inference.py — Pipeline Inferensi Produksi untuk Financial Status Predictor
============================================================================
Penggunaan:
    # Single record
    python inference.py --model model_monthly.keras --scaler scaler.joblib \
        --mode single

    # Batch dari CSV
    python inference.py --model model_monthly.keras --scaler scaler.joblib \
        --mode batch --input data_baru.csv --output hasil_prediksi.csv
"""

import argparse
import json
import os
import warnings

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model

# ─────────────────────────────────────────────────────────────────────────────
# Custom Objects
# ─────────────────────────────────────────────────────────────────────────────

class ResidualBlock(layers.Layer):
    """
    Custom Layer: Residual Block untuk data tabular.

    Arsitektur dalam satu blok:
        Input
          ├── [Main Path]  Dense → BatchNorm → ReLU → Dropout
          │                Dense → BatchNorm
          └── [Shortcut]   Dense → BatchNorm   (projection jika dimensi berbeda)
          └── Add → ReLU
    """

    def __init__(self, units, dropout_rate=0.3, **kwargs):
        super().__init__(**kwargs)
        self.units        = units
        self.dropout_rate = dropout_rate

        self.dense1   = layers.Dense(units, use_bias=False)
        self.bn1      = layers.BatchNormalization()
        self.act1     = layers.Activation("relu")
        self.drop     = layers.Dropout(dropout_rate)
        self.dense2   = layers.Dense(units, use_bias=False)
        self.bn2      = layers.BatchNormalization()
        self.shortcut = layers.Dense(units, use_bias=False)
        self.bn_sc    = layers.BatchNormalization()
        self.add      = layers.Add()
        self.act_out  = layers.Activation("relu")

    def call(self, inputs, training=False):
        x  = self.dense1(inputs)
        x  = self.bn1(x, training=training)
        x  = self.act1(x)
        x  = self.drop(x, training=training)
        x  = self.dense2(x)
        x  = self.bn2(x, training=training)
        sc = self.shortcut(inputs)
        sc = self.bn_sc(sc, training=training)
        return self.act_out(self.add([x, sc]))

    def get_config(self):
        config = super().get_config()
        config.update({"units": self.units, "dropout_rate": self.dropout_rate})
        return config


class MulticlassFocalLoss(keras.losses.Loss):
    """
    Custom Loss: Focal Loss untuk klasifikasi multiclass.

    Formula: FL(p_t) = -alpha_t * (1 - p_t)^gamma * log(p_t)
    """

    def __init__(self, gamma=2.0, class_weights=None,
                 name="multiclass_focal_loss", **kwargs):
        super().__init__(name=name, **kwargs)
        self.gamma         = gamma
        self.class_weights = class_weights

    def call(self, y_true, y_pred):
        y_true     = tf.cast(tf.reshape(y_true, [-1]), tf.int32)
        y_pred     = tf.cast(y_pred, tf.float32)
        y_pred     = tf.clip_by_value(y_pred, 1e-7, 1.0 - 1e-7)
        n_classes  = tf.shape(y_pred)[1]
        y_true_ohe = tf.one_hot(y_true, n_classes)
        ce         = -y_true_ohe * tf.math.log(y_pred)
        p_t        = tf.reduce_sum(y_true_ohe * y_pred, axis=1, keepdims=True)
        focal_wt   = tf.pow(1.0 - p_t, self.gamma)

        if self.class_weights is not None:
            cw    = tf.constant(self.class_weights, dtype=tf.float32)
            alpha = tf.reduce_sum(y_true_ohe * cw, axis=1, keepdims=True)
        else:
            alpha = 1.0

        loss = alpha * focal_wt * tf.reduce_sum(ce, axis=1)
        return tf.reduce_mean(loss)

    def get_config(self):
        config = super().get_config()
        config.update({"gamma": self.gamma, "class_weights": self.class_weights})
        return config


CUSTOM_OBJECTS = {
    "ResidualBlock"       : ResidualBlock,
    "MulticlassFocalLoss" : MulticlassFocalLoss,
}

# ─────────────────────────────────────────────────────────────────────────────
# FinancialStatusPredictor
# ─────────────────────────────────────────────────────────────────────────────

class FinancialStatusPredictor:
    """
    Pipeline inferensi produksi untuk prediksi Financial Status.

    Menggabungkan:
    - Loading model dari file .keras (dengan custom objects)
    - Preprocessing otomatis (scaling)
    - Prediksi batch maupun single record
    - Output interpretable (label kelas + probabilitas + confidence)

    Usage
    -----
    >>> predictor = FinancialStatusPredictor("model_monthly.keras", "scaler.joblib")
    >>> result = predictor.predict_single({
    ...     "Rent_Ratio": 0.25, "Loan_Repayment_Ratio": 0.10,
    ...     "Insurance_Ratio": 0.03, "Groceries_Ratio": 0.12,
    ...     "Transport_Ratio": 0.06, "Eating_Out_Ratio": 0.04,
    ...     "Entertainment_Ratio": 0.03, "Utilities_Ratio": 0.05,
    ...     "Healthcare_Ratio": 0.04, "Education_Ratio": 0.07,
    ...     "Miscellaneous_Ratio": 0.02
    ... })
    >>> print(result)
    """

    CLASS_NAMES  = {0: "Rentan", 1: "Moderate", 2: "Sehat"}
    FEATURE_COLS = [
        "Rent_Ratio", "Loan_Repayment_Ratio", "Insurance_Ratio",
        "Groceries_Ratio", "Transport_Ratio", "Eating_Out_Ratio",
        "Entertainment_Ratio", "Utilities_Ratio", "Healthcare_Ratio",
        "Education_Ratio", "Miscellaneous_Ratio",
    ]

    def __init__(self, model_path: str, scaler_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model tidak ditemukan: {model_path}")
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler tidak ditemukan: {scaler_path}")

        self.model  = keras.models.load_model(model_path,
                                              custom_objects=CUSTOM_OBJECTS)
        self.scaler = joblib.load(scaler_path)

        print(f"✔ Model loaded  : {model_path}")
        print(f"  Input shape   : {self.model.input_shape}")
        print(f"  Output shape  : {self.model.output_shape}")

    # ── Internal ──────────────────────────────────────────────────────────────

    def _validate_and_preprocess(self, df: pd.DataFrame) -> np.ndarray:
        """Validasi kolom yang diperlukan dan terapkan StandardScaler."""
        missing = [c for c in self.FEATURE_COLS if c not in df.columns]
        if missing:
            raise ValueError(f"Kolom berikut tidak ditemukan dalam input: {missing}")
        return self.scaler.transform(df[self.FEATURE_COLS])

    # ── Public API ────────────────────────────────────────────────────────────

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Prediksi batch dari DataFrame.

        Parameters
        ----------
        df : pd.DataFrame
            Harus mengandung semua kolom di FEATURE_COLS.

        Returns
        -------
        pd.DataFrame
            Kolom: predicted_class, predicted_label, confidence,
                   prob_rentan, prob_moderate, prob_sehat
        """
        X          = self._validate_and_preprocess(df)
        proba      = self.model.predict(X, verbose=0)
        pred_class = np.argmax(proba, axis=1)
        confidence = proba[np.arange(len(proba)), pred_class]

        return pd.DataFrame({
            "predicted_class" : pred_class,
            "predicted_label" : [self.CLASS_NAMES[c] for c in pred_class],
            "confidence"      : confidence.round(4),
            "prob_rentan"     : proba[:, 0].round(4),
            "prob_moderate"   : proba[:, 1].round(4),
            "prob_sehat"      : proba[:, 2].round(4),
        })

    def predict_single(self, record: dict) -> dict:
        """
        Prediksi satu record (dict), mengembalikan dict hasil.

        Parameters
        ----------
        record : dict
            Key sesuai FEATURE_COLS, value berupa float (rasio 0–1).
        """
        df     = pd.DataFrame([record])
        result = self.predict(df).iloc[0].to_dict()
        return result

    def predict_from_csv(self, csv_path: str,
                         output_path: str | None = None) -> pd.DataFrame:
        """
        Prediksi batch dari file CSV, dengan opsi menyimpan hasil.

        Parameters
        ----------
        csv_path    : str  — path ke file CSV input.
        output_path : str  — jika diberikan, hasil disimpan ke path ini.
        """
        df_input = pd.read_csv(csv_path)
        print(f"  Input CSV   : {csv_path}  ({len(df_input)} baris)")

        df_result = self.predict(df_input)

        if output_path:
            df_result.to_csv(output_path, index=False)
            print(f"  Hasil tersimpan: {output_path}")

        return df_result

    # ── Visualisasi ───────────────────────────────────────────────────────────

    def plot_single(self, result: dict, save_path: str = "inference_result.png"):
        """Visualisasikan distribusi probabilitas satu prediksi."""
        probs  = [result["prob_rentan"], result["prob_moderate"], result["prob_sehat"]]
        labels = list(self.CLASS_NAMES.values())
        colors = ["#e74c3c", "#f39c12", "#2ecc71"]

        fig, ax = plt.subplots(figsize=(7, 4))
        bars = ax.bar(labels, probs, color=colors, edgecolor="white", linewidth=1.5)

        for bar, prob in zip(bars, probs):
            ax.text(bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + 0.005,
                    f"{prob:.1%}", ha="center", fontsize=12, fontweight="bold")

        pred_idx = result["predicted_class"]
        bars[pred_idx].set_edgecolor("black")
        bars[pred_idx].set_linewidth(3)

        ax.set_ylim(0, max(probs) * 1.25)
        ax.set_title(
            f"Prediksi Financial Status\n"
            f"→ {result['predicted_label']}  (confidence: {result['confidence']:.1%})",
            fontweight="bold",
        )
        ax.set_ylabel("Probabilitas")
        ax.grid(axis="y", alpha=0.3)
        plt.tight_layout()
        plt.savefig(save_path, dpi=100)
        plt.show()
        print(f"  Plot tersimpan: {save_path}")

    def print_result(self, result: dict):
        """Cetak hasil prediksi single record ke terminal."""
        print("\n" + "=" * 45)
        print("  HASIL PREDIKSI FINANCIAL STATUS")
        print("=" * 45)
        print(f"  Status Keuangan : {result['predicted_label']}"
              f"  (kelas {int(result['predicted_class'])})")
        print(f"  Confidence      : {result['confidence']:.1%}")
        print(f"  Prob Rentan     : {result['prob_rentan']:.1%}")
        print(f"  Prob Moderate   : {result['prob_moderate']:.1%}")
        print(f"  Prob Sehat      : {result['prob_sehat']:.1%}")
        print("=" * 45 + "\n")


# ─────────────────────────────────────────────────────────────────────────────
# CLI Entry Point
# ─────────────────────────────────────────────────────────────────────────────

def parse_args():
    # Default path relatif terhadap lokasi file inference.py itu sendiri
    _here        = os.path.dirname(os.path.abspath(__file__))
    _model_dir   = os.path.join(_here, "models")
    _default_model  = os.path.join(_model_dir, "model_monthly.keras")
    _default_scaler = os.path.join(_model_dir, "scaler.joblib")

    parser = argparse.ArgumentParser(
        description="Inferensi Financial Status Predictor"
    )
    parser.add_argument("--model",  default=_default_model,
                        help="Path ke file model .keras")
    parser.add_argument("--scaler", default=_default_scaler,
                        help="Path ke file scaler .joblib")
    parser.add_argument("--mode",   choices=["single", "batch"], default="single",
                        help="Mode inferensi: single (contoh bawaan) atau batch (dari CSV)")
    parser.add_argument("--input",  default=None,
                        help="[batch] Path ke CSV input")
    parser.add_argument("--output", default="hasil_prediksi.csv",
                        help="[batch] Path untuk menyimpan hasil CSV")
    parser.add_argument("--plot",   action="store_true",
                        help="Tampilkan visualisasi (mode single)")
    return parser.parse_args()


def demo_single(predictor: FinancialStatusPredictor, plot: bool = False):
    """Jalankan contoh prediksi single record."""
    new_customer = {
        "Rent_Ratio"           : 0.30,
        "Loan_Repayment_Ratio" : 0.15,
        "Insurance_Ratio"      : 0.04,
        "Groceries_Ratio"      : 0.12,
        "Transport_Ratio"      : 0.06,
        "Eating_Out_Ratio"     : 0.04,
        "Entertainment_Ratio"  : 0.03,
        "Utilities_Ratio"      : 0.06,
        "Healthcare_Ratio"     : 0.04,
        "Education_Ratio"      : 0.05,
        "Miscellaneous_Ratio"  : 0.02,
    }

    print("\nInput Nasabah:")
    for k, v in new_customer.items():
        print(f"  {k:<28}: {v:.0%}")

    result = predictor.predict_single(new_customer)
    predictor.print_result(result)

    if plot:
        predictor.plot_single(result)


def main():
    args = parse_args()

    print("\n── Spendwise Financial Status Predictor ──")
    predictor = FinancialStatusPredictor(args.model, args.scaler)

    if args.mode == "single":
        demo_single(predictor, plot=args.plot)

    elif args.mode == "batch":
        if args.input is None:
            raise ValueError("Mode batch memerlukan --input <csv_path>")
        df_result = predictor.predict_from_csv(args.input, args.output)
        print(f"\nPreview hasil (5 baris pertama):")
        print(df_result.head().to_string(index=False))


if __name__ == "__main__":
    main()