import re


def validate_url_input(data: dict) -> tuple[bool, str]:
    """
    Validates the incoming JSON data for a URL.
    Returns (is_valid, error_message).
    """
    if not data or "url" not in data:
        return False, "URL is missing."

    url = str(data["url"]).strip()
    if not url:
        return False, "URL cannot be empty."

    # Check unsupported protocols
    if url.startswith(("ftp://", "file://", "ws://")):
        return False, "Unsupported protocol. Please provide an HTTP/HTTPS URL."

    if not url.startswith(("http://", "https://")):
        url = "http://" + url

    # Regex to enforce a real domain structure (needs at least one dot in the domain)
    # e.g. domain.com or sub.domain.co.uk
    regex = re.compile(
        r"^(?:http|ftp)s?://"  # http:// or https://
        r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|"  # domain...
        r"localhost|"  # localhost...
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # ...or ip
        r"(?::\d+)?"  # optional port
        r"(?:/?|[/?]\S+)$",
        re.IGNORECASE,
    )

    if re.match(regex, url) is None:
        return False, "Invalid URL format."

    return True, ""
