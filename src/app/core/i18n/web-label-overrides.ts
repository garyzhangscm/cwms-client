/** New Web labels must remain available while the resource server dictionary is older. */
export const WEB_LABEL_OVERRIDES: Record<string, Record<string, string>> = {
  'en-US': {
    'user.login-account': 'Login account',
    'user.reset-password-hint': '8–128 characters',
    'user.require-password-change': 'Require password change at next sign-in',

    'user.reset-password': 'Reset Password',
    'user.new-password': 'New password',
    'user.confirm-new-password': 'Confirm new password',
    'user.reset-password-invalid': 'Use 8–128 characters. The password cannot be blank or start with {.',
    'user.reset-password-mismatch': 'The passwords do not match.',
    'user.reset-password-success': 'Password reset successfully.',

    'work-order.production-records': 'Production Records',
    'produce-transaction': 'Production Records',
    'menu.main.work-order.wo-produce-transaction': 'Production Records',

    'work-order.search-prompt': 'Enter a work order number, Item or status to search.',
    'work-order.search-condition-required': 'Please enter at least one search condition, such as a work order number or Item.',
    'work-order.delete': 'Delete work order',
    'work-order.delete-title': 'Delete work order',
    'work-order.delete-confirm': 'Permanently delete work order {{number}}? This cannot be undone.',
    'work-order.delete-rule': 'Only PENDING work orders without production, assignments or related business records can be deleted.',
    'work-order.delete-success': 'Work order deleted.',
    'work-order.delete-failed': 'The work order could not be deleted. Please refresh and try again.'
  },
  'zh-CN': {
    'user.login-account': '登录账号',
    'user.reset-password-hint': '8–128 个字符',
    'user.require-password-change': '下次登录时必须修改密码',

    'user.reset-password': '重置密码',
    'user.new-password': '新密码',
    'user.confirm-new-password': '确认新密码',
    'user.reset-password-invalid': '密码须为 8–128 个字符，不能为空或以 { 开头。',
    'user.reset-password-mismatch': '两次输入的密码不一致。',
    'user.reset-password-success': '密码已重置。',

    'work-order.production-records': '生产记录',
    'produce-transaction': '生产记录',
    'menu.main.work-order.wo-produce-transaction': '生产记录',

    'work-order.search-prompt': '请输入工单号、Item 或选择状态后查询。',
    'work-order.search-condition-required': '请至少输入一个查询条件，例如工单号或 Item。',
    'work-order.delete': '删除工单',
    'work-order.delete-title': '删除工单',
    'work-order.delete-confirm': '确定永久删除工单 {{number}}？此操作无法撤销。',
    'work-order.delete-rule': '仅允许删除未生产、未分配且没有业务关联的 PENDING 工单。',
    'work-order.delete-success': '工单已删除。',
    'work-order.delete-failed': '工单删除失败，请刷新后重试。'
  },
  'zh-TW': {
    'user.login-account': '登入帳號',
    'user.reset-password-hint': '8–128 個字元',
    'user.require-password-change': '下次登入時必須修改密碼',

    'user.reset-password': '重設密碼',
    'user.new-password': '新密碼',
    'user.confirm-new-password': '確認新密碼',
    'user.reset-password-invalid': '密碼須為 8–128 個字元，不能為空或以 { 開頭。',
    'user.reset-password-mismatch': '兩次輸入的密碼不一致。',
    'user.reset-password-success': '密碼已重設。',

    'work-order.production-records': '生產記錄',
    'produce-transaction': '生產記錄',
    'menu.main.work-order.wo-produce-transaction': '生產記錄',

    'work-order.search-prompt': '請輸入工單號、Item 或選擇狀態後查詢。',
    'work-order.search-condition-required': '請至少輸入一個查詢條件，例如工單號或 Item。',
    'work-order.delete': '刪除工單',
    'work-order.delete-title': '刪除工單',
    'work-order.delete-confirm': '確定永久刪除工單 {{number}}？此操作無法撤銷。',
    'work-order.delete-rule': '僅允許刪除未生產、未分配且沒有業務關聯的 PENDING 工單。',
    'work-order.delete-success': '工單已刪除。',
    'work-order.delete-failed': '工單刪除失敗，請重新整理後重試。'
  }
};
