from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
    Table,
    TableStyle
)
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import green, orange, red
import os
import datetime

from .overall_grader import compute_overall_grade


def generate_security_report(domain, https_data, tls_data, ssh_data):

    # =========================
    # Setup
    # =========================
    os.makedirs("reports", exist_ok=True)
    filename = f"report_{domain}.pdf"
    filepath = os.path.join("reports", filename)

    doc = SimpleDocTemplate(filepath, pagesize=A4)
    elements = []

    styles = getSampleStyleSheet()
    normal_style = styles["Normal"]

    # =========================
    # Compute Overall Grade
    # =========================
    overall = compute_overall_grade(https_data, tls_data, ssh_data)

    risk_color = {
        "green": green,
        "orange": orange,
        "red": red
    }.get(overall["color"], colors.black)

    grade_style = ParagraphStyle(
        name="GradeStyle",
        parent=styles["Heading1"],
        textColor=risk_color
    )

    # =========================
    # Title
    # =========================
    elements.append(Paragraph("SecureComm Security Audit Report", styles["Title"]))
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph(f"<b>Domain:</b> {domain}", normal_style))
    elements.append(Paragraph(f"<b>Generated On:</b> {datetime.datetime.now()}", normal_style))
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(HRFlowable(width="100%", thickness=1))
    elements.append(Spacer(1, 0.3 * inch))

    # =========================
    # Executive Summary
    # =========================
    elements.append(Paragraph("Executive Summary", styles["Heading2"]))
    elements.append(Spacer(1, 0.2 * inch))

    elements.append(Paragraph(
        f"Overall Security Grade: {overall['grade']} ({overall['risk_level']})",
        grade_style
    ))

    elements.append(Spacer(1, 0.2 * inch))

    elements.append(Paragraph(
        f"Security Score: {overall['score']} / 100",
        normal_style
    ))

    elements.append(Spacer(1, 0.3 * inch))
    elements.append(HRFlowable(width="100%", thickness=1))
    elements.append(Spacer(1, 0.4 * inch))

    # =========================
    # HTTPS Certificate Analysis
    # =========================
    elements.append(Paragraph("HTTPS Certificate Analysis", styles["Heading2"]))
    elements.append(Spacer(1, 0.2 * inch))

    https_table_data = [
        ["Status", https_data.get("status")],
        ["Issuer", https_data.get("issuer")],
        ["Protocol Version", https_data.get("protocol_version")],
        ["Cipher Suite", https_data.get("cipher_suite")],
        ["Valid From", https_data.get("valid_from")],
        ["Valid To", https_data.get("valid_to")]
    ]

    https_table = Table(https_table_data, colWidths=[2.5 * inch, 3.5 * inch])
    https_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))

    elements.append(https_table)
    elements.append(Spacer(1, 0.4 * inch))

    # =========================
    # TLS Comparison
    # =========================
    elements.append(Paragraph("TLS Protocol Comparison", styles["Heading2"]))
    elements.append(Spacer(1, 0.2 * inch))

    tls12 = tls_data.get("tls_1_2", {})
    tls13 = tls_data.get("tls_1_3", {})

    tls_table_data = [
        ["TLS 1.2 Supported", str(tls12.get("supported"))],
        ["TLS 1.2 Cipher", tls12.get("cipher")],
        ["TLS 1.3 Supported", str(tls13.get("supported"))],
        ["TLS 1.3 Cipher", tls13.get("cipher")]
    ]

    tls_table = Table(tls_table_data, colWidths=[2.5 * inch, 3.5 * inch])
    tls_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))

    elements.append(tls_table)
    elements.append(Spacer(1, 0.4 * inch))

    # =========================
    # SSH Audit Section
    # =========================
    elements.append(Paragraph("SSH Security Audit", styles["Heading2"]))
    elements.append(Spacer(1, 0.2 * inch))

    elements.append(Paragraph(
        f"SSH Grade: {ssh_data.get('grade')}",
        normal_style
    ))

    elements.append(Spacer(1, 0.2 * inch))

    for key in ssh_data.get("keys_found", []):
        elements.append(Paragraph(
            f"{key['key_type']} — {key['status']}",
            normal_style
        ))

    elements.append(Spacer(1, 0.4 * inch))

    # =========================
    # TLS Handshake Summary
    # =========================
    elements.append(Paragraph("TLS Handshake Analysis", styles["Heading2"]))
    elements.append(Spacer(1, 0.2 * inch))

    handshake = https_data.get("handshake_analysis", {})
    packet_count = handshake.get("packet_count", 0)

    elements.append(Paragraph(
        f"Total Handshake Packets Captured: {packet_count}",
        normal_style
    ))

    elements.append(Spacer(1, 0.4 * inch))

    # =========================
    # Footer
    # =========================
    elements.append(HRFlowable(width="100%", thickness=1))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(
        "Generated by SecureComm Analyzer — Network Security Evaluation Toolkit",
        styles["Italic"]
    ))

    # Build PDF
    doc.build(elements)

    return filepath
