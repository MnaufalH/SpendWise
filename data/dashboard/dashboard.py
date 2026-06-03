import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from matplotlib.colors import LinearSegmentedColormap

st.set_page_config(
    page_title="Financial Status Dashboard",
    page_icon="SpendWise Logo.png",
    layout="wide",
    initial_sidebar_state="expanded"
)

@st.cache_data
def load_data():
    df = pd.read_csv("df_clean2.csv")
    label_map = {0: "Rentan", 1: "Moderate", 2: "Sehat"}
    df["Status_Label"] = df["Financial_Status"].map(label_map)
    df["Status_Label"] = pd.Categorical(
        df["Status_Label"],
        categories=["Rentan", "Moderate", "Sehat"],
        ordered=True
    )
    return df

df = load_data()

ALL_RATIO_COLS = [c for c in df.columns if c.endswith("_Ratio")]

COLOR_MAP = {
    "Rentan":   "#E53E3E",
    "Moderate": "#D97706",
    "Sehat":    "#059669",
}

EXPENSE_LABELS = {
    "Savings_Ratio":          "Tabungan",
    "Rent_Ratio":             "Sewa Tempat",
    "Loan_Repayment_Ratio":   "Cicilan",
    "Groceries_Ratio":        "Belanja Groceries",
    "Transport_Ratio":        "Transportasi",
    "Eating_Out_Ratio":       "Makan di Luar",
    "Entertainment_Ratio":    "Hiburan",
    "Utilities_Ratio":        "Utilitas",
}

MPL_BG      = "#FFFFFF"
MPL_MUTED   = "#333333"
MPL_PRIMARY = "#1A1F3C"

# ── SIDEBAR ───────────────────────────────────────────────────────────────────

with st.sidebar:
    st.image("SpendWise Logo.png", width=180)
    st.divider()

    menu = st.radio(
        "Halaman",
        ["📊 Ringkasan Utama", "❓ Pertanyaan Bisnis"],
        label_visibility="collapsed"
    )
    st.divider()
    st.markdown("**Keterangan Kategori**")
    st.markdown("🔴 **Rentan** — Finansial rentan, tabungan minim")
    st.markdown("🟡 **Moderate** — Cukup stabil, ada ruang perbaikan")
    st.markdown("🟢 **Sehat** — Finansial sehat, tabungan optimal")

# ════════════════════════════════════════════════════════════════════════════
# PAGE 1 — RINGKASAN UTAMA
# ════════════════════════════════════════════════════════════════════════════

if menu == "📊 Ringkasan Utama":

    col_title, col_filter = st.columns([5, 2])
    with col_title:
        st.title("📊 Financial Status Dashboard")
        st.caption("Analisis pola keuangan berdasarkan komposisi pengeluaran & tabungan")
    with col_filter:
        st.write("")
        selected_status = st.selectbox(
            "Pilih Kategori",
            ["Rentan", "Moderate", "Sehat"],
            key="Kategori_filter_main"
        )

    Kategori_df = df[df["Status_Label"] == selected_status].copy()

    # ── KPI values ──────────────────────────────────────────────────────────
    total_Kategori     = len(Kategori_df)
    avg_savings       = Kategori_df["Savings_Ratio"].mean() * 100
    avg_rent          = Kategori_df["Rent_Ratio"].mean() * 100
    avg_loan          = Kategori_df["Loan_Repayment_Ratio"].mean() * 100
    avg_groceries     = Kategori_df["Groceries_Ratio"].mean() * 100
    avg_transport     = Kategori_df["Transport_Ratio"].mean() * 100
    avg_eating        = Kategori_df["Eating_Out_Ratio"].mean() * 100
    avg_entertainment = Kategori_df["Entertainment_Ratio"].mean() * 100
    avg_utilities     = Kategori_df["Utilities_Ratio"].mean() * 100

    dominant_feature = {
        "Savings":       avg_savings,
        "Rent":          avg_rent,
        "Cicilan":       avg_loan,
        "Groceries":     avg_groceries,
        "Transportasi":  avg_transport,
        "Makan di Luar": avg_eating,
        "Hiburan":       avg_entertainment,
        "Utilitas":      avg_utilities,
    }
    dominant_name  = max(dominant_feature, key=dominant_feature.get)
    dominant_value = dominant_feature[dominant_name]

    savings_benchmark = {"Rentan": 8.0, "Moderate": 18.0, "Sehat": 30.0}
    savings_diff = avg_savings - savings_benchmark[selected_status]
    savings_delta = f"{savings_diff:+.1f}% vs benchmark"

    # ── KPI Cards ────────────────────────────────────────────────────────────
    k1, k2, k3, k4 = st.columns(4)
    k1.metric("👥 Jumlah Responden", f"{total_Kategori:,}", f"Kategori {selected_status}")
    k2.metric("💰 Rata-rata Tabungan", f"{avg_savings:.1f}%", savings_delta)
    k3.metric("🏠 Rata-rata Sewa", f"{avg_rent:.1f}%", "dari total pendapatan", delta_color="off")
    k4.metric("📌 Pengeluaran Dominan", dominant_name, f"{dominant_value:.1f}% dari income", delta_color="inverse")

    st.divider()

    col_donut, col_radar, col_insight = st.columns([2.2, 2.2, 1.6])

    # ── Donut Chart ──────────────────────────────────────────────────────────
    with col_donut:
        st.subheader("🍩 Distribusi Kategori")
        st.caption("Proporsi jumlah responden pada setiap kategori financial status.")

        Kategori_count = df["Status_Label"].value_counts().reindex(["Rentan", "Moderate", "Sehat"])
        sizes  = Kategori_count.values
        labels = Kategori_count.index.tolist()
        colors = [COLOR_MAP[l] for l in labels]

        fig, ax = plt.subplots(figsize=(5, 5))
        fig.patch.set_facecolor(MPL_BG)
        ax.set_facecolor(MPL_BG)

        wedges, texts, autotexts = ax.pie(
            sizes,
            labels=None,
            colors=colors,
            autopct='%1.1f%%',
            startangle=90,
            wedgeprops=dict(width=0.55, edgecolor=MPL_BG, linewidth=3),
            pctdistance=0.78
        )
        for at in autotexts:
            at.set_color(MPL_PRIMARY)
            at.set_fontsize(12)
            at.set_fontweight("bold")

        ax.text(0,  0.08, str(sum(sizes)), ha='center', va='center',
                color=MPL_PRIMARY, fontsize=22, fontweight='bold')
        ax.text(0, -0.18, 'Total', ha='center', va='center',
                color=MPL_MUTED, fontsize=11)

        legend_patches = [
            mpatches.Patch(color=c, label=f"{l} ({v:,})")
            for c, l, v in zip(colors, labels, sizes)
        ]
        ax.legend(handles=legend_patches, loc='lower center',
                  bbox_to_anchor=(0.5, -0.12), ncol=3, frameon=False,
                  labelcolor=MPL_PRIMARY, fontsize=10)
        plt.tight_layout()
        st.pyplot(fig)

    # ── Radar Chart ──────────────────────────────────────────────────────────
    with col_radar:
        st.subheader("🕸️ Profil Finansial Kategori")
        st.caption("Perbandingan pola alokasi pendapatan antar Kategori.")

        radar_cols = [
            "Savings_Ratio", "Rent_Ratio", "Loan_Repayment_Ratio",
            "Groceries_Ratio", "Transport_Ratio", "Eating_Out_Ratio",
            "Entertainment_Ratio", "Utilities_Ratio",
        ]
        radar_labels = ["Tabungan", "Sewa", "Cicilan", "Groceries",
                        "Transport", "Makan Luar", "Hiburan", "Utilitas"]

        radar_mean = df.groupby("Status_Label")[radar_cols].mean() * 100
        angles = np.linspace(0, 2 * np.pi, len(radar_cols), endpoint=False).tolist()
        angles += angles[:1]

        fig = plt.figure(figsize=(6, 6))
        fig.patch.set_facecolor(MPL_BG)
        ax = plt.subplot(111, polar=True)
        ax.set_facecolor(MPL_BG)

        for Kategori, color in COLOR_MAP.items():
            values = radar_mean.loc[Kategori].tolist() + [radar_mean.loc[Kategori].tolist()[0]]
            ax.plot(angles, values, linewidth=2.5, label=Kategori, color=color)
            ax.fill(angles, values, alpha=0.1, color=color)

        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(radar_labels, color=MPL_PRIMARY, fontsize=9)
        ax.set_yticklabels([])
        ax.grid(color="#4C78FF", alpha=0.1, linestyle="--")
        ax.spines["polar"].set_color("#4C78FF")
        ax.spines["polar"].set_alpha(0.2)

        legend = ax.legend(loc="upper right", bbox_to_anchor=(1.25, 1.10), frameon=False)
        for text in legend.get_texts():
            text.set_color(MPL_PRIMARY)
        st.pyplot(fig)

    # ── Insight ──────────────────────────────────────────────────────────────
    with col_insight:
        st.subheader("💡 Interpretasi")

        total_all    = df.shape[0]
        pct_rentan   = df[df["Status_Label"] == "Rentan"].shape[0]   / total_all * 100
        pct_moderate = df[df["Status_Label"] == "Moderate"].shape[0] / total_all * 100
        pct_sehat    = df[df["Status_Label"] == "Sehat"].shape[0]    / total_all * 100

        dominant_cl = max(
            {"Rentan": pct_rentan, "Moderate": pct_moderate, "Sehat": pct_sehat},
            key=lambda k: {"Rentan": pct_rentan, "Moderate": pct_moderate, "Sehat": pct_sehat}[k]
        )

        st.info(f"Kategori **{dominant_cl}** mendominasi dataset dengan proporsi terbesar.")

        st.error(f"🔴 **Rentan ({pct_rentan:.1f}%)** — Beban fixed-cost tinggi, tabungan rendah.")
        st.warning(f"🟡 **Moderate ({pct_moderate:.1f}%)** — Stabil, ada tekanan pengeluaran rutin.")
        st.success(f"🟢 **Sehat ({pct_sehat:.1f}%)** — Savings ratio tinggi, finansial optimal.")

    # ── Progress Bars ─────────────────────────────────────────────────────────
    st.divider()
    st.subheader(f"📊 Komposisi Alokasi Pendapatan — {selected_status}")
    st.caption("Rata-rata proporsi alokasi pendapatan pada setiap kategori finansial.")

    expense_data = {
        "💰 Tabungan":        avg_savings,
        "🏠 Sewa Tempat":     avg_rent,
        "💳 Cicilan":         avg_loan,
        "🛒 Groceries":       avg_groceries,
        "🚗 Transportasi":    avg_transport,
        "🍜 Makan di Luar":   avg_eating,
        "🎮 Hiburan":         avg_entertainment,
        "⚡ Utilitas":        avg_utilities,
    }
    sorted_expenses = sorted(expense_data.items(), key=lambda x: x[1], reverse=True)
    max_val = sorted_expenses[0][1] + 5
    half    = len(sorted_expenses) // 2

    col_a, col_b = st.columns(2)
    with col_a:
        for name, value in sorted_expenses[:half]:
            st.markdown(f"**{name}** — `{value:.1f}%`")
            st.progress(min(value / max_val, 1.0))
    with col_b:
        for name, value in sorted_expenses[half:]:
            st.markdown(f"**{name}** — `{value:.1f}%`")
            st.progress(min(value / max_val, 1.0))

    st.divider()


# ════════════════════════════════════════════════════════════════════════════
# PAGE 2 — PERTANYAAN BISNIS
# ════════════════════════════════════════════════════════════════════════════

else:
    st.title("❓ Pertanyaan Bisnis")
    st.caption("Temukan jawaban atas pertanyaan kunci tentang pola finansial pengguna.")

    questions = [
        "1. Apa pola alokasi keuangan yang membedakan Kategori Rentan, Moderate, dan Sehat?",
        "2. Fitur apa yang paling berpengaruh terhadap klasifikasi kesehatan finansial?",
    ]
    q = st.selectbox("Pilih Pertanyaan", questions)

    st.divider()

    # ── Q1 ────────────────────────────────────────────────────────────────────
    if q.startswith("1."):
        st.subheader("🔍 Pola Alokasi Keuangan Antar Kategori")
        st.caption("Perbandingan rata-rata alokasi pendapatan pada setiap Kategori.")

        mean_Kategori = df.groupby("Status_Label")[ALL_RATIO_COLS].mean() * 100
        nice_labels  = [
            EXPENSE_LABELS.get(c, c.replace("_Ratio", "").replace("_", " "))
            for c in mean_Kategori.columns
        ]

        x     = np.arange(len(nice_labels))
        width = 0.25

        fig, ax = plt.subplots(figsize=(12, 6))
        fig.patch.set_facecolor(MPL_BG)
        ax.set_facecolor(MPL_BG)

        ax.bar(x - width, mean_Kategori.loc["Rentan"],   width, label="Rentan",   color="#E53E3E", alpha=0.9, zorder=3)
        ax.bar(x,         mean_Kategori.loc["Moderate"], width, label="Moderate", color="#D97706", alpha=0.9, zorder=3)
        ax.bar(x + width, mean_Kategori.loc["Sehat"],    width, label="Sehat",    color="#059669", alpha=0.9, zorder=3)

        for spine in ax.spines.values():
            spine.set_visible(False)
        ax.set_xticks(x)
        ax.set_xticklabels(nice_labels, rotation=20, ha="right", color=MPL_MUTED, fontsize=11)
        ax.set_ylabel("Rata-rata Rasio (%)", color=MPL_MUTED, fontsize=11)
        ax.set_title("Perbandingan Alokasi Pendapatan Antar Kategori",
                     fontsize=14, fontweight="bold", color=MPL_PRIMARY, pad=14)
        ax.tick_params(colors=MPL_MUTED)
        ax.grid(alpha=0.07, linestyle="--", color="#4C78FF", axis="y", zorder=0)

        legend = ax.legend(frameon=False, fontsize=11)
        for text in legend.get_texts():
            text.set_color(MPL_PRIMARY)

        plt.tight_layout()
        st.pyplot(fig)

        st.subheader("💡 Insight Pola Alokasi Keuangan Tiap Kategori")

        st.error("""
        🔴 **Kategori Rentan**

        Memiliki kapasitas menabung yang sangat kritis, di mana mereka hanya mampu menyisihkan rata-rata 5.5% dari pendapatan. Hal ini merupakan dampak langsung dari fixed-cost trap, yaitu tingginya beban biaya tetap untuk sewa tempat tinggal (rata-rata 29%) dan cicilan (rata-rata 15%). Akibatnya, kelompok ini memiliki ruang finansial yang sangat sempit dan rentan jika menghadapi pengeluaran darurat.
        """)

        st.warning("""
        🟡 **Kategori Moderate**

        Memiliki kondisi finansial yang relatif lebih aman dengan rata-rata savings rate sebesar 16%. Kelompok ini sudah mampu mengamankan batas minimum investasi masa depan sekaligus memenuhi kebutuhan rutin, meskipun ruang gerak mereka masih sedikit tertahan oleh sisa beban cicilan (rata-rata 9.5%) dan sewa tempat tinggal (rata-rata 25%)..
        """)

        st.success("""
        🟢 **Kategori Sehat**

        Memiliki tingkat kesehatan finansial yang paling ideal (wealth builder) dengan kemampuan menyisihkan rata-rata 30.5% pendapatan untuk tabungan atau investasi. Kunci utama dari kesehatan finansial kelompok ini adalah keberhasilan mereka dalam menekan beban cicilan hingga titik minimal (rata-rata 2%) serta rasio sewa yang lebih rendah (rata-rata 20.5%), sehingga memberikan fleksibilitas arus kas yang sangat longgar.
        """)

    # ── Q2 ────────────────────────────────────────────────────────────────────
    elif q.startswith("2."):
        st.subheader("🔥 Heatmap Korelasi Fitur")
        st.caption("Seberapa kuat hubungan antar variabel. Nilai +1 = korelasi positif sempurna, -1 = negatif sempurna.")

        corr_ratio_cols = [c for c in ALL_RATIO_COLS if c != "Savings_Ratio"]
        corr_cols  = corr_ratio_cols + ["Financial_Status"]
        corr       = df[corr_cols].corr()
        col_names  = [c.replace("_Ratio", "").replace("_", " ") for c in corr.columns]

        fig, ax = plt.subplots(figsize=(11, 8))
        fig.patch.set_facecolor(MPL_BG)
        ax.set_facecolor(MPL_BG)

        custom_cmap = LinearSegmentedColormap.from_list(
            "custom_rg", ["#E53E3E", "#F0F4FF", "#059669"], N=256
        )

        im = ax.imshow(corr, cmap=custom_cmap, aspect="auto", vmin=-1, vmax=1)

        ax.set_xticks(range(len(col_names)))
        ax.set_yticks(range(len(col_names)))
        ax.set_xticklabels(col_names, rotation=40, ha="right", color=MPL_MUTED, fontsize=9)
        ax.set_yticklabels(col_names, color=MPL_MUTED, fontsize=9)

        for i in range(len(corr.columns)):
            for j in range(len(corr.columns)):
                val    = corr.iloc[i, j]
                txt_c  = MPL_PRIMARY if abs(val) > 0.4 else MPL_MUTED
                weight = "bold" if abs(val) > 0.6 else "normal"
                ax.text(j, i, f"{val:.2f}", ha="center", va="center",
                        color=txt_c, fontsize=8, fontweight=weight)

        for spine in ax.spines.values():
            spine.set_visible(False)
        ax.tick_params(length=0)

        cbar = fig.colorbar(im, fraction=0.03, pad=0.02)
        cbar.ax.yaxis.set_tick_params(color=MPL_MUTED, labelsize=9)
        plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color=MPL_MUTED)
        cbar.outline.set_visible(False)
        cbar.set_label("Korelasi", color=MPL_MUTED, fontsize=10)
        ax.set_title("Correlation Matrix", color=MPL_PRIMARY,
                     fontsize=14, fontweight="bold", pad=14)

        plt.tight_layout()
        st.pyplot(fig)

        st.info("""
        **Cara membaca heatmap:**
        🟢 Hijau = korelasi positif · 🔴 Merah = korelasi negatif · Warna netral = tidak ada hubungan.

        Jika ditinjau dari heatmap di atas, terlihat bahwa seluruh kategori pengeluaran memiliki korelasi negatif terhadap status finansial seseorang. Di antara seluruh variabel tersebut, **Loan_Repayment_Ratio** (-0.63) dan **Rent_Ratio** (-0.44) menunjukkan nilai korelasi negatif tertinggi. Hasil ini memvalidasi analisis pola alokasi keuangan sebelumnya, yang membuktikan secara empiris bahwa tingginya beban cicilan dan biaya sewa tempat tinggal merupakan faktor penentu utama yang menekan tingkat kesehatan finansial individu ke kategori Moderate maupun Rentan.
        """)
