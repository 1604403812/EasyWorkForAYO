import { Community } from '@/types';

export const DEFAULT_COMMUNITIES: Community[] = [
  { id: '1', name: '第一社区', order: 1 },
  { id: '2', name: '第二社区', order: 2 },
  { id: '3', name: '第三社区', order: 3 },
  { id: '4', name: '第四社区', order: 4 },
  { id: '5', name: '第五社区', order: 5 },
  { id: '6', name: '第六社区', order: 6 },
  { id: '7', name: '第七社区', order: 7 },
  { id: '8', name: '第八社区', order: 8 },
  { id: '9', name: '第九社区', order: 9 },
  { id: '10', name: '第十社区', order: 10 },
  { id: '11', name: '第十一社区', order: 11 },
  { id: '12', name: '第十二社区', order: 12 },
];

export const ACTIVITY_TYPES = [
  '文化活动',
  '体育活动',
  '志愿服务',
  '教育培训',
  '健康义诊',
  '环境整治',
  '安全宣传',
  '节日庆祝',
  '其他',
];

export const STORAGE_KEYS = {
  COMMUNITIES: 'street_work_communities',
  FORECASTS: 'street_work_forecasts',
  REVIEWS: 'street_work_reviews',
  EDUCATION: 'street_work_education',
  OPERATIONS: 'street_work_operations',
  SETTINGS: 'street_work_settings',
};

export const MENU_ITEMS = [
  { path: '/', label: '首页', icon: 'Home' },
  { path: '/activity/forecast', label: '活动预告报送', icon: 'CalendarPlus' },
  { path: '/activity/review', label: '活动回顾报送', icon: 'ClipboardList' },
  { path: '/activity/ledger', label: '活动台账', icon: 'FileSpreadsheet' },
  { path: '/activity/statistics', label: '活动统计', icon: 'BarChart3' },
  { path: '/education', label: '教育信息处理', icon: 'GraduationCap' },
  { path: '/settings', label: '系统设置', icon: 'Settings' },
];
