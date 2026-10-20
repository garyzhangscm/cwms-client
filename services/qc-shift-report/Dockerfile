FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY report_api.py report_core.py report_pdf.py ./
COPY fonts/ ./fonts/
ENV QC_REPORT_BIND=0.0.0.0 QC_REPORT_PORT=18794 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
USER 65532:65532
EXPOSE 18794
CMD ["python", "report_api.py"]
