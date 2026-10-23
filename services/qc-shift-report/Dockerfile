# Preserve the verified running FAY report runtime and dependency versions.
FROM brianwang1912/mes-qc-shift-report:v20261023-custom-period@sha256:6fb9ec6743b464618cf40903ae77beca781a39d9e7f21cd1b61ae4c0b69d7331
WORKDIR /app
COPY report_api.py report_core.py report_pdf.py report_history.py ./
ENV QC_REPORT_BIND=0.0.0.0 QC_REPORT_PORT=18794 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
USER 65532:65532
EXPOSE 18794
CMD ["python", "report_api.py"]
