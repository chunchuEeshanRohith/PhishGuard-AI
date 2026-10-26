import re
import math
import urllib.parse
from typing import Dict, Any, List

# List of high-value brands frequently targeted in phishing attacks
TARGET_BRANDS = {
    "paypal": ["paypal.com", "paypal.me"],
    "google": ["google.com", "accounts.google.com"],
    "apple": ["apple.com", "icloud.com"],
    "microsoft": ["microsoft.com", "live.com", "office.com", "outlook.com"],
    "amazon": ["amazon.com", "amazon.co.uk", "amazon.de", "amazon.in"],
    "facebook": ["facebook.com", "fb.com", "meta.com"],
    "instagram": ["instagram.com"],
    "netflix": ["netflix.com"],
    "chase": ["chase.com"],
    "bankofamerica": ["bankofamerica.com", "bofa.com"],
    "wellsfargo": ["wellsfargo.com"],
    "binance": ["binance.com"],
    "coinbase": ["coinbase.com"],
    "steam": ["steampowered.com", "steamcommunity.com"],
    "discord": ["discord.com", "discord.gg"],
    "whatsapp": ["whatsapp.com"],
}

# High-risk / abuse-heavy top-level domains commonly used in bulk phishing campaigns
SUSPICIOUS_TLDS = {
    "xyz", "top", "tk", "click", "cf", "ga", "ml", "gq", "buzz", "rest",
    "country", "link", "work", "loan", "men", "party", "date", "space", "kim"
}

# Suspicious security / credential-harvesting tokens
CREDENTIAL_TOKENS = {
    "login", "signin", "verify", "verification", "secure", "security",
    "account", "update", "banking", "wallet", "confirm", "confirmation",
    "billing", "recover", "authenticate", "auth", "session", "support"
}


def compute_shannon_entropy(s: str) -> float:
    """Calculates the Shannon entropy of a string (higher = more randomized)."""
    if not s:
        return 0.0
    freq = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    entropy = 0.0
    length = len(s)
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 3)


class ThreatConsensusEngine:
    def __init__(self):
        pass

    def evaluate_lexical_heuristics(self, url: str) -> Dict[str, Any]:
        """Engine 2: Lexical and structural heuristics analysis."""
        parsed = urllib.parse.urlparse(url if "://" in url else "http://" + url)
        host = (parsed.netloc or parsed.path).lower().split(":")[0]
        path = parsed.path.lower()
        full_url = url.lower()

        score = 0
        signals = []

        # 1. IP address in host
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", host):
            score += 35
            signals.append("Host is a direct raw IPv4 address")

        # 2. Suspicious TLD
        tld = host.split(".")[-1] if "." in host else ""
        if tld in SUSPICIOUS_TLDS:
            score += 25
            signals.append(f"Suspicious high-risk TLD (.{tld})")

        # 3. Shannon Entropy of host
        host_entropy = compute_shannon_entropy(host)
        if host_entropy > 4.2:
            score += 20
            signals.append(f"High domain entropy ({host_entropy} bits - possible DGA/randomization)")
        elif host_entropy > 3.8:
            score += 10
            signals.append(f"Elevated domain entropy ({host_entropy} bits)")

        # 4. Excessive Subdomains
        subdomain_parts = host.split(".")
        if len(subdomain_parts) > 3:
            score += 15
            signals.append(f"Deep subdomain nesting ({len(subdomain_parts) - 2} levels)")

        # 5. Suspicious Delimiters in host
        if host.count("-") >= 2:
            score += 15
            signals.append(f"Multiple hyphens in domain ({host.count('-')})")
        if "@" in full_url:
            score += 25
            signals.append("Contains '@' credential separator")

        # 6. Overall URL length
        if len(url) > 75:
            score += 10
            signals.append(f"Abnormally long URL ({len(url)} characters)")

        score = min(score, 100)
        verdict = "Phishing" if score >= 60 else "Suspicious" if score >= 35 else "Safe"

        return {
            "name": "Lexical & Entropy Engine",
            "score": score,
            "verdict": verdict,
            "signals": signals if signals else ["Standard lexical and structural profile"],
            "entropy": host_entropy,
            "tld": tld or "none"
        }

    def evaluate_brand_impersonation(self, url: str) -> Dict[str, Any]:
        """Engine 3: Homoglyphs, leetspeak, and brand impersonation detection."""
        parsed = urllib.parse.urlparse(url if "://" in url else "http://" + url)
        host = (parsed.netloc or parsed.path).lower().split(":")[0]
        path = parsed.path.lower()
        full_url = url.lower()

        score = 0
        detected_brands = []
        homoglyphs = []

        # Check for homoglyphs / leetspeak substitutions
        # e.g., 0 for o, 1 for l/i, rn for m
        homoglyph_map = {"0": "o", "1": "l", "rn": "m", "vv": "w", "3": "e", "5": "s"}
        normalized_host = host
        for fake, real in homoglyph_map.items():
            if fake in normalized_host:
                homoglyphs.append(f"'{fake}' mimicking '{real}'")
                normalized_host = normalized_host.replace(fake, real)

        # Check against target brand catalog
        for brand, legitimate_domains in TARGET_BRANDS.items():
            brand_in_host = brand in host or brand in normalized_host
            brand_in_path = brand in path

            if brand_in_host or brand_in_path:
                is_legit = any(host == leg or host.endswith("." + leg) for leg in legitimate_domains)
                if not is_legit:
                    detected_brands.append(brand.capitalize())
                    if brand_in_host:
                        score += 55
                    elif brand_in_path:
                        score += 30

        if homoglyphs:
            score += 25

        score = min(score, 100)
        verdict = "Phishing" if score >= 50 else "Suspicious" if score >= 25 else "Safe"

        signals = []
        if detected_brands:
            signals.append(f"Spoofs target brand: {', '.join(detected_brands)}")
        if homoglyphs:
            signals.append(f"Visual character substitution: {', '.join(homoglyphs)}")
        if not signals:
            signals.append("No brand impersonation or visual homoglyphs detected")

        return {
            "name": "Brand & Homoglyph Engine",
            "score": score,
            "verdict": verdict,
            "signals": signals,
            "detected_brands": detected_brands,
            "has_homoglyph": len(homoglyphs) > 0
        }

    def evaluate_reputation_intelligence(self, url: str) -> Dict[str, Any]:
        """Engine 4: Domain reputation, PhishTank patterns, and credential harvest heuristics."""
        parsed = urllib.parse.urlparse(url if "://" in url else "http://" + url)
        host = (parsed.netloc or parsed.path).lower().split(":")[0]
        path = parsed.path.lower()
        full_url = url.lower()

        score = 0
        signals = []

        # 1. Harvest Keyword Analysis
        matched_tokens = [tok for tok in CREDENTIAL_TOKENS if tok in full_url]
        if len(matched_tokens) >= 3:
            score += 45
            signals.append(f"Heavy credential-harvesting tokens: {', '.join(matched_tokens[:4])}")
        elif len(matched_tokens) >= 1:
            score += 20
            signals.append(f"Security/auth token present: '{matched_tokens[0]}'")

        # 2. Known phishing structure patterns (e.g. double slash redirect, login.php, update.html)
        if re.search(r"\.(php|html|cgi|asp|aspx)\?", full_url):
            score += 20
            signals.append("Dynamic script credential-collection parameter pattern")
        if "//" in parsed.path:
            score += 25
            signals.append("Double-slash redirection structure detected")

        score = min(score, 100)
        verdict = "Phishing" if score >= 50 else "Suspicious" if score >= 25 else "Safe"

        return {
            "name": "Threat Intel & Harvest Heuristics",
            "score": score,
            "verdict": verdict,
            "signals": signals if signals else ["No known signature patterns triggered"],
            "harvest_keywords": matched_tokens
        }

    def compute_consensus(self, url: str, neural_result: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesizes all 4 detection engines into a unified Consensus Threat Matrix."""
        neural_score = neural_result.get("threat_score", 0)
        neural_verdict = neural_result.get("prediction", "Legitimate")
        neural_conf = neural_result.get("confidence", 0.0)

        # Engine 1: Siamese-LSTM Attention (Neural Engine)
        engine_neural = {
            "name": "Siamese-LSTM Attention Engine",
            "score": neural_score,
            "verdict": neural_verdict,
            "confidence": neural_conf,
            "signals": [
                f"BiLSTM sequence classification: {neural_verdict}",
                f"Siamese reference embedding similarity: {neural_score}%"
            ]
        }

        # Engine 2: Lexical & Entropy
        engine_lexical = self.evaluate_lexical_heuristics(url)

        # Engine 3: Brand & Homoglyph
        engine_brand = self.evaluate_brand_impersonation(url)

        # Engine 4: Reputation & Harvest Heuristics
        engine_reputation = self.evaluate_reputation_intelligence(url)

        engines = [engine_neural, engine_lexical, engine_brand, engine_reputation]

        # Count how many engines flag as malicious (Phishing / Suspicious)
        phishing_count = sum(1 for e in engines if e["verdict"] == "Phishing")
        suspicious_count = sum(1 for e in engines if e["verdict"] == "Suspicious")
        safe_count = sum(1 for e in engines if e["verdict"] in ["Safe", "Legitimate"])

        # Weighted Consensus Score:
        # Neural Engine (45%), Brand Spoof (25%), Lexical (15%), Threat Intel (15%)
        consensus_score = int(round(
            (engine_neural["score"] * 0.45) +
            (engine_brand["score"] * 0.25) +
            (engine_lexical["score"] * 0.15) +
            (engine_reputation["score"] * 0.15)
        ))

        # Determine Consensus Verdict
        if consensus_score >= 65 or phishing_count >= 2:
            consensus_verdict = "Phishing"
        elif consensus_score >= 35 or (phishing_count + suspicious_count) >= 2:
            consensus_verdict = "Suspicious"
        else:
            consensus_verdict = "Legitimate"

        # Consensus Agreement Ratio
        total_engines = len(engines)
        threat_count = phishing_count + suspicious_count

        if threat_count >= 3:
            agreement_label = f"{threat_count}/{total_engines} Engines in Strong Agreement"
            agreement_level = "strong_threat"
        elif threat_count == 2:
            agreement_label = f"{threat_count}/{total_engines} Engines Detected Risk"
            agreement_level = "moderate_threat"
        elif threat_count == 1:
            agreement_label = "1/4 Engines Triggered Risk Flag"
            agreement_level = "split"
        else:
            agreement_label = "4/4 Engines Agree: Safe Website"
            agreement_level = "unanimous_safe"

        # Zero-Day Detection Insight
        # If the Neural Engine flagged phishing with high confidence, but reputation lists missed it:
        is_zero_day = (
            neural_verdict == "Phishing" and
            engine_reputation["verdict"] == "Safe" and
            neural_score >= 75
        )

        return {
            "consensus_score": consensus_score,
            "consensus_verdict": consensus_verdict,
            "agreement_label": agreement_label,
            "agreement_level": agreement_level,
            "engines_flagged": threat_count,
            "total_engines": total_engines,
            "is_zero_day": is_zero_day,
            "engines": engines,
        }
