export const QC_CONFIG_LABELS: Record<string, Record<string, string>> = {
  'en-US': {
    "qc-rule.removed": "QC rule \"{{name}}\" was removed. Other rules remain unchanged.",
    "qc-rule.in-use": "QC rule \"{{name}}\" is referenced by inspections or configurations and cannot be removed. Resolve its references first.",
    "qc-rule.remove-unknown": "Removal of QC rule \"{{name}}\" could not be confirmed. Run Search to check its status before retrying.",
    'qc-config.id': 'Config #',
    'qc-config.removed': 'Configuration #{{id}} was removed. Other configurations remain unchanged.',
    'qc-config.remove-unknown': 'Removal of configuration #{{id}} could not be confirmed. Run Search to check its current status before trying again.',
    'qc-config.detail-warning': 'Some reference details could not be loaded. The configuration list remains available. Run Search to retry.'
  },
  'es-ES': {
    "qc-rule.removed": "Se eliminó la regla de QC \"{{name}}\". Las demás reglas no cambiaron.",
    "qc-rule.in-use": "La regla de QC \"{{name}}\" está vinculada a inspecciones o configuraciones y no se puede eliminar. Revise primero sus referencias.",
    "qc-rule.remove-unknown": "No se pudo confirmar la eliminación de la regla de QC \"{{name}}\". Pulse Buscar para comprobar su estado antes de reintentar.",
    'qc-config.id': 'Config. #',
    'qc-config.removed': 'Se eliminó la configuración #{{id}}. Las demás configuraciones no cambiaron.',
    'qc-config.remove-unknown': 'No se pudo confirmar la eliminación de la configuración #{{id}}. Pulse Buscar para comprobar su estado antes de intentarlo de nuevo.',
    'qc-config.detail-warning': 'No se pudieron cargar algunos datos de referencia. La lista sigue disponible. Pulse Buscar para reintentar.'
  },
  'zh-CN': {
    "qc-rule.removed": "QC 规则“{{name}}”已删除，其他规则未改动。",
    "qc-rule.in-use": "QC 规则“{{name}}”仍被检查单或配置引用，无法删除。请先处理关联记录。",
    "qc-rule.remove-unknown": "未能确认 QC 规则“{{name}}”的删除结果，请先查询核对当前状态，再决定是否重试。",
    'qc-config.id': '配置编号',
    'qc-config.removed': '配置 #{{id}} 已删除，其他配置未改动。',
    'qc-config.remove-unknown': '未能确认配置 #{{id}} 的删除结果，请先点击查询核对当前状态，再决定是否重试。',
    'qc-config.detail-warning': '部分关联资料未能加载，配置列表仍可使用。请点击查询重试。'
  },
  'zh-TW': {
    "qc-rule.removed": "QC 規則「{{name}}」已刪除，其他規則未改動。",
    "qc-rule.in-use": "QC 規則「{{name}}」仍被檢查單或設定引用，無法刪除。請先處理關聯記錄。",
    "qc-rule.remove-unknown": "未能確認 QC 規則「{{name}}」的刪除結果，請先查詢核對目前狀態，再決定是否重試。",
    'qc-config.id': '設定編號',
    'qc-config.removed': '設定 #{{id}} 已刪除，其他設定未改動。',
    'qc-config.remove-unknown': '未能確認設定 #{{id}} 的刪除結果，請先點擊查詢核對目前狀態，再決定是否重試。',
    'qc-config.detail-warning': '部分關聯資料未能載入，設定列表仍可使用。請點擊查詢重試。'
  }
};
