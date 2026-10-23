export const QC_SHIFT_LABELS: Record<string, Record<string, string>> = {
  'en-US': {
    title: 'QC Shift Summary', description: 'Inspection counts by product and machine for one production shift.',
    date: 'Shift start date', shift: 'Shift', 'next-day': 'next day', 'reload-shifts': 'Reload shifts', 'config-failed': 'Unable to load production shifts. Check Work Order Configuration and reload shifts.',
    run: 'Run report', export: 'Export Excel', 'export-pdf': 'Export PDF', 'counting-rules': 'Counting rules', 'shift-note': 'Shifts follow Work Order Configuration. Overnight shifts belong to their start date. Shift end is excluded.',
    product: 'Product', machine: 'Machine', first: '1st Sample', inline: 'Inline', finished: 'Finished Goods',
    total: 'Total', machines: 'machines', pallets: 'Pallets produced', covered: 'Produced pallets inspected', rate: '% Inspected',
    generated: 'Generated', empty: 'No production or completed inspections in this shift.', start: 'Choose a date and shift, then run the report.',
    'invalid-date': 'Select a valid shift start date.',
    failed: 'The report could not be completed. No partial totals are shown. Check the report service and try again.',
    'export-failed': 'The export could not be completed. Run the report again if the saved result has expired.',
    'count-note': '1st Sample counts sample registrations created in the shift; edits do not add a count. Inline counts completed PASS/FAIL sampling records. Finished Goods counts distinct inspected production LPNs; rechecks count once. Fully reversed pallets are excluded from production.',
    'coverage-note': 'Coverage = distinct pallets produced in this shift and inspected during this shift ÷ pallets produced in this shift. Checks of prior-shift pallets appear in Finished Goods but do not increase this rate. No pallets gives —.'
  },
  'zh-CN': {
    title: '班次检查汇总', description: '按产品和机台汇总一个生产班次的检查记录。',
    date: '班次开始日期', shift: '班次', 'next-day': '次日', 'reload-shifts': '刷新班次配置', 'config-failed': '无法读取有效的生产班次，请检查工单配置后刷新班次配置。',
    run: '查询报表', export: '导出 Excel', 'export-pdf': '导出 PDF', 'counting-rules': '统计口径说明', 'shift-note': '班次读取工单配置；跨天班次归属开始日期，不包含结束时刻。',
    product: '产品', machine: '机台', first: '首样', inline: '巡检', finished: '成品检查',
    total: '合计', machines: '台机', pallets: '生产托盘数', covered: '本班生产且已检查托盘数', rate: '检查比例',
    generated: '生成时间', empty: '本班次没有生产或已完成的检查记录。', start: '选择日期和班次后查询报表。',
    'invalid-date': '请选择有效的班次开始日期。',
    failed: '报表未能完整生成，未显示部分统计。请检查报表服务后重试。',
    'export-failed': '导出失败；若结果已过期，请重新查询。',
    'count-note': '首样统计本班新建的样品记录，修改原样品不重复计数；巡检统计已完成的 PASS/FAIL 抽检记录。成品检查按生产 LPN 去重，同一托盘重检只计一次；生产托盘数排除已全部冲销的托盘。',
    'coverage-note': '检查比例＝本班生产且在本班完成检查的不同托盘数÷本班生产托盘数。检查上一班的托盘计入成品检查，但不增加本班覆盖率。无生产托盘时显示 —。'
  },
  'es-ES': {
    title: 'Resumen de inspecciones por turno', description: 'Inspecciones por producto y máquina durante un turno de producción.',
    date: 'Fecha de inicio del turno', shift: 'Turno', 'next-day': 'día siguiente', 'reload-shifts': 'Actualizar turnos', 'config-failed': 'No se pudieron cargar los turnos. Revise la configuración de órdenes y actualice los turnos.',
    run: 'Consultar', export: 'Exportar Excel', 'export-pdf': 'Exportar PDF', 'counting-rules': 'Criterios de conteo', 'shift-note': 'Los turnos siguen la configuración de órdenes y corresponden a su fecha de inicio. Se excluye la hora final.',
    product: 'Producto', machine: 'Máquina', first: 'Primera muestra', inline: 'En línea', finished: 'Producto terminado',
    total: 'Total', machines: 'máquinas', pallets: 'Tarimas producidas', covered: 'Tarimas producidas e inspeccionadas', rate: '% inspeccionado',
    generated: 'Generado', empty: 'No hay producción ni inspecciones completadas en este turno.', start: 'Seleccione fecha y turno y consulte el informe.',
    'invalid-date': 'Seleccione una fecha válida.', failed: 'No se pudo completar el informe. No se muestran totales parciales. Revise el servicio de informes e intente de nuevo.',
    'export-failed': 'No se pudo exportar. Consulte de nuevo si el resultado guardado ha caducado.',
    'count-note': 'Primera muestra cuenta muestras registradas en el turno; las modificaciones no aumentan el conteo. En línea cuenta inspecciones PASS/FAIL. Producto terminado cuenta LPN distintos; una reinspección no aumenta el conteo. Se excluyen tarimas totalmente revertidas de la producción.',
    'coverage-note': 'Cobertura = tarimas producidas e inspeccionadas durante este turno ÷ tarimas producidas en este turno. Las tarimas de turnos anteriores no aumentan la cobertura. Sin producción se muestra —.'
  }
};
Object.assign(QC_SHIFT_LABELS["en-US"], {"not-recorded": "Not recorded", "view-details": "View inspection records", "inspector-help": "Names show who registered each sample or performed each inline inspection. Click a count to see records, then click a record number for questions, recorded answers and notes.", "record": "Record / Work order", "time": "Time", "registered-by": "Registered by", "inspector": "QC Inspector", "result": "Result", "registered": "Registered", "close-details": "Close", "registrant-note": "These are sample registrations, not completed QC inspections. A sample link shows its associated inspections across all dates."});
Object.assign(QC_SHIFT_LABELS["zh-CN"], {"not-recorded": "未记录", "view-details": "查看检查记录", "inspector-help": "姓名分别表示首样登记人和巡检检查员。点击数量查看每条记录，再点击单号查看问题、实际答案和异常备注。", "record": "单号／工单", "time": "时间", "registered-by": "首样登记人", "inspector": "QC 检查员", "result": "结果", "registered": "已登记", "close-details": "收起", "registrant-note": "这里统计首样登记，不代表已完成 QC。点击首样单号可查看该样品所有日期的关联检查。"});
Object.assign(QC_SHIFT_LABELS["es-ES"], {"not-recorded": "No registrado", "view-details": "Ver registros de inspección", "inspector-help": "Los nombres identifican quién registró la muestra o realizó la inspección en línea. Pulse un conteo y luego el número de registro para ver preguntas, respuestas y notas.", "record": "Registro / Orden", "time": "Fecha y hora", "registered-by": "Registrado por", "inspector": "Inspector de QC", "result": "Resultado", "registered": "Registrado", "close-details": "Cerrar", "registrant-note": "Estos son registros de muestras, no inspecciones completadas. El enlace muestra las inspecciones de la muestra de todas las fechas."});
Object.assign(QC_SHIFT_LABELS["en-US"], {"period-mode": "Report period", "configured-shift": "Configured shift", "custom-range": "Custom date and time", "range-start": "Start date and time", "range-end": "End date and time", "warehouse-time": "Warehouse local time", "range-note": "Enter warehouse local dates and times, up to 31 days. Start is included; end is excluded.", "invalid-range": "Enter valid start and end dates and times, with end after start (up to 31 days).", "start": "Choose a shift or enter a date and time range, then run the report.", "description": "Inspection counts by product and machine for a shift or a custom period."});
Object.assign(QC_SHIFT_LABELS["zh-CN"], {"period-mode": "查询方式", "configured-shift": "按配置班次", "custom-range": "自定义日期和时间", "range-start": "开始日期和时间", "range-end": "结束日期和时间", "warehouse-time": "仓库当地时间", "range-note": "请输入仓库当地日期和时间，最多 31 天。包含开始时刻，不包含结束时刻。", "invalid-range": "请输入有效的开始和结束日期时间，结束须晚于开始，范围最多 31 天。", "start": "选择班次或填写日期时间范围后查询报表。", "description": "按产品和机台汇总班次或自定义时段的检查记录。"});
Object.assign(QC_SHIFT_LABELS["es-ES"], {"period-mode": "Período del informe", "configured-shift": "Turno configurado", "custom-range": "Fecha y hora personalizadas", "range-start": "Fecha y hora inicial", "range-end": "Fecha y hora final", "warehouse-time": "Hora local del almacén", "range-note": "Introduzca fechas y horas locales del almacén, hasta 31 días. Se incluye el inicio y se excluye el final.", "invalid-range": "Introduzca fechas y horas válidas; el final debe ser posterior al inicio (máximo 31 días).", "start": "Seleccione un turno o un período de fecha y hora y consulte el informe.", "description": "Inspecciones por producto y máquina durante un turno o un período personalizado."});
Object.assign(QC_SHIFT_LABELS["en-US"], {"item-family": "Item family", "all-families": "All item families", "families-failed": "Unable to load item families. Reload the list before filtering.", "retry-families": "Reload families"});
Object.assign(QC_SHIFT_LABELS["zh-CN"], {"item-family": "物料分类", "all-families": "全部物料分类", "families-failed": "无法加载物料分类，请重新加载后筛选。", "retry-families": "刷新分类"});
Object.assign(QC_SHIFT_LABELS["es-ES"], {"item-family": "Familia de artículos", "all-families": "Todas las familias", "families-failed": "No se pudieron cargar las familias. Actualice la lista.", "retry-families": "Actualizar familias"});
QC_SHIFT_LABELS['zh-TW'] = { ...QC_SHIFT_LABELS['zh-CN'], title: '班次檢查彙總', date: '班次開始日期',
  shift: '班次', run: '查詢報表', export: '匯出 Excel', product: '產品', machine: '機台', first: '首樣', inline: '巡檢', finished: '成品檢查' };
for (const language of Object.keys(QC_SHIFT_LABELS)) {
  QC_SHIFT_LABELS[language]['reports-menu'] = 'QC report';
  QC_SHIFT_LABELS[language] = Object.fromEntries(Object.entries(QC_SHIFT_LABELS[language]).map(([key, value]) => [`qc-shift.${key}`, value]));
}
