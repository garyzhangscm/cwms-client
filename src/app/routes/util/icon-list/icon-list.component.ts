import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';

@Component({
  selector: 'app-util-icon-list',
  templateUrl: './icon-list.component.html',
})
export class UtilIconListComponent implements OnInit {
  // outlineIconList valid:
  // 'down', 'up', 'left', 'right', 'caret-up',  'caret-down', 'double-right', 'double-left',  'arrow-down', 'logout',
  // 'menu-fold', 'menu-unfold', 'fullscreen', 'fullscreen-exit',  'question-circle', 'plus',  'info',  'info-circle',
  // 'exclamation-circle', 'close', 'close-circle', 'check', 'check-circle', 'clock-circle', 'edit', 'copy', 'delete',
  // 'pie-chart',  'github', 'dingding', 'weibo-circle', 'taobao-circle', 'alipay-circle', 'taobao', 'api',
  // 'bell', 'book', 'bulb',  'calendar',  'cloud', 'customer-service',  'dislike', 'eye',
  // 'frown',  'hdd', 'like',  'mail',  'lock', 'message', 'printer', 'profile', 'rocket', 'sound',
  //  'trophy', 'usb', 'bars', 'copyright', 'download', 'ellipsis',    'fork',
  // 'global', 'inbox', 'laptop', 'link', 'loading', 'paper-clip', 'scan',  'search', 'share-alt', 'shopping-cart',
  // 'team', 'upload', 'user',

  // already used:
  // "i18n": "menu.dashboard" / "icon": "anticon-dashboard",
  // "i18n": "menu.main.layout" / "icon": "anticon-appstore",
  // "i18n": "menu.main.inventory" / "icon": "anticon-star",
  // "i18n": "menu.main.inbound" / "icon": "anticon-exception",
  // "i18n": "menu.main.outbound" / "icon": "anticon-global",
  // "i18n": "menu.main.common" / "icon": "anticon-setting",
  // "i18n": "menu.main.util" /  "icon": "anticon-tool",

  outlineIconList = [
    //  'step-backward',
    //  'step-forward',
    //  'fast-backward',
    //  'fast-forward',
    //  'shrink',
    //    'arrows-alt',
    'down',
    'up',
    'left',
    'right',
    'caret-up',
    'caret-down',
    //    'caret-left',
    //    'caret-right',
    //    'up-circle',
    //    'down-circle',
    //    'left-circle',
    //    'right-circle',
    'double-right',
    'double-left',
    //    'vertical-left',
    //    'vertical-right',
    //    'vertical-align-top',
    //    'vertical-align-middle',
    //    'vertical-align-bottom',
    //    'forward',
    //    'backward',
    //    'rollback',
    //    'enter',
    //    'retweet',
    //    'swap',
    //    'swap-left',
    //    'swap-right',
    //    'arrow-up',
    'arrow-down',
    //    'arrow-left',
    //    'arrow-right',
    //    'play-circle',
    //    'up-square',
    //    'down-square',
    //    'left-square',
    //    'right-square',
    //    'login',
    'logout',
    'menu-fold',
    'menu-unfold',
    //    'border-bottom',
    //    'border-horizontal',
    //    'border-inner',
    //    'border-outer',
    //    'border-left',
    //    'border-right',
    //    'border-top',
    //    'border-verticle',
    //    'pic-center',
    //    'pic-left',
    //    'pic-right',
    //    'radius-bottomleft',
    //    'radius-bottomright',
    //    'radius-upleft',
    //    'radius-upright',
    'fullscreen',
    'fullscreen-exit',
    //    'question',
    'question-circle',
    'plus',
    //    'plus-circle',
    //    'pause',
    //    'pause-circle',
    //    'minus',
    //    'minus-circle',
    //    'plus-square',
    //    'minus-square',
    'info',
    'info-circle',
    //    'exclamation',
    'exclamation-circle',
    'close',
    'close-circle',
    //    'close-square',
    'check',
    'check-circle',
    // 'check-square',
    'clock-circle',
    //    'warning',
    //    'issues-close',
    //    'stop',
    'edit',
    //    'form',
    'copy',
    //    'scissor',
    'delete',
    //    'snippets',
    //    'diff',
    //    'highlight',
    //    'align-center',
    //    'align-left',
    //    'align-right',
    //    'bg-colors',
    //    'bold',
    //    'italic',
    //    'underline',
    //    'strikethrough',
    //    'redo',
    //    'undo',
    //    'zoom-in',
    //    'zoom-out',
    //    'font-colors',
    //    'font-size',
    //    'line-height',
    //    'colum-height',
    //    'dash',
    //    'small-dash',
    //    'sort-ascending',
    //    'sort-descending',
    //    'drag',
    //    'ordered-list',
    //    'unordered-list',
    //    'radius-setting',
    //    'column-width',
    //    'area-chart',
    'pie-chart',
    //    'bar-chart',
    //    'dot-chart',
    //    'line-chart',
    //    'radar-chart',
    //    'heat-map',
    //    'fall',
    //    'rise',
    //    'stock',
    //    'box-plot',
    //    'fund',
    //    'sliders',
    //    'android',
    //    'apple',
    //    'windows',
    //    'ie',
    //    'chrome',
    'github',
    //    'aliwangwang',
    'dingding',
    //    'weibo-square',
    'weibo-circle',
    'taobao-circle',
    //    'html5',
    //    'weibo',
    //    'twitter',
    //    'wechat',
    //    'youtube',
    'alipay-circle',
    'taobao',
    //    'skype',
    //    'qq',
    //    'medium-workmark',
    //    'gitlab',
    //    'medium',
    //    'linkedin',
    //    'google-plus',
    //    'dropbox',
    //    'facebook',
    //    'codepen',
    //    'code-sandbox',
    //    'amazon',
    //    'google',
    //    'codepen-circle',
    //    'alipay',
    //    'ant-design',
    //    'ant-cloud',
    //    'aliyun',
    //    'zhihu',
    //    'slack',
    //    'slack-square',
    //    'behance',
    //    'behance-square',
    //    'dribbble',
    //    'dribbble-square',
    //    'instagram',
    //    'yuque',
    //    'alibaba',
    //    'yahoo',
    //    'reddit',
    //    'sketch',
    //    'account-book',
    //    'alert',
    'api',
    'appstore',
    //    'audio',
    //    'bank',
    'bell',
    'book',
    //    'bug',
    //    'build',
    'bulb',
    //    'calculator',
    'calendar',
    //    'car',
    //    'camera',
    //    'carry-out',
    'cloud',
    //    'code',
    //    'compass',
    //    'container',
    //    'control',
    //    'credit-card',
    //    'contacts',
    'customer-service',
    'dashboard',
    'database',
    'dislike',
    //    'environment',
    //    'experiment',
    //    'eye-invisible',
    'eye',
    //    'file-add',
    //    'crown',
    //    'file-excel',
    //    'file-image',
    //    'file-pdf',
    //    'file-exclamation',
    //    'file-ppt',
    //    'file-text',
    //    'file-word',
    //    'file-zip',
    //    'file',
    //    'file-markdown',
    //    'fire',
    //    'filter',
    //    'flag',
    //    'folder-add',
    //    'folder-open',
    //    'folder',
    'frown',
    //    'funnel-plot',
    //    'gift',
    'hdd',
    //    'heart',
    //    'home',
    //    'hourglass',
    //    'idcard',
    //    'insurance',
    //    'interaction',
    //    'layout',
    'like',
    'mail',
    'lock',
    //    'medicine-box',
    //    'meh',
    'message',
    //    'mobile',
    //    'money-collect',
    //    'notification',
    //    'pay-circle',
    //    'phone',
    //    'picture',
    //    'play-square',
    'printer',
    'profile',
    //    'property-safety',
    //    'project',
    //    'pushpin',
    //    'reconciliation',
    //    'read',
    //    'red-envelope',
    //    'rest',
    'rocket',
    //    'safety-certificate',
    //    'save',
    //    'security-scan',
    //    'schedule',
    'setting',
    //    'shop',
    //    'shopping',
    //    'skin',
    //    'smile',
    'sound',
    'star',
    //    'switcher',
    //    'tag',
    //    'file-unknown',
    //    'tags',
    //    'tablet',
    //    'thunderbolt',
    'tool',
    'trophy',
    //    'unlock',
    'usb',
    //    'video-camera',
    //    'wallet',
    //    'apartment',
    //    'audit',
    //    'barcode',
    'bars',
    //    'block',
    //    'border',
    //    'branches',
    //    'ci',
    //    'cloud-download',
    //    'cloud-server',
    //    'cloud-sync',
    //    'cloud-upload',
    //    'cluster',
    //    'coffee',
    //    'column-height',
    'copyright',
    //    'deployment-unit',
    //    'disconnect',
    //    'dollar',
    //    'desktop',
    'download',
    'ellipsis',
    //    'euro',
    'exception',
    //    'export',
    //    'file-done',
    //    'file-jpg',
    //    'file-protect',
    //    'file-search',
    //    'file-sync',
    'fork',
    //    'gateway',
    'global',
    //    'gold',
    //    'history',
    //    'import',
    'inbox',
    //    'key',
    'laptop',
    //    'line',
    'link',
    //    'loading-3-quarters',
    'loading',
    //    'man',
    //    'menu',
    //    'monitor',
    //    'more',
    //    'number',
    'paper-clip',
    //    'percentage',
    //    'pound',
    //    'poweroff',
    //    'pull-request',
    //    'qrcode',
    //    'reload',
    //    'robot',
    //    'safety',
    'scan',
    'search',
    //    'select',
    //    'shake',
    'share-alt',
    'shopping-cart',
    //    'solution',
    //    'sync',
    //    'table',
    'team',
    //    'to-top',
    //    'trademark',
    //    'transaction',
    'upload',
    //    'user-add',
    //    'user-delete',
    'user',
    //    'usergroup-add',
    //    'usergroup-delete',
    //    'wifi',
    //    'woman',
  ];

  filledIconList = [
    //  'step-backward',
    //  'step-forward',
    //  'fast-backward',
    //  'fast-forward',
    'caret-up',
    'caret-down',
    //  'caret-left',
    // 'caret-right',
    //  'up-circle',
    //  'down-circle',
    //  'left-circle',
    //  'right-circle',
    //  'forward',
    //  'backward',
    //  'play-circle',
    //   'up-square',
    //   'down-square',
    //   'left-square',
    //   'right-square',
    //   'question-circle',
    //   'plus-circle',
    //   'pause-circle',
    //   'minus-circle',
    //   'plus-square',
    //   'minus-square',
    'info-circle',
    'exclamation-circle',
    'close-circle',
    //   'close-square',
    'check-circle',
    //   'check-square',
    //  'clock-circle',
    //  'warning',
    //  'stop',
    //  'edit',
    //  'copy',
    //  'delete',
    //  'snippets',
    //  'diff',
    //  'highlight',
    //  'pie-chart',
    //  'box-plot',
    // 'fund',
    // 'sliders',
    //  'android',
    //  'apple',
    //   'windows',
    //   'chrome',
    //   'github',
    //   'aliwangwang',
    //   'weibo-square',
    //   'weibo-circle',
    //   'taobao-circle',
    //   'html5',
    //   'wechat',
    //   'youtube',
    //   'alipay-circle',
    //   'skype',
    //   'gitlab',
    //   'linkedin',
    //  'facebook',
    //  'code-sandbox-circle',
    //  'codepen-circle',
    //  'slack-square',
    //  'behance-square',
    //  'dribbble-square',
    //  'instagram',
    //  'yuque',
    //  'yahoo',
    //  'account-book',
    //  'alert',
    //  'alipay-square',
    //  'amazon-circle',
    //  'amazon-square',
    //  'api',
    //  'appstore',
    //  'audio',
    //  'behance-circle',
    //  'bank',
    //  'bell',
    //  'book',
    //   'bug',
    //   'build',
    //    'bulb',
    //    'calculator',
    //    'calendar',
    //    'car',
    //    'camera',
    //   'carry-out',
    //   'ci-circle',
    //   'cloud',
    //   'code-sandbox-square',
    //   'code',
    //   'compass',
    //   'codepen-square',
    //   'container',
    //   'control',
    //   'credit-card',
    //   'contacts',
    //   'customer-service',
    //   'dashboard',
    //   'database',
    //   'dingtalk-circle',
    //   'dingtalk-square',
    //   'dislike',
    //   'dollar-circle',
    //   'dribbble-circle',
    //   'dropbox-circle',
    //   'dropbox-square',
    //   'environment',
    //   'euro-circle',
    //   'experiment',
    //   'eye-invisible',
    //   'eye',
    //   'copyright-circle',
    //   'file-add',
    //   'crown',
    //   'file-excel',
    //   'file-image',
    //   'file-pdf',
    //   'file-exclamation',
    //   'file-ppt',
    //   'file-text',
    //   'file-word',
    //   'file-zip',
    //  'file',
    //  'file-markdown',
    //   'fire',
    'filter',
    //   'flag',
    //   'folder-add',
    //   'folder-open',
    //   'folder',
    //   'frown',
    //   'funnel-plot',
    //   'gift',
    //   'golden',
    //   'google-circle',
    //   'google-plus-circle',
    //   'hdd',
    //  'google-square',
    //  'google-plus-square',
    //  'heart',
    //  'home',
    //  'hourglass',
    //   'ie-circle',
    //   'idcard',
    //   'ie-square',
    //   'insurance',
    //   'interaction',
    //   'layout',
    //   'like',
    //   'mail',
    //   'lock',
    //   'medicine-box',
    //   'medium-circle',
    //   'medium-square',
    //   'meh',
    //   'message',
    //   'mobile',
    //   'money-collect',
    //   'notification',
    //  'pay-circle',
    //  'phone',
    //  'picture',
    //  'play-square',
    //  'pound-circle',
    //  'printer',
    //  'profile',
    //  'property-safety',
    //  'project',
    //  'qq-circle',
    //  'pushpin',
    //  'qq-square',
    //  'reconciliation',
    //  'read',
    //  'red-envelope',
    //  'reddit-circle',
    //  'reddit-square',
    //  'rest',
    //  'rocket',
    //  'safety-certificate',
    //  'save',
    //  'security-scan',
    //  'schedule',
    //  'setting',
    //  'shop',
    //  'shopping',
    //  'sketch-circle',
    //  'sketch-square',
    //  'skin',
    //  'slack-circle',
    //  'smile',
    //  'sound',
    'star',
    //  'switcher',
    //  'tag',
    //  'file-unknown',
    //  'tags',
    //  'tablet',
    //  'taobao-square',
    //  'thunderbolt',
    // 'tool',
    // 'trademark-circle',
    //   'trophy',
    //   'twitter-circle',
    //   'twitter-square',
    //   'unlock',
    //   'usb',
    //   'video-camera',
    //   'wallet',
    //   'zhihu-circle',
    //   'zhihu-square',
  ];

  towToneIconList = [
    //  'up-circle',
    //  'down-circle',
    //  'left-circle',
    //  'right-circle',
    //  'play-circle',
    //  'up-square',
    //  'down-square',
    //  'left-square',
    //  'right-square',
    //  'question-circle',
    //  'plus-circle',
    //  'pause-circle',
    //  'minus-circle',
    //  'plus-square',
    //  'minus-square',
    //  'info-circle',
    //  'exclamation-circle',
    'close-circle',
    //  'close-square',
    'check-circle',
    //  'check-square',
    //  'clock-circle',
    //  'warning',
    //  'stop',
    //  'edit',
    //  'copy',
    //  'delete',
    //  'snippets',
    //  'diff',
    //  'highlight',
    //  'pie-chart',
    //  'box-plot',
    //  'fund',
    //  'sliders',
    //  'html5',
    //  'account-book',
    //  'alert',
    //  'api',
    //  'appstore',
    //  'audio',
    //  'bank',
    //  'bell',
    //  'book',
    //  'bug',
    //  'build',
    //  'bulb',
    //  'calculator',
    //  'calendar',
    //  'car',
    //  'camera',
    //  'carry-out',
    //  'cloud',
    //  'code',
    //  'compass',
    //  'container',
    //  'control',
    //  'credit-card',
    //  'contacts',
    //  'customer-service',
    //  'dashboard',
    //  'database',
    //  'dislike',
    //  'environment',
    //  'experiment',
    //  'eye-invisible',
    //  'eye',
    //  'file-add',
    //  'crown',
    //  'file-excel',
    //  'file-image',
    //  'file-pdf',
    //  'file-exclamation',
    //  'file-ppt',
    //  'file-text',
    //  'file-word',
    //  'file-zip',
    //  'file',
    //  'file-markdown',
    //  'fire',
    //  'filter',
    //  'flag',
    //  'folder-add',
    //  'folder-open',
    //  'folder',
    //  'frown',
    //  'funnel-plot',
    //  'gift',
    //  'hdd',
    //  'heart',
    //  'home',
    //  'hourglass',
    //  'idcard',
    //  'insurance',
    //  'interaction',
    //  'layout',
    //  'like',
    //  'mail',
    //  'lock',
    //  'medicine-box',
    //  'meh',
    //  'message',
    //  'mobile',
    //  'money-collect',
    //  'notification',
    //  'phone',
    //  'picture',
    //  'play-square',
    //  'pound-circle',
    //  'printer',
    //  'profile',
    //  'property-safety',
    //  'project',
    //  'pushpin',
    //  'reconciliation',
    //  'red-envelope',
    //  'rest',
    //  'rocket',
    //  'safety-certificate',
    //  'save',
    //  'security-scan',
    //  'schedule',
    //  'setting',
    //  'shop',
    //  'shopping',
    //  'skin',
    //  'smile',
    //  'sound',
    //  'star',
    //  'switcher',
    //  'tag',
    //  'file-unknown',
    //  'tags',
    //  'tablet',
    //  'thunderbolt',
    //  'tool',
    //  'trademark-circle',
    //  'trophy',
    //  'unlock',
    //  'usb',
    //  'video-camera',
    //  'wallet',
    //  'ci',
    // 'copyright',
    // 'dollar',
    // 'euro',
    // 'gold',
  ];
  displayOnly = false;
  constructor(
    private userService: UserService,) {
    this.displayOnly = userService.isCurrentPageDisplayOnly("/util/icon-list");
  }

  ngOnInit() {}
}
