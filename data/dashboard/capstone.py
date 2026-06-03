import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from matplotlib.colors import LinearSegmentedColormap

# ════════════════════════════════════════════════════════════════════════════
# PAGE CONFIG
# ════════════════════════════════════════════════════════════════════════════

st.set_page_config(
    page_title="Financial Status Dashboard",
    page_icon="SpendWise Logo.png",
    layout="wide",
    initial_sidebar_state="expanded"
)

plt.style.use("dark_background")

# CUSTOM STYLE

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', sans-serif;
}

.main { background-color: #0B0F1A; }

/* ── KPI Cards ── */
.kpi-card {
    background: linear-gradient(135deg, #13182A 0%, #1A2035 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 12px;
    position: relative;
    overflow: hidden;
    transition: transform 0.25s, border-color 0.25s;
}
.kpi-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 16px 16px 0 0;
}
.kpi-card.accent-blue::before  { background: linear-gradient(90deg, #4C78FF, #7B9FFF); }
.kpi-card.accent-green::before { background: linear-gradient(90deg, #06d6a0, #00b386); }
.kpi-card.accent-yellow::before{ background: linear-gradient(90deg, #ffd166, #ffb347); }
.kpi-card.accent-red::before   { background: linear-gradient(90deg, #ff6b6b, #ff4040); }
.kpi-card:hover {
    transform: translateY(-4px);
    border-color: rgba(76,120,255,0.35);
}
.kpi-icon   { font-size: 22px; margin-bottom: 8px; }
.kpi-title  { color: #7a859a; font-size: 12px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 6px; }
.kpi-value  { color: #ffffff; font-size: 30px; font-weight: 800; line-height: 1; }
.kpi-sub    { font-size: 12px; margin-top: 8px; font-weight: 500; }
.kpi-sub.positive { color: #06d6a0; }
.kpi-sub.neutral  { color: #9aa4b2; }
.kpi-sub.negative { color: #ff6b6b; }

/* ── Section Headers ── */
.section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 28px 0 6px 0;
}
.section-header .icon { font-size: 20px; }
.section-header .title {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
}
.section-desc {
    color: #6b7688;
    font-size: 13px;
    margin-bottom: 16px;
    line-height: 1.6;
}

/* ── Insight Box ── */
.insight-box {
    background: linear-gradient(135deg, rgba(76,120,255,0.08), rgba(76,120,255,0.03));
    border: 1px solid rgba(76,120,255,0.2);
    border-left: 3px solid #4C78FF;
    border-radius: 10px;
    padding: 14px 18px;
    color: #a8b5cc;
    font-size: 13px;
    line-height: 1.65;
    margin-top: 12px;
}
.insight-box strong { color: #c8d5f0; }

/* ── Cluster Badge ── */
.cluster-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
}
.badge-rentan    { background: rgba(255,107,107,0.15); color: #ff6b6b; border: 1px solid rgba(255,107,107,0.3); }
.badge-moderate { background: rgba(255,209,102,0.15); color: #ffd166; border: 1px solid rgba(255,209,102,0.3); }
.badge-Sehat   { background: rgba(6,214,160,0.15);   color: #06d6a0; border: 1px solid rgba(6,214,160,0.3); }

/* ── Progress Bar ── */
.progress-row { margin-bottom: 14px; }
.progress-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}
.progress-name  { color: #c0cce0; font-size: 13px; font-weight: 500; }
.progress-value { color: #7a859a; font-size: 13px; font-weight: 600; }
.progress-track {
    height: 8px;
    background: rgba(255,255,255,0.06);
    border-radius: 99px;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.8s ease;
}

/* ── Divider ── */
.soft-divider {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.06);
    margin: 24px 0;
}

/* ── Page title ── */
.page-title {
    font-size: 28px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
}
.page-subtitle {
    color: #5a6478;
    font-size: 14px;
    margin-top: 8px;
    line-height: 1;
}

/* ── Inline cluster selectbox ── */
div[data-testid="stSelectbox"] > div > div {
    background: #13182A !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 10px !important;
    color: white !important;
    font-size: 13px !important;
    font-weight: 600 !important;
}
div[data-testid="stSelectbox"] label {
    display: none !important;
}
</style>
""", unsafe_allow_html=True)

# LOAD DATA
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

# CONSTANTS

ALL_RATIO_COLS = [c for c in df.columns if c.endswith("_Ratio")]

COLOR_MAP = {
    "Rentan":    "#ff6b6b",
    "Moderate": "#ffd166",
    "Sehat":   "#06d6a0"
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

BG_COLOR    = "#0B0F1A"
PANEL_COLOR = "#13182A"

# ════════════════════════════════════════════════════════════════════════════
# HELPERS
# ════════════════════════════════════════════════════════════════════════════

def setup_ax(fig, ax):
    fig.patch.set_facecolor(PANEL_COLOR)
    ax.set_facecolor(PANEL_COLOR)
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.tick_params(colors="#6b7688", labelsize=11)
    ax.title.set_color("white")
    ax.xaxis.label.set_color("#6b7688")
    ax.yaxis.label.set_color("#6b7688")
    ax.grid(alpha=0.08, linestyle="--", color="white")
    return fig, ax

def progress_bar_html(name, value, color, max_val=50):
    pct = min(value / max_val * 100, 100)
    return f"""
    <div class="progress-row">
        <div class="progress-label">
            <span class="progress-name">{name}</span>
            <span class="progress-value">{value:.1f}%</span>
        </div>
        <div class="progress-track">
            <div class="progress-fill" style="width:{pct}%; background:{color};"></div>
        </div>
    </div>
    """

def cluster_badge(status):
    cls = {"Rentan": "badge-rentan", "Moderate": "badge-moderate", "Sehat": "badge-Sehat"}[status]
    dot = {"Rentan": "🔴", "Moderate": "🟡", "Sehat": "🟢"}[status]
    return f'<span class="cluster-badge {cls}">{dot} {status}</span>'

# ════════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ════════════════════════════════════════════════════════════════════════════

with st.sidebar:

    st.image(
        "SpendWise Logo.png",
        width=180
    )

    st.markdown("---")

    menu = st.radio(
        "HalSehat",
        ["📊 Ringkasan Utama", "❓ Pertanyaan Bisnis"],
        label_visibility="collapsed"
    )

    # mini legend
    st.markdown("---")
    st.markdown("**Keterangan Cluster**")
    for s, desc in {
        "🔴 Rentan":    "Finansial rentan, tabungan minim",
        "🟡 Moderate": "Cukup stabil, ada ruang perbaikan",
        "🟢 Sehat":   "Finansial sehat, tabungan optimal"
    }.items():
        st.markdown(f"<small style='color:#6b7688'><b style='color:#c0cce0'>{s}</b><br>{desc}</small>", unsafe_allow_html=True)
        st.markdown("")

# ════════════════════════════════════════════════════════════════════════════
# PAGE 1 — RINGKASAN UTAMA
# ════════════════════════════════════════════════════════════════════════════

if menu == "📊 Ringkasan Utama":

    st.markdown("<div class='page-title'>📊 Financial Status Dashboard</div>", unsafe_allow_html=True)

    # ── Inline cluster filter ─────────────────────────────────────────────────
    col_sub, col_filter = st.columns([5, 2])
    with col_sub:
        st.markdown(
            "<div class='page-subtitle'>Analisis pola keuangan berdasarkan komposisi pengeluaran &amp; tabungan</div>",
            unsafe_allow_html=True
        )
    with col_filter:
        selected_status = st.selectbox(
            "Cluster",
            ["Rentan", "Moderate", "Sehat"],
            label_visibility="collapsed",
            key="cluster_filter_main"
        )

    st.markdown(
        f"<div style='margin-top:-8px; margin-bottom:20px; color:#5a6478; font-size:13px;'>"
        f"Cluster yang dipilih: {cluster_badge(selected_status)}</div>",
        unsafe_allow_html=True
    )

    cluster_df = df[df["Status_Label"] == selected_status].copy()

    # ── KPI ──────────────────────────────────────────────────────────────────
    total_cluster     = len(cluster_df)
    avg_savings       = cluster_df["Savings_Ratio"].mean() * 100
    avg_rent          = cluster_df["Rent_Ratio"].mean() * 100
    avg_loan          = cluster_df["Loan_Repayment_Ratio"].mean() * 100
    avg_groceries     = cluster_df["Groceries_Ratio"].mean() * 100
    avg_transport     = cluster_df["Transport_Ratio"].mean() * 100
    avg_eating        = cluster_df["Eating_Out_Ratio"].mean() * 100
    avg_entertainment = cluster_df["Entertainment_Ratio"].mean() * 100
    avg_utilities     = cluster_df["Utilities_Ratio"].mean() * 100

    dominant_feature = {
        "Savings":       avg_savings,
        "Rent":          avg_rent,
        "Cicilan":       avg_loan,
        "Groceries":     avg_groceries,
        "Transportasi":  avg_transport,
        "Makan di Luar": avg_eating,
        "Hiburan":       avg_entertainment,
        "Utilitas":      avg_utilities
    }
    dominant_name  = max(dominant_feature, key=dominant_feature.get)
    dominant_value = dominant_feature[dominant_name]

    savings_benchmark = {"Rentan": 8.0, "Moderate": 18.0, "Sehat": 30.0}
    savings_diff = avg_savings - savings_benchmark[selected_status]
    savings_sub  = f"↑ {savings_diff:.1f}% di atas rata-rata" if savings_diff >= 0 else f"↓ {abs(savings_diff):.1f}% di bawah rata-rata"
    savings_cls  = "positive" if savings_diff >= 0 else "negative"

    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown(f"""
        <div class="kpi-card accent-blue">
            <div class="kpi-icon">👥</div>
            <div class="kpi-title">Jumlah Responden</div>
            <div class="kpi-value">{total_cluster:,}</div>
            <div class="kpi-sub neutral">dalam cluster {selected_status}</div>
        </div>""", unsafe_allow_html=True)
    with k2:
        st.markdown(f"""
        <div class="kpi-card accent-green">
            <div class="kpi-icon">💰</div>
            <div class="kpi-title">Rata-rata Tabungan</div>
            <div class="kpi-value">{avg_savings:.1f}%</div>
            <div class="kpi-sub {savings_cls}">{savings_sub}</div>
        </div>""", unsafe_allow_html=True)
    with k3:
        st.markdown(f"""
        <div class="kpi-card accent-yellow">
            <div class="kpi-icon">🏠</div>
            <div class="kpi-title">Rata-rata Sewa</div>
            <div class="kpi-value">{avg_rent:.1f}%</div>
            <div class="kpi-sub neutral">dari total pendapatan</div>
        </div>""", unsafe_allow_html=True)
    with k4:
        st.markdown(f"""
        <div class="kpi-card accent-red">
            <div class="kpi-icon">📌</div>
            <div class="kpi-title">Pengeluaran Dominan</div>
            <div class="kpi-value">{dominant_name}</div>
            <div class="kpi-sub negative">{dominant_value:.1f}% dari income</div>
        </div>""", unsafe_allow_html=True)

    st.markdown("<hr class='soft-divider'>", unsafe_allow_html=True)

    col_donut, col_radar, col_insight = st.columns([2.2, 2.2, 1.6])

    # ═══════════════════════════════════════════════════════════════
    # DONUT CHART
    # ═══════════════════════════════════════════════════════════════
    with col_donut:

        st.markdown("""
        <div class='section-header'>
            <span class='icon'>🍩</span>
            <span class='title'>Distribusi Cluster</span>
        </div>
        <div class='section-desc'>
            Proporsi jumlah responden pada setiap kategori financial status.
        </div>
        """, unsafe_allow_html=True)

        cluster_count = df["Status_Label"].value_counts().reindex(
            ["Rentan", "Moderate", "Sehat"]
        )

        sizes  = cluster_count.values
        labels = cluster_count.index.tolist()

        colors = [COLOR_MAP[l] for l in labels]

        fig, ax = plt.subplots(figsize=(5, 5))

        fig.patch.set_facecolor(PANEL_COLOR)
        ax.set_facecolor(PANEL_COLOR)

        wedges, texts, autotexts = ax.pie(
            sizes,
            labels=None,
            colors=colors,
            autopct='%1.1f%%',
            startangle=90,
            wedgeprops=dict(
                width=0.55,
                edgecolor=PANEL_COLOR,
                linewidth=2
            ),
            pctdistance=0.78
        )

        for at in autotexts:
            at.set_color("white")
            at.set_fontsize(12)
            at.set_fontweight("bold")

        total = sum(sizes)

        ax.text(
            0, 0.08,
            str(total),
            ha='center',
            va='center',
            color='white',
            fontsize=22,
            fontweight='bold'
        )

        ax.text(
            0, -0.18,
            'Total',
            ha='center',
            va='center',
            color='#6b7688',
            fontsize=11
        )

        legend_patches = [
            mpatches.Patch(color=c, label=f"{l} ({v:,})")
            for c, l, v in zip(colors, labels, sizes)
        ]

        ax.legend(
            handles=legend_patches,
            loc='lower center',
            bbox_to_anchor=(0.5, -0.12),
            ncol=3,
            frameon=False,
            labelcolor='#c0cce0',
            fontsize=10
        )

        plt.tight_layout()

        st.pyplot(fig)

    # RADAR CHART
    with col_radar:

        st.markdown("""
        <div class='section-header'>
            <span class='icon'>🕸️</span>
            <span class='title'>Profil Finansial Cluster</span>
        </div>
        <div class='section-desc'>
            Perbandingan pola alokasi pendapatan antar cluster.
        </div>
        """, unsafe_allow_html=True)

        radar_cols = [
            "Savings_Ratio",
            "Rent_Ratio",
            "Loan_Repayment_Ratio",
            "Groceries_Ratio",
            "Transport_Ratio",
            "Eating_Out_Ratio",
            "Entertainment_Ratio",
            "Utilities_Ratio"
        ]

        radar_labels = [
            "Tabungan",
            "Sewa",
            "Cicilan",
            "Groceries",
            "Transport",
            "Makan Luar",
            "Hiburan",
            "Utilitas"
        ]

        radar_mean = (
            df
            .groupby("Status_Label")[radar_cols]
            .mean() * 100
        )

        angles = np.linspace(
            0,
            2 * np.pi,
            len(radar_cols),
            endpoint=False
        ).tolist()

        angles += angles[:1]

        fig = plt.figure(figsize=(6, 6))

        fig.patch.set_facecolor(PANEL_COLOR)

        ax = plt.subplot(111, polar=True)

        ax.set_facecolor(PANEL_COLOR)

        for cluster, color in COLOR_MAP.items():

            values = radar_mean.loc[cluster].tolist()

            values += values[:1]

            ax.plot(
                angles,
                values,
                linewidth=2.5,
                label=cluster,
                color=color
            )

            ax.fill(
                angles,
                values,
                alpha=0.12,
                color=color
            )

        ax.set_xticks(angles[:-1])

        ax.set_xticklabels(
            radar_labels,
            color="#c0cce0",
            fontsize=9
        )

        ax.set_yticklabels([])

        ax.grid(
            color="white",
            alpha=0.08,
            linestyle="--"
        )

        ax.spines["polar"].set_color("#2A3042")

        legend = ax.legend(
            loc="upper right",
            bbox_to_anchor=(1.25, 1.10),
            frameon=False
        )

        for text in legend.get_texts():
            text.set_color("white")

        st.pyplot(fig)


    # ═══════════════════════════════════════════════════════════════
    # INSIGHT
    # ═══════════════════════════════════════════════════════════════
    with col_insight:

        st.markdown("""
        <div class='section-header'>
            <span class='icon'>💡</span>
            <span class='title'>Interpretasi</span>
        </div>
        """, unsafe_allow_html=True)

        total_all = df.shape[0]

        pct_rentan = (
            df[df["Status_Label"]=="Rentan"].shape[0]
            / total_all * 100
        )

        pct_moderate = (
            df[df["Status_Label"]=="Moderate"].shape[0]
            / total_all * 100
        )

        pct_Sehat = (
            df[df["Status_Label"]=="Sehat"].shape[0]
            / total_all * 100
        )

        dominant_cl = max(
            {
                "Rentan": pct_rentan,
                "Moderate": pct_moderate,
                "Sehat": pct_Sehat
            },
            key=lambda k: {
                "Rentan": pct_rentan,
                "Moderate": pct_moderate,
                "Sehat": pct_Sehat
            }[k]
        )

        st.markdown(f"""
        <div class='insight-box'>

        Cluster <strong>{dominant_cl}</strong> mendominasi dataset dengan proporsi terbesar.

        <br><br>

        🔴 <strong>Rentan ({pct_rentan:.1f}%)</strong><br>
        Memiliki beban fixed-cost tinggi dan tabungan rendah.

        <br><br>

        🟡 <strong>Moderate ({pct_moderate:.1f}%)</strong><br>
        Relatif stabil namun masih memiliki tekanan pengeluaran rutin.

        <br><br>

        🟢 <strong>Sehat ({pct_Sehat:.1f}%)</strong><br>
        Menunjukkan pola finansial sehat dengan savings ratio tinggi.

        </div>
        """, unsafe_allow_html=True)

    # ── SECTION: Komposisi Pengeluaran (Progress Bars) ────────────────────────
    st.markdown(f"""
    <div class='section-header'>
        <span class='icon'>📊</span>
        <span class='title'>Komposisi Alokasi Pendapatan</span> — {selected_status}</span>
    </div>
    <div class='section-desc'>Rata-rata proporsi alokasi pendapatan pada setiap kategori finansial.</div>
    """, unsafe_allow_html=True)

    expense_data = {
        "💰 Tabungan":           avg_savings,
        "🏠 Sewa Tempat":        avg_rent,
        "💳 Cicilan":            avg_loan,
        "🛒 Groceries":          avg_groceries,
        "🚗 Transportasi":       avg_transport,
        "🍜 Makan di Luar":      avg_eating,
        "🎮 Hiburan":            avg_entertainment,
        "⚡ Utilitas":           avg_utilities,
    }

    sorted_expenses = sorted(expense_data.items(), key=lambda x: x[1], reverse=True)
    max_val = sorted_expenses[0][1] + 5

    col_a, col_b = st.columns(2)
    half = len(sorted_expenses) // 2
    color = COLOR_MAP[selected_status]
    with col_a:
        html_a = ""
        for name, val in sorted_expenses[:half]:
            html_a += progress_bar_html(name, val, color, max_val)
        st.markdown(html_a, unsafe_allow_html=True)
    with col_b:
        html_b = ""
        for name, val in sorted_expenses[half:]:
            html_b += progress_bar_html(name, val, color, max_val)
        st.markdown(html_b, unsafe_allow_html=True)

    st.markdown("<hr class='soft-divider'>", unsafe_allow_html=True)

    # ── SECTION: Heatmap Korelasi ─────────────────────────────────────────────
    
# ════════════════════════════════════════════════════════════════════════════
# PAGE 2 — PERTANYAAN BISNIS
# ════════════════════════════════════════════════════════════════════════════

else:
    st.markdown("<div class='page-title'>❓ Pertanyaan Bisnis</div>", unsafe_allow_html=True)
    st.markdown("<div class='page-subtitle'>Temukan jawaban atas pertanyaan kunci tentang pola finansial pengguna.</div>", unsafe_allow_html=True)

    questions = [
        "1. Apa pola alokasi keuangan yang membedakan cluster Rentan, Moderate, dan Sehat?",
        "2. Fitur apa yang paling berpengaruh terhadap klasifikasi kesehatan finansial?"
    ]
    q = st.selectbox("Pilih Pertanyaan", questions)

    st.markdown("<hr class='soft-divider'>", unsafe_allow_html=True)

    # ── Q1 ────────────────────────────────────────────────────────────────────
    if q.startswith("1."):

        st.markdown("""
        <div class='section-header'>
            <span class='icon'>🔍</span>
            <span class='title'>
                Pola Alokasi Keuangan Antar Cluster
            </span>
        </div>

        <div class='section-desc'>
            Perbandingan rata-rata alokasi pendapatan pada setiap cluster.
            Visualisasi ini menunjukkan pola finansial yang membedakan
            cluster Rentan, Moderate, dan Sehat.
        </div>
        """, unsafe_allow_html=True)

        # ── Mean tiap cluster ─────────────────────────────────────────
        mean_cluster = (
            df
            .groupby("Status_Label")[ALL_RATIO_COLS]
            .mean()
            * 100
        )

        # Rename label
        nice_labels = [
            EXPENSE_LABELS.get(
                c,
                c.replace("_Ratio", "").replace("_", " ")
            )
            for c in mean_cluster.columns
        ]

        x = np.arange(len(nice_labels))
        width = 0.25

        fig, ax = plt.subplots(figsize=(12, 6))

        fig, ax = setup_ax(fig, ax)

        # ── Bar Plot ──────────────────────────────────────────────────
        ax.bar(
            x - width,
            mean_cluster.loc["Rentan"],
            width,
            label="Rentan",
            color="#EF4444"
        )

        ax.bar(
            x,
            mean_cluster.loc["Moderate"],
            width,
            label="Moderate",
            color="#F59E0B"
        )

        ax.bar(
            x + width,
            mean_cluster.loc["Sehat"],
            width,
            label="Sehat",
            color="#10B981"
        )

        # ── Styling ───────────────────────────────────────────────────
        ax.set_xticks(x)

        ax.set_xticklabels(
            nice_labels,
            rotation=20,
            ha="right"
        )

        ax.set_ylabel("Rata-rata Rasio (%)")

        ax.set_title(
            "Perbandingan Alokasi Pendapatan Antar Cluster",
            fontsize=14,
            fontweight="bold"
        )

        legend = ax.legend(
            frameon=False,
            fontsize=10
        )

        for text in legend.get_texts():
            text.set_color("white")

        plt.tight_layout()

        st.pyplot(fig)

        # ── Insight ───────────────────────────────────────────────────
        # ==============================================================================
        # HEADER
        # ==============================================================================
        st.markdown("## 💡 Insight Pola Alokasi Keuangan Tiap Kategori")

        # BOX 1 — RENTAN
        st.error("""
        🔴 **Cluster Rentan**

        Memiliki kapasitas menabung yang sangat kritis, 
        hanya mampu menyisihkan sekitar **5.5%** dari pendapatan mereka. 
        Tingginya beban tetap seperti sewa tempat tinggal dan cicilan 
        menyebabkan kelompok ini memiliki ruang finansial yang sangat 
        terbatas untuk menghadapi kebutuhan darurat.
        """)

        # BOX 2 — MODERATE
        st.warning("""
        🟡 **Cluster Moderate**

        Memiliki kondisi finansial yang relatif lebih stabil 
        dengan **savings rate sebesar 16%**. Kelompok ini telah mampu 
        memenuhi kebutuhan rutin sekaligus mempertahankan kemampuan 
        menabung, meskipun sebagian pendapatan masih digunakan untuk 
        kebutuhan tetap seperti cicilan dan tempat tinggal.
        """)

        # BOX 3 — Sehat
        st.success("""
        🟢 **Cluster Sehat**

        Menunjukkan tingkat kesehatan finansial yang paling baik 
        dengan kemampuan menyisihkan hingga **30.5%** pendapatan 
        untuk tabungan maupun investasi. Rendahnya proporsi beban 
        cicilan memberikan ruang yang lebih besar untuk menjaga 
        stabilitas finansial dan melakukan akumulasi kekayaan 
        jangka panjang.
        """)
    

    # # ── Q2 ────────────────────────────────────────────────────────────────────
    elif q.startswith("2."):
        st.markdown("""
        <div class='section-header'>
            <span class='icon'>🔥</span>
            <span class='title'>Heatmap Korelasi Fitur</span>
        </div>
        <div class='section-desc'>Seberapa kuat hubungan antar variabel. Nilai +1 = korelasi positif sempurna, -1 = negatif sempurna.</div>
        """, unsafe_allow_html=True)

        corr_ratio_cols = [
        col for col in ALL_RATIO_COLS
        if col != "Savings_Ratio"
    ]

        corr_cols = corr_ratio_cols + ["Financial_Status"]
        corr      = df[corr_cols].corr()
        col_names = [c.replace("_Ratio", "").replace("_", " ") for c in corr.columns]

        fig, ax = plt.subplots(figsize=(11, 8))
        fig.patch.set_facecolor(PANEL_COLOR)
        ax.set_facecolor(PANEL_COLOR)

        custom_cmap = LinearSegmentedColormap.from_list(
            "custom_coolwarm",
            ["#ff6b6b", "#1A2035", "#06d6a0"],
            N=256
        )

        im = ax.imshow(corr, cmap=custom_cmap, aspect="auto", vmin=-1, vmax=1)

        ax.set_xticks(range(len(col_names)))
        ax.set_yticks(range(len(col_names)))
        ax.set_xticklabels(col_names, rotation=40, ha="right", color="#9aa4b2", fontsize=9)
        ax.set_yticklabels(col_names, color="#9aa4b2", fontsize=9)

        for i in range(len(corr.columns)):
            for j in range(len(corr.columns)):
                val    = corr.iloc[i, j]
                txt_c  = "white" if abs(val) > 0.4 else "#6b7688"
                weight = "bold"  if abs(val) > 0.6 else "normal"
                ax.text(j, i, f"{val:.2f}", ha="center", va="center",
                        color=txt_c, fontsize=8, fontweight=weight)

        for spine in ax.spines.values():
            spine.set_visible(False)
        ax.tick_params(length=0)

        cbar = fig.colorbar(im, fraction=0.03, pad=0.02)
        cbar.ax.yaxis.set_tick_params(color='#6b7688', labelsize=9)
        plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color='#9aa4b2')
        cbar.outline.set_visible(False)
        cbar.set_label("Korelasi", color="#6b7688", fontsize=10)

        ax.set_title("Correlation Matrix", color="white", fontsize=14, fontweight="bold", pad=14)

        plt.tight_layout()
        st.pyplot(fig)

        st.markdown("""
        <div class='insight-box'>
            <strong>Cara membaca heatmap:</strong><br>
            🟢 Hijau = korelasi positif (naik bersama) · 🔴 Merah = korelasi negatif (berlawanan) · Warna gelap = tidak ada hubungan.<br>
            Fokus pada baris/kolom <strong>Financial_Status</strong> untuk melihat fitur mana yang paling berpengaruh pada status keuangan.
        </div>
        """, unsafe_allow_html=True)
