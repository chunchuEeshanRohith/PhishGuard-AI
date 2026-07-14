import re
import socket
import urllib.parse
import urllib.request
import json
import os


class FeatureExtractor:
    def __init__(self):
        # Load the exact feature order used during training
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        order_path = os.path.join(base_dir, "models", "feature_order.json")

        with open(order_path, "r") as f:
            self.feature_order = json.load(f)

    def extract_features(self, url):
        """
        Extracts features from the given URL and returns them in the exact
        order required by the trained model.
        """
        if not url.startswith("http"):
            url = "http://" + url

        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc
        path = parsed.path

        # 1. having_IP_Address
        having_ip_address = (
            -1 if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain) else 1
        )

        # 2. URL_Length
        url_len = len(url)
        if url_len < 54:
            url_length = 1
        elif 54 <= url_len <= 75:
            url_length = 0
        else:
            url_length = -1

        # 3. Shortining_Service
        shortening_services = r"bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|db\.tt|qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|q\.gs|is\.gd|po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|x\.co|prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|tr\.im|link\.zip\.net"
        shortening_service = -1 if re.search(shortening_services, domain) else 1

        # 4. having_At_Symbol
        having_at_symbol = -1 if "@" in url else 1

        # 5. double_slash_redirecting
        double_slash_redirecting = -1 if "//" in path else 1

        # 6. Prefix_Suffix
        prefix_suffix = -1 if "-" in domain else 1

        # 7. having_Sub_Domain
        dot_count = domain.count(".")
        if dot_count == 1:
            having_sub_domain = 1
        elif dot_count == 2:
            having_sub_domain = 0
        else:
            having_sub_domain = -1

        # 8. SSLfinal_State
        sslfinal_state = 1 if parsed.scheme == "https" else -1

        # 9. port
        port = -1 if ":" in domain else 1

        # 10. HTTPS_token
        https_token = -1 if "https" in domain else 1

        # 11. Redirect (Fast network check)
        redirect = 1
        try:
            req = urllib.request.Request(url, method="HEAD")
            with urllib.request.urlopen(req, timeout=2) as response:
                if response.geturl() != url:
                    redirect = -1
        except Exception:
            # Neutral/suspicious if we can't connect
            redirect = 0

        # 12. DNSRecord
        dns_record = 1
        try:
            socket.gethostbyname(domain)
        except socket.error:
            dns_record = -1

        # Map values to a dictionary
        extracted_dict = {
            "having_IP_Address": having_ip_address,
            "URL_Length": url_length,
            "Shortining_Service": shortening_service,
            "having_At_Symbol": having_at_symbol,
            "double_slash_redirecting": double_slash_redirecting,
            "Prefix_Suffix": prefix_suffix,
            "having_Sub_Domain": having_sub_domain,
            "SSLfinal_State": sslfinal_state,
            "port": port,
            "HTTPS_token": https_token,
            "Redirect": redirect,
            "DNSRecord": dns_record,
        }

        # Return exactly in the order specified by feature_order.json
        vector = [extracted_dict[feature] for feature in self.feature_order]
        return vector, extracted_dict
