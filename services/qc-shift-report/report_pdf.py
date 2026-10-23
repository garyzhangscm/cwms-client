"""Printable report from the same immutable snapshot used by the page/Excel."""
from io import BytesIO
from pathlib import Path
import re
import threading
from xml.sax.saxutils import escape
from zoneinfo import ZoneInfo

from report_core import as_utc

FONT_LOCK = threading.Lock()


def pdf_bytes(report):
    import reportlab
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_RIGHT
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether

    with FONT_LOCK:
        if 'QCBody' not in pdfmetrics.getRegisteredFontNames():
            fonts = Path(reportlab.__file__).parent / 'fonts'
            pdfmetrics.registerFont(TTFont('QCBody', str(fonts / 'Vera.ttf')))
            pdfmetrics.registerFont(TTFont('QCBold', str(fonts / 'VeraBd.ttf')))
            pdfmetrics.registerFont(TTFont('QCCJK', str(Path(__file__).parent / 'fonts/NotoSansSC.ttf')))

    navy, muted, border = colors.HexColor('#17324D'), colors.HexColor('#546779'), colors.HexColor('#DCE4EC')
    body = ParagraphStyle('Body', fontName='QCBody', fontSize=9, leading=13, textColor=navy)
    small = ParagraphStyle('Small', parent=body, fontSize=8, leading=12, textColor=muted)
    bold = ParagraphStyle('Bold', parent=body, fontName='QCBold')
    number = ParagraphStyle('Number', parent=body, alignment=TA_RIGHT)
    head = ParagraphStyle('Head', parent=bold, textColor=colors.white, fontSize=8, leading=11)
    label = ParagraphStyle('Label', parent=small, fontSize=7.5)
    value = ParagraphStyle('Value', parent=bold, fontSize=19, leading=26)

    def safe(value):
        # Literal text only, including product labels containing HTML-like characters.
        escaped = escape(str(value))
        return re.sub(r'([\u2e80-\u9fff\uf900-\ufaff]+)', r'<font name="QCCJK">\1</font>', escaped)

    def p(value, style=body):
        return Paragraph(safe(value), style)

    zone = ZoneInfo(report['timezone'])
    start, end, generated = [as_utc(report[key]).astimezone(zone) for key in ('startTime', 'endTime', 'generatedAt')]
    schedule = report['schedule']
    shift = (f"{schedule['start']} - {schedule['end']}" + (' (next day)' if schedule['nextDay'] else '')
             if schedule else 'Custom date/time range')
    totals = report['totals']
    rate = f"{totals['inspectionRate']:.2%}" if totals['inspectionRate'] is not None else 'N/A'
    output = BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4, rightMargin=36, leftMargin=36,
                            topMargin=34, bottomMargin=40, title='QC Shift Summary',
                            author='MES Quality Control', pageCompression=1)
    width = A4[0] - 72
    story = [p('QUALITY CONTROL / SHIFT REPORT', label), Spacer(1, 7),
             p('QC Shift Summary', ParagraphStyle('Title', parent=bold, fontSize=22, leading=28)), Spacer(1, 10),
             p(f"Shift start date: {report['date']}    |    {shift}", bold),
             p(f"Warehouse: {report.get('warehouseName') or report['warehouseId']}    |    Time zone: {report['timezone']}", small),
             p(f"Period: {start:%Y-%m-%d %H:%M:%S} to {end:%Y-%m-%d %H:%M:%S} (end excluded)", small),
             p('Item families: ' + (', '.join(report.get('itemFamilyNames', [])) or 'All'), small),
             p(f"Generated: {generated:%Y-%m-%d %H:%M:%S %Z}    |    {totals['machines']:,} machines", small), Spacer(1, 15)]

    cards = Table([[[p('PALLETS PRODUCED', label), p(f"{totals['producedPallets']:,}", value)],
                    [p('PRODUCED PALLETS INSPECTED', label), p(f"{totals['inspectedProducedPallets']:,}", value)],
                    [p('INSPECTION COVERAGE', label), p(rate, value)]]], colWidths=[width / 3] * 3)
    cards.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EEF3F7')),
                              ('BOX', (0, 0), (-1, -1), .5, border), ('INNERGRID', (0, 0), (-1, -1), .5, border),
                              ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 11),
                              ('TOPPADDING', (0, 0), (-1, -1), 9), ('BOTTOMPADDING', (0, 0), (-1, -1), 8)]))
    story += [cards, Spacer(1, 17), p('Inspection counts by product and machine', bold), Spacer(1, 7)]
    data = [[p(x, head) for x in ['Product', 'Machine', '1st sample', 'Inline', 'Finished goods']]]
    for row in report['rows']:
        data.append([p(row['product']), p(row['machine'])] +
                    [p(f"{row[key]:,}", number) for key in ('firstSample', 'inline', 'finishedGoods')])
    if not report['rows']:
        data.append([p('No production or completed inspections in this shift.', small), '', '', '', ''])
    data.append([p('Total', bold), p(f"{totals['machines']:,} machines", small)] +
                [p(f"{totals[key]:,}", number) for key in ('firstSample', 'inline', 'finishedGoods')])
    table = Table(data, colWidths=[width - 259, 82, 59, 53, 65], repeatRows=1, hAlign='LEFT',
                  rowSplitRange=(1, len(data) - 2))
    styles = [('BACKGROUND', (0, 0), (-1, 0), navy), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
              ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
              ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 9),
              ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#F6F8FA')]),
              ('LINEBELOW', (0, 0), (-1, 0), .5, navy), ('LINEBELOW', (0, 1), (-1, -2), .3, border),
              ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#E8EFF5')),
              ('LINEABOVE', (0, -1), (-1, -1), .8, navy)]
    if not report['rows']:
        styles.append(('SPAN', (0, 1), (-1, 1)))
    table.setStyle(TableStyle(styles))
    story += [table, Spacer(1, 14)]
    note_style = ParagraphStyle('Notes', parent=small, fontSize=7.5, leading=11)
    notes = [p('Counting rules', bold), Spacer(1, 4),
             p('1st sample: new registrations; edits do not add a count. Inline: completed PASS/FAIL sampling.', note_style),
             p('Finished goods: distinct production LPNs; rechecks count once. Production excludes fully reversed pallets.', note_style),
             p('Coverage = pallets produced AND inspected in this shift / pallets produced this shift. '
               'Prior-shift pallets excluded; N/A = no production.', note_style)]
    story.append(KeepTogether(notes))
    for warning in report['warnings']:
        story += [Spacer(1, 6), p('Note: ' + warning, small)]

    def page(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(border)
        canvas.line(36, 29, A4[0] - 36, 29)
        canvas.setFont('QCBody', 7)
        canvas.setFillColor(muted)
        canvas.drawString(36, 18, f"QC Shift Summary | {report['date']} | Warehouse {report['warehouseId']}")
        canvas.drawRightString(A4[0] - 36, 18, f'Page {document.page}')
        canvas.restoreState()

    doc.build(story, onFirstPage=page, onLaterPages=page)
    return output.getvalue()
