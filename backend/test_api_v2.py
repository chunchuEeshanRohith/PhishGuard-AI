import requests
import json
import time


def run_tests():
    url = "http://127.0.0.1:5005/api/predict"

    test_cases = [
        "https://google.com",
        "https://github.com",
        "https://openai.com",
        "https://paypal-login-secure.example",
        "",  # Empty URL
        "just-some-random-text",  # Malformed
        "ftp://unsupported.com",  # Unsupported protocol
    ]

    print("--- AUTOMATED API TESTS ---")
    for test_url in test_cases:
        print(f"\n[POST] /api/predict -> URL: '{test_url}'")
        try:
            response = requests.post(url, json={"url": test_url})
            print(f"Status Code: {response.status_code}")
            print(json.dumps(response.json(), indent=4))
        except Exception as e:
            print(f"Failed to connect: {e}")
        time.sleep(0.5)


if __name__ == "__main__":
    run_tests()
