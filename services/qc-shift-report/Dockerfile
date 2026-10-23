# Preserve the verified running FAY report runtime and dependency versions.
FROM brianwang1912/mes-qc-shift-report:v20261022-receiving-history@sha256:3abc0f80c118653255c18be0330f10bc7ae60e165a9a5fedf987387d6e86b4cf
WORKDIR /app
COPY report_api.py report_core.py report_pdf.py report_history.py ./
ENV QC_REPORT_BIND=0.0.0.0 QC_REPORT_PORT=18794 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
USER 65532:65532
EXPOSE 18794
CMD ["python", "report_api.py"]
