# Preserve the verified running FAY report runtime and dependency versions.
FROM brianwang1912/mes-qc-shift-report:v20261020-receiving-history@sha256:3e1af97648bc408fc256838dcb023aa7bd024cd951c584eb6ac56fcb89633f74
WORKDIR /app
COPY report_api.py report_core.py report_pdf.py report_history.py ./
ENV QC_REPORT_BIND=0.0.0.0 QC_REPORT_PORT=18794 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
USER 65532:65532
EXPOSE 18794
CMD ["python", "report_api.py"]
