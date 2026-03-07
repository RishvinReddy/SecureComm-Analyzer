import ssl
import socket
from datetime import datetime
from .tls_engine import compare_tls_versions, generate_tls_insight
from .handshake_parser import parse_tls_handshake

def grade_https(domain):
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                cipher = ssock.cipher()
                version = ssock.version()

        # Extract useful information
        issuer = dict(x[0] for x in cert.get("issuer", []))
        subject = dict(x[0] for x in cert.get("subject", []))
        
        not_before = datetime.strptime(cert.get("notBefore"), "%b %d %H:%M:%S %Y %Z").strftime("%Y-%m-%d %H:%M:%S")
        not_after = datetime.strptime(cert.get("notAfter"), "%b %d %H:%M:%S %Y %Z").strftime("%Y-%m-%d %H:%M:%S")
        
        sans = [x[1] for x in cert.get("subjectAltName", [])]
        
        # Integrate Dual-Mode TLS Comparison & Insights
        tls_comp = compare_tls_versions(domain)
        insights = generate_tls_insight(tls_comp)
        
        # Integrate tshark handshake parser
        handshake_data = parse_tls_handshake(domain)

        return {
            "domain": domain,
            "status": "Secure",
            "protocol_version": version,
            "cipher_suite": cipher[0],
            "cipher_version": cipher[1],
            "issuer": issuer.get("organizationName", issuer.get("commonName", "Unknown")),
            "subject": subject.get("commonName", domain),
            "valid_from": not_before,
            "valid_to": not_after,
            "subject_alt_names": sans[:5] + (["..."] if len(sans) > 5 else []),
            "tls_comparison": tls_comp,
            "tls_insights": insights,
            "handshake_analysis": handshake_data
        }

    except Exception as e:
        return {
            "domain": domain,
            "status": "Insecure",
            "error": str(e)
        }
