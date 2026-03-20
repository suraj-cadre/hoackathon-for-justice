FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for mysqlclient/pymysql and PDF parsing
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc default-libmysqlclient-dev curl zstd && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# Start Ollama in the background, pull models, then start the app
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
