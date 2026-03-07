
import subprocess
import shutil
import re


def run_tls_openssl(domain, tls_flag):

    if shutil.which("openssl") is None:
        return {"supported": False}

    command = f"echo | openssl s_client -connect {domain}:443 {tls_flag}"

    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=10
        )

        output = result.stdout + result.stderr

        # =============================
        # Extract Protocol
        # =============================
        protocol_match = re.search(r"Protocol:\s*(.*)", output)

        # =============================
        # Extract Cipher
        # Handles BOTH:
        #   Cipher    : ...
        #   Cipher is ...
        # =============================
        cipher_match = re.search(r"Cipher\s*:\s*(.*)", output)

        if not cipher_match:
            cipher_match = re.search(r"Cipher is (.*)", output)

        if protocol_match:
            return {
                "supported": True,
                "protocol": protocol_match.group(1).strip(),
                "cipher": cipher_match.group(1).strip() if cipher_match else None
            }

        return {"supported": False}

    except Exception as e:
        return {
            "supported": False,
            "error": str(e)
        }


def compare_tls_versions(domain):

    tls12 = run_tls_openssl(domain, "-tls1_2")
    tls13 = run_tls_openssl(domain, "-tls1_3")

    return {
        "mode": "OpenSSL (Linux)",
        "tls_1_2": tls12,
        "tls_1_3": tls13
    }


def generate_tls_insight(tls_data):

    insights = []

    tls12 = tls_data.get("tls_1_2", {})
    tls13 = tls_data.get("tls_1_3", {})

    if tls13.get("supported"):
        insights.append("TLS 1.3 is supported (Recommended).")
    else:
        insights.append("TLS 1.3 is NOT supported (Upgrade recommended).")

    if tls12.get("supported"):
        insights.append("TLS 1.2 is supported.")
    else:
        insights.append("TLS 1.2 is NOT supported.")

    return insights
