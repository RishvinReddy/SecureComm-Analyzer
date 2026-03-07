import subprocess
import shutil


def audit_ssh(target):

    if shutil.which("ssh-keyscan") is None:
        return {
            "supported": False,
            "reason": "ssh-keyscan not installed"
        }

    try:
        command = ["ssh-keyscan", "-T", "5", target]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=10
        )

        output = result.stdout.strip()

        if not output:
            return {
                "supported": False,
                "reason": "No SSH service detected"
            }

        lines = output.split("\n")

        findings = []
        grade_score = 100  # Start with perfect score

        for line in lines:

            # Skip comments or malformed lines
            if line.startswith("#"):
                continue

            parts = line.split()

            if len(parts) < 3:
                continue

            hostname = parts[0]
            key_type = parts[1]

            finding = {
                "key_type": key_type,
                "status": "Secure"
            }

            # Classification
            if key_type == "ssh-ed25519":
                finding["status"] = "Strong (Recommended)"

            elif key_type.startswith("ecdsa"):
                finding["status"] = "Strong (Modern ECDSA)"

            elif key_type == "ssh-rsa":
                finding["status"] = "Legacy RSA (Acceptable but aging)"
                grade_score -= 10

            elif key_type == "ssh-dss":
                finding["status"] = "Insecure (DSA deprecated)"
                grade_score -= 40

            findings.append(finding)

        # Determine final grade
        if grade_score >= 90:
            grade = "A"
        elif grade_score >= 75:
            grade = "B"
        elif grade_score >= 60:
            grade = "C"
        else:
            grade = "D"

        return {
            "supported": True,
            "grade": grade,
            "keys_found": findings
        }

    except Exception as e:
        return {
            "supported": False,
            "error": str(e)
        }
