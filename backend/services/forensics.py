"""
URL Deep Forensics Service
Performs multi-layer analysis using only Python stdlib (no extra pip deps):
  - URL anatomy decomposition
  - DNS resolution (IPv4 / IPv6 / reverse)
  - SSL/TLS certificate inspection
  - Redirect chain tracing (up to 8 hops)
  - Credential-harvest token scanning
  - Shannon entropy analysis
  - Weighted multi-category risk indicator engine
"""

import re
import math
import socket
import ssl
import datetime
import urllib.parse
import urllib.request
import urllib.error
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq: Dict[str, int] = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    n = len(s)
    return round(-sum((c / n) * math.log2(c / n) for c in freq.values()), 4)


def _clean_url(url: str) -> str:
    url = url.strip()
    if not re.match(r"^https?://", url, re.I):
        url = "http://" + url
    return url


# ── DNS Resolution ────────────────────────────────────────────────────────────

def _dns_resolve(host: str) -> Dict[str, Any]:
    result = {"ipv4": [], "ipv6": [], "resolved": False, "reverse_dns": None, "error": None}
    try:
        infos = socket.getaddrinfo(host, None)
        for info in infos:
            af, _, _, _, sockaddr = info
            addr = sockaddr[0]
            if af == socket.AF_INET and addr not in result["ipv4"]:
                result["ipv4"].append(addr)
            elif af == socket.AF_INET6 and addr not in result["ipv6"]:
                result["ipv6"].append(addr)
        result["resolved"] = bool(result["ipv4"] or result["ipv6"])
    except socket.gaierror as e:
        result["error"] = f"DNS resolution failed: {str(e)}"
    except Exception as e:
        result["error"] = str(e)

    if result["ipv4"]:
        try:
            hostname, _, _ = socket.gethostbyaddr(result["ipv4"][0])
            result["reverse_dns"] = hostname
        except Exception:
            result["reverse_dns"] = None

    return result


# ── SSL/TLS Certificate ───────────────────────────────────────────────────────

def _ssl_info(host: str, port: int = 443) -> Dict[str, Any]:
    result = {
        "has_ssl": False, "issuer": None, "subject": None,
        "valid_from": None, "valid_to": None, "days_remaining": None,
        "is_expired": False, "is_self_signed": False,
        "san_domains": [], "protocol": None, "error": None,
    }
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with socket.create_connection((host, port), timeout=5) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                cert = ssock.getpeercert()
                result["has_ssl"] = True
                result["protocol"] = ssock.version()
                if cert:
                    def _flat(fields):
                        return {k: v for pair in fields for k, v in [pair]}
                    issuer = _flat(cert.get("issuer", []))
                    subject = _flat(cert.get("subject", []))
                    result["issuer"] = issuer.get("organizationName") or issuer.get("commonName", "Unknown")
                    result["subject"] = subject.get("commonName", "Unknown")
                    fmt = "%b %d %H:%M:%S %Y %Z"
                    try:
                        dt_to = datetime.datetime.strptime(cert.get("notAfter", ""), fmt)
                        dt_from = datetime.datetime.strptime(cert.get("notBefore", ""), fmt)
                        now = datetime.datetime.utcnow()
                        result["valid_from"] = dt_from.strftime("%Y-%m-%d")
                        result["valid_to"] = dt_to.strftime("%Y-%m-%d")
                        result["days_remaining"] = (dt_to - now).days
                        result["is_expired"] = dt_to < now
                    except Exception:
                        pass
                    result["is_self_signed"] = (result["issuer"] == result["subject"])
                    san_list = cert.get("subjectAltName", [])
                    result["san_domains"] = [v for (k, v) in san_list if k == "DNS"]
    except ssl.SSLError as e:
        result["error"] = f"SSL error: {str(e)[:80]}"
    except ConnectionRefusedError:
        result["error"] = "Port 443 refused (no HTTPS)"
    except socket.timeout:
        result["error"] = "SSL connection timed out"
    except Exception as e:
        result["error"] = str(e)[:100]
    return result


# ── Redirect Chain ────────────────────────────────────────────────────────────

def _follow_redirects(url: str, max_hops: int = 8) -> Dict[str, Any]:
    chain = []
    current_url = url
    total_hops = 0
    final_url = url
    error = None

    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    opener = urllib.request.build_opener(NoRedirect())

    for _ in range(max_hops):
        try:
            req = urllib.request.Request(
                current_url,
                headers={"User-Agent": "PhishGuardBot/1.0 (Security Scanner)"},
            )
            try:
                resp = opener.open(req, timeout=4)
                code = resp.getcode()
                chain.append({
                    "url": current_url,
                    "status_code": code,
                    "is_redirect": False,
                    "protocol": "HTTPS" if current_url.startswith("https") else "HTTP",
                })
                final_url = current_url
                break
            except urllib.error.HTTPError as he:
                location = he.headers.get("Location", "")
                chain.append({
                    "url": current_url,
                    "status_code": he.code,
                    "is_redirect": bool(location),
                    "redirects_to": location,
                    "protocol": "HTTPS" if current_url.startswith("https") else "HTTP",
                })
                if location:
                    if location.startswith("//"):
                        scheme = urllib.parse.urlparse(current_url).scheme
                        location = f"{scheme}:{location}"
                    elif not location.startswith("http"):
                        base = urllib.parse.urlparse(current_url)
                        location = f"{base.scheme}://{base.netloc}{location}"
                    current_url = location
                    total_hops += 1
                else:
                    break
        except urllib.error.URLError as e:
            error = str(e.reason)[:100]
            chain.append({"url": current_url, "status_code": None, "is_redirect": False,
                          "error": error, "protocol": "HTTPS" if current_url.startswith("https") else "HTTP"})
            break
        except Exception as e:
            error = str(e)[:100]
            break

    has_upgrade = any(
        not c["url"].startswith("https") and c.get("redirects_to", "").startswith("https")
        for c in chain
    )
    return {"chain": chain, "total_hops": total_hops, "final_url": final_url,
            "has_http_to_https_upgrade": has_upgrade, "error": error}


# ── URL Anatomy ───────────────────────────────────────────────────────────────

def _url_anatomy(url: str, parsed: urllib.parse.ParseResult) -> Dict[str, Any]:
    host = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""
    fragment = parsed.fragment or ""
    scheme = parsed.scheme or "http"
    port = parsed.port

    parts = host.split(".")
    tld = parts[-1] if parts else ""
    domain = ".".join(parts[-2:]) if len(parts) >= 2 else host
    subdomains = parts[:-2] if len(parts) > 2 else []

    params = {}
    if query:
        try:
            params = dict(urllib.parse.parse_qsl(query))
        except Exception:
            pass

    path_segments = [s for s in path.split("/") if s]
    suspicious_extensions = {".php", ".aspx", ".cgi", ".asp", ".exe", ".bat", ".sh"}
    path_ext = None
    if path_segments:
        last = path_segments[-1]
        if "." in last:
            path_ext = "." + last.rsplit(".", 1)[-1].lower()

    return {
        "scheme": scheme,
        "host": host,
        "domain": domain,
        "tld": tld,
        "subdomains": subdomains,
        "subdomain_depth": len(subdomains),
        "path": path,
        "path_segments": path_segments,
        "path_depth": len(path_segments),
        "path_extension": path_ext,
        "has_suspicious_extension": (path_ext in suspicious_extensions) if path_ext else False,
        "query_params": params,
        "query_param_count": len(params),
        "fragment": fragment or None,
        "port": port,
        "total_length": len(url),
        "host_entropy": _shannon_entropy(host),
        "has_ip_host": bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", host)),
        "has_at_symbol": "@" in url,
        "has_double_slash_redirect": "//" in path,
        "hyphen_count": host.count("-"),
        "numeric_chars_in_host": sum(1 for c in host if c.isdigit()),
    }


# ── Risk Indicators ───────────────────────────────────────────────────────────

SUSPICIOUS_TLDS = {
    "xyz", "top", "tk", "click", "cf", "ga", "ml", "gq", "buzz", "rest",
    "country", "link", "work", "loan", "men", "party", "date", "space", "kim",
    "pw", "info", "biz", "su",
}

CREDENTIAL_TOKENS = {
    "login", "signin", "verify", "verification", "secure", "security",
    "account", "update", "banking", "wallet", "confirm", "billing",
    "recover", "authenticate", "auth", "session", "support", "password",
}


def _compute_risk_indicators(anatomy, dns, ssl_d, redirects) -> List[Dict[str, Any]]:
    indicators = []

    def add(category, label, severity, detail=""):
        indicators.append({"category": category, "label": label, "severity": severity, "detail": detail})

    if anatomy["has_ip_host"]:
        add("URL Structure", "IP address as hostname", "critical", f"Host: {anatomy['host']}")
    if anatomy["tld"] in SUSPICIOUS_TLDS:
        add("URL Structure", f"High-risk TLD (.{anatomy['tld']})", "high", "Commonly used in phishing campaigns")
    if anatomy["has_at_symbol"]:
        add("URL Structure", "@ symbol in URL", "critical", "Can redirect browsers to attacker-controlled host")
    if anatomy["has_double_slash_redirect"]:
        add("URL Structure", "Double-slash in path", "high", "Common open-redirect evasion pattern")
    if anatomy["subdomain_depth"] >= 3:
        add("URL Structure", f"Deep subdomain nesting ({anatomy['subdomain_depth']} levels)", "medium",
            f"Host: {anatomy['host']}")
    if anatomy["hyphen_count"] >= 3:
        add("URL Structure", f"Excessive hyphens in domain ({anatomy['hyphen_count']})", "medium",
            "Used to construct convincing-looking fake domains")
    if anatomy["host_entropy"] > 4.2:
        add("URL Structure", f"High domain entropy ({anatomy['host_entropy']} bits)", "high",
            "Possible DGA or randomly-generated hostname")
    if anatomy["total_length"] > 100:
        add("URL Structure", f"Abnormally long URL ({anatomy['total_length']} chars)", "low", "")
    if anatomy["has_suspicious_extension"]:
        add("URL Structure", f"Suspicious path extension ({anatomy['path_extension']})", "medium",
            "Common in credential-harvesting landing pages")
    if anatomy["query_param_count"] > 5:
        add("URL Structure", f"Many query parameters ({anatomy['query_param_count']})", "low", "")

    url_lower = anatomy["host"] + anatomy["path"]
    matched = [t for t in CREDENTIAL_TOKENS if t in url_lower]
    if len(matched) >= 2:
        add("Credential Harvesting", "Multiple auth/security tokens in URL", "high",
            f"Tokens: {', '.join(matched[:4])}")
    elif len(matched) == 1:
        add("Credential Harvesting", f"Security token in URL: '{matched[0]}'", "medium", "")

    if not dns["resolved"]:
        add("DNS", "Domain does not resolve", "critical", "URL points to an unregistered or taken-down domain")
    if dns.get("reverse_dns") and dns.get("ipv4"):
        rdns = dns["reverse_dns"]
        if anatomy["host"] not in rdns and not rdns.endswith(anatomy["domain"]):
            add("DNS", "Reverse DNS mismatch", "medium", f"IP {dns['ipv4'][0]} resolves back to {rdns}")

    if anatomy["scheme"] == "https":
        if ssl_d.get("error"):
            add("SSL/TLS", "HTTPS but SSL handshake failed", "high", ssl_d["error"])
        elif ssl_d.get("is_self_signed"):
            add("SSL/TLS", "Self-signed SSL certificate", "high", "Cert issuer matches subject")
        elif ssl_d.get("is_expired"):
            add("SSL/TLS", "SSL certificate expired", "critical", f"Expired: {ssl_d.get('valid_to', 'unknown')}")
        elif ssl_d.get("days_remaining") is not None and ssl_d["days_remaining"] < 7:
            add("SSL/TLS", f"SSL expiring in {ssl_d['days_remaining']} days", "medium", "")
    else:
        add("SSL/TLS", "No HTTPS — plain HTTP only", "high", "Data transmitted without encryption")

    hops = redirects["total_hops"]
    if hops >= 4:
        add("Redirect Chain", f"Deep redirect chain ({hops} hops)", "high",
            "Multi-hop redirects often used to obscure final phishing destination")
    elif hops >= 2:
        add("Redirect Chain", f"Multiple redirects ({hops} hops)", "medium", "")

    return indicators


# ── Entry Point ───────────────────────────────────────────────────────────────

def run_forensics(raw_url: str) -> Dict[str, Any]:
    url = _clean_url(raw_url)
    parsed = urllib.parse.urlparse(url)
    host = parsed.hostname or ""

    anatomy = _url_anatomy(raw_url, parsed)
    dns = _dns_resolve(host) if host else {"resolved": False, "error": "No host", "ipv4": [], "ipv6": [], "reverse_dns": None}
    ssl_data = _ssl_info(host) if host else {"has_ssl": False, "error": "No host"}
    redirects = _follow_redirects(url)
    risk_indicators = _compute_risk_indicators(anatomy, dns, ssl_data, redirects)

    weights = {"critical": 40, "high": 20, "medium": 10, "low": 5}
    raw_score = sum(weights.get(i["severity"], 0) for i in risk_indicators)
    forensic_risk_score = min(raw_score, 100)

    if forensic_risk_score >= 70:
        forensic_verdict = "Critical Risk"
    elif forensic_risk_score >= 45:
        forensic_verdict = "High Risk"
    elif forensic_risk_score >= 20:
        forensic_verdict = "Moderate Risk"
    else:
        forensic_verdict = "Low Risk"

    return {
        "url": raw_url,
        "cleaned_url": url,
        "forensic_risk_score": forensic_risk_score,
        "forensic_verdict": forensic_verdict,
        "anatomy": anatomy,
        "dns": dns,
        "ssl": ssl_data,
        "redirects": redirects,
        "risk_indicators": risk_indicators,
        "indicator_count": len(risk_indicators),
        "critical_count": sum(1 for i in risk_indicators if i["severity"] == "critical"),
        "high_count": sum(1 for i in risk_indicators if i["severity"] == "high"),
        "medium_count": sum(1 for i in risk_indicators if i["severity"] == "medium"),
        "low_count": sum(1 for i in risk_indicators if i["severity"] == "low"),
        "analyzed_at": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
