import subprocess
import json
import socket
from urllib.parse import urlparse

def run_nmap_scan(target):
    # Clean the target (remove http://, path, etc.)
    if target.startswith("http"):
        target = urlparse(target).hostname
    else:
        target = target.split('/')[0]

    try:
        # Resolve to IP to ensure we're scanning the right thing
        ip_addr = socket.gethostbyname(target)
    except socket.gaierror:
        return {"target": target, "status": "Error", "error": "Could not resolve hostname."}

    try:
        # Run a fast Nmap scan (-F = top 100 ports, -T4 = aggressive timing)
        # We use standard output parsing for simplicity without requiring python-nmap package
        result = subprocess.run(
            ["nmap", "-F", "-T4", ip_addr],
            capture_output=True,
            text=True,
            check=True
        )
        
        output = result.stdout
        open_ports = []
        
        # Parse standard nmap output
        for line in output.split('\n'):
            if "/tcp" in line and "open" in line:
                parts = line.split()
                if len(parts) >= 3:
                    open_ports.append({
                        "port": parts[0],
                        "state": parts[1],
                        "service": parts[2]
                    })

        return {
            "target": target,
            "ip": ip_addr,
            "status": "Success",
            "open_ports": open_ports,
            "raw_output": output
        }

    except FileNotFoundError:
        return {
            "target": target,
            "status": "Error", 
            "error": "Nmap is not installed or not in the system PATH. Please install Nmap on this OS to use this feature."
        }
    except subprocess.CalledProcessError as e:
        return {
            "target": target,
            "status": "Error",
            "error": f"Nmap scan failed: {e.stderr}"
        }
    except Exception as e:
        return {
            "target": target,
            "status": "Error",
            "error": str(e)
        }