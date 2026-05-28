"""
Servidor HTTP para a Calculadora DMO Web.
Fornece busca ao vivo (dmowiki/Wayback) via API.

Uso: python server.py
Depois abrir http://localhost:5000
"""

import sys, os, json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add py/ to path so we can import calculadora_dmo
_this_dir = os.path.dirname(os.path.abspath(__file__))
_py_dir = os.path.join(os.path.dirname(_this_dir), "py")
if _py_dir not in sys.path:
    sys.path.insert(0, _py_dir)

os.chdir(_this_dir)  # serve files from web/


class Handler(SimpleHTTPRequestHandler):

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/search":
            qs = parse_qs(parsed.query)
            name = (qs.get("name") or [""])[0].strip()
            if not name:
                self._json({"error": "missing name"}, 400)
                return
            try:
                from calculadora_dmo import search_digimon
                data = search_digimon(name)
                if data:
                    src = data.get("_source", "cache")
                    result = {k: v for k, v in data.items() if not k.startswith("_")}
                    result["_source"] = src
                    self._json(result)
                else:
                    self._json({"error": "not found"}, 404)
            except Exception as e:
                self._json({"error": str(e)}, 500)
            return

        # Upgrade HTTP → HTTPS? No, just serve normally
        return super().do_GET()

    def _json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        # Quieter logging
        msg = fmt % args
        if "/api/" in msg or " 404 " in msg or " 500 " in msg:
            super().log_message(fmt, *args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    server = HTTPServer(("0.0.0.0", port), Handler)
    print(f"Servidor rodando em http://localhost:{port}")
    print("Pressione Ctrl+C para parar.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nParando...")
        server.server_close()
