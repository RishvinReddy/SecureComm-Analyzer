from .services.overall_grader import compute_overall_grade
from .services.report_generator import generate_security_report
from .services.gpg_module import encrypt_text, decrypt_text
from .services.ssh_auditor import audit_ssh
from flask import Blueprint, jsonify, request
from .services.https_grader import grade_https
from .services.scanner import run_nmap_scan
from .services.tls_engine import compare_tls_versions
from .services.handshake_parser import parse_tls_handshake

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return {"message": "SecureComm Backend Running on Kali"}


@main.route("/api/grade", methods=["POST"])
def grade():
    data = request.json
    domain = data.get("domain")

    result = grade_https(domain)

    # Add TLS comparison
    tls_data = compare_tls_versions(domain)
    result["tls_comparison"] = tls_data

    # Add handshake packet analysis
    handshake_data = parse_tls_handshake(domain)
    result["handshake_analysis"] = handshake_data

    return jsonify(result)


@main.route("/api/scan/nmap", methods=["POST"])
def scan_nmap():
    data = request.json
    target = data.get("domain") or data.get("target")

    result = run_nmap_scan(target)
    return jsonify(result)


@main.route("/api/compare_tls", methods=["POST"])
def compare_tls():
    data = request.json
    domain = data.get("domain")

    result = compare_tls_versions(domain)
    return jsonify(result)


@main.route("/api/scan/ssh", methods=["POST"])
def scan_ssh():
    data = request.json
    target = data.get("domain") or data.get("target")

    result = audit_ssh(target)
    return jsonify(result)


@main.route("/api/gpg/encrypt", methods=["POST"])
def gpg_encrypt():
    data = request.json
    text = data.get("text")
    password = data.get("password")

    result = encrypt_text(text, password)
    return jsonify(result)


@main.route("/api/gpg/decrypt", methods=["POST"])
def gpg_decrypt():
    data = request.json
    encrypted_text = data.get("encrypted_text")
    password = data.get("password")

    result = decrypt_text(encrypted_text, password)
    return jsonify(result)


@main.route("/api/report/generate", methods=["POST"])
def generate_report():
    data = request.json
    domain = data.get("domain")

    https_data = grade_https(domain)
    tls_data = compare_tls_versions(domain)
    ssh_data = audit_ssh(domain)

    https_data["handshake_analysis"] = parse_tls_handshake(domain)

    report_path = generate_security_report(domain, https_data, tls_data, ssh_data)
    
    overall = compute_overall_grade(https_data, tls_data, ssh_data)

    return jsonify({
        "success": True,
        "report_path": report_path,
	"overall_grade": overall
    })
