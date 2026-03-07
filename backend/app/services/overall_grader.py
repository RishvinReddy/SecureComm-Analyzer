def compute_overall_grade(https_data, tls_data, ssh_data):

    score = 100

    # HTTPS certificate status
    if https_data.get("status") != "Secure":
        score -= 30

    # TLS 1.3 support
    tls13 = tls_data.get("tls_1_3", {})
    if not tls13.get("supported"):
        score -= 20

    # SSH grade penalty
    ssh_grade = ssh_data.get("grade", "A")

    if ssh_grade == "B":
        score -= 10
    elif ssh_grade == "C":
        score -= 20
    elif ssh_grade == "D":
        score -= 40

    # Determine final grade
    if score >= 90:
        grade = "A"
        risk = "Low Risk"
        color = "green"
    elif score >= 75:
        grade = "B"
        risk = "Moderate Risk"
        color = "orange"
    elif score >= 60:
        grade = "C"
        risk = "Elevated Risk"
        color = "orange"
    else:
        grade = "D"
        risk = "High Risk"
        color = "red"

    return {
        "score": score,
        "grade": grade,
        "risk_level": risk,
        "color": color
    }
