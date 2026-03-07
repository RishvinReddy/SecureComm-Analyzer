import subprocess
import shutil
import tempfile
import os


def encrypt_text(plain_text, password):

    if shutil.which("gpg") is None:
        return {"success": False, "error": "GPG not installed"}

    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_in:
            temp_in.write(plain_text.encode())
            temp_in_path = temp_in.name

        temp_out_path = temp_in_path + ".gpg"

        command = [
            "gpg",
            "--batch",
            "--yes",
            "--passphrase", password,
            "--symmetric",
            "--cipher-algo", "AES256",
            "-o", temp_out_path,
            temp_in_path
        ]

        subprocess.run(command, check=True)

        with open(temp_out_path, "rb") as f:
            encrypted_data = f.read()

        os.remove(temp_in_path)
        os.remove(temp_out_path)

        return {
            "success": True,
            "encrypted_text": encrypted_data.hex()
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def decrypt_text(encrypted_hex, password):

    if shutil.which("gpg") is None:
        return {"success": False, "error": "GPG not installed"}

    try:
        encrypted_bytes = bytes.fromhex(encrypted_hex)

        with tempfile.NamedTemporaryFile(delete=False) as temp_in:
            temp_in.write(encrypted_bytes)
            temp_in_path = temp_in.name

        temp_out_path = temp_in_path + ".txt"

        command = [
            "gpg",
            "--batch",
            "--yes",
            "--passphrase", password,
            "-o", temp_out_path,
            "-d",
            temp_in_path
        ]

        subprocess.run(command, check=True)

        with open(temp_out_path, "r") as f:
            decrypted_text = f.read()

        os.remove(temp_in_path)
        os.remove(temp_out_path)

        return {
            "success": True,
            "decrypted_text": decrypted_text
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
