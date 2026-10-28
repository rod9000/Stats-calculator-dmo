"""
Servidor HTTP para a Calculadora DMO Web.
Fornece busca ao vivo (dmowiki/Wayback) via API.

Uso: python server.py [porta]
Depois abrir http://localhost:5000

No Railway a porta vem da variavel de ambiente PORT.
"""

import sys, os, json
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

_this_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(_this_dir)  # serve files from web/


class Handler(SimpleHTTPRequestHandler):

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._json({"status": "ok"})
            return
        if parsed.path == "/api/search":
            qs = parse_qs(parsed.query)
            name = (qs.get("name") or [""])[0].strip()
            # "_ping_" e usado pelo app.js (checkServer) e deve responder 400 rapido
            if not name or name == "_ping_":
                self._json({"error": "missing name"}, 400)
                return
            try:
                from dmo_search import search_digimon
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
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", 5000))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Servidor rodando em http://localhost:{port}")
    print("Pressione Ctrl+C para parar.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nParando...")
        server.server_close()
