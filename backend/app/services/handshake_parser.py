import subprocess
import shutil
import time

def parse_tls_handshake(domain):

    if shutil.which("tshark") is None:
        return {
            "supported": False,
            "reason": "tshark not installed"
        }

    try:
        # Start tshark capture first
        tshark_command = [
            "tshark",
            "-i", "any",
            "-f", "tcp port 443",
            "-Y", "tls.handshake",
            "-T", "fields",
            "-e", "tls.handshake.type",
            "-e", "tls.handshake.version",
            "-e", "tls.handshake.ciphersuite"
        ]

        tshark_process = subprocess.Popen(
            tshark_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        # Give tshark time to initialize
        time.sleep(1)

        # Trigger TLS handshake
        subprocess.run(
            f"echo | openssl s_client -connect {domain}:443",
            shell=True,
            capture_output=True,
            text=True,
            timeout=8
        )

        # Allow packets to be captured
        time.sleep(2)

        # Terminate tshark
        tshark_process.terminate()

        stdout, stderr = tshark_process.communicate(timeout=5)

        lines = stdout.strip().split("\n")

        packets = []

        for line in lines:
            if line.strip():
                parts = line.split("\t")
                packets.append({
                    "handshake_type": parts[0] if len(parts) > 0 else None,
                    "version": parts[1] if len(parts) > 1 else None,
                    "cipher_suite": parts[2] if len(parts) > 2 else None
                })

        return {
            "supported": True,
            "packet_count": len(packets),
            "packets": packets
        }

    except Exception as e:
        return {
            "supported": False,
            "error": str(e)
        }
