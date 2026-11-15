#!/usr/bin/env python3
"""Start World of Savior locally. Uses Python's standard library only."""
import argparse
import functools
import http.server
import pathlib
import threading
import webbrowser

def main():
    parser = argparse.ArgumentParser(description="World of Savior · SysOne Studio")
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    root = pathlib.Path(__file__).resolve().parent / "dist"
    if not (root / "index.html").is_file():
        raise SystemExit("dist papkasi topilmadi. ZIP faylni to‘liq oching.")
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))
    with http.server.ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        print(f"\nWORLD OF SAVIOR · SysOne Studio\nO‘yinni ochish: {url}\nYopish uchun: Ctrl+C\n", flush=True)
        if not args.no_browser:
            threading.Timer(.4, lambda: webbrowser.open(url)).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nO‘yin serveri yopildi.")

if __name__ == "__main__":
    main()
