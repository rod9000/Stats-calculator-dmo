FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements-web.txt .
RUN pip install --no-cache-dir -r requirements-web.txt

# web/server.py importa web/dmo_search.py (mesma pasta) e le os JSONs da raiz
COPY web/ web/
COPY digimon_list.json digimon_stats_cache.json seals.json ./
COPY manual_html/ manual_html/

# Railway injeta PORT; server.py le a variavel (padrao 5000)
CMD ["python", "web/server.py"]
