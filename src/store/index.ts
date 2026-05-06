import { create } from 'zustand';
import { 
  Community, 
  ActivityForecast, 
  ActivityReview, 
  EducationInfo, 
  Operation 
} from '@/types';
import { 
  STORAGE_KEYS, 
  DEFAULT_COMMUNITIES 
} from '@/constants';
import { storage, generateId } from '@/utils/storage';

interface AppState {
  communities: Community[];
  forecasts: ActivityForecast[];
  reviews: ActivityReview[];
  educationInfos: EducationInfo[];
  operations: Operation[];
  
  init: () => void;
  
  addForecast: (forecast: Omit<ActivityForecast, 'id' | 'createTime'>) => void;
  updateForecast: (id: string, forecast: Partial<ActivityForecast>) => void;
  deleteForecast: (id: string) => void;
  
  addReview: (review: Omit<ActivityReview, 'id' | 'createTime'>) => void;
  updateReview: (id: string, review: Partial<ActivityReview>) => void;
  deleteReview: (id: string) => void;
  
  addEducationInfo: (info: Omit<EducationInfo, 'id'>) => void;
  updateEducationInfo: (id: string, info: Partial<EducationInfo>) => void;
  deleteEducationInfo: (id: string) => void;
  
  updateCommunities: (communities: Community[]) => void;
  
  addOperation: (operation: Omit<Operation, 'id' | 'timestamp'>) => void;
  
  clearAllData: () => void;
  importData: (data: string) => boolean;
  exportData: () => string;
}

export const useStore = create<AppState>((set, get) => ({
  communities: [],
  forecasts: [],
  reviews: [],
  educationInfos: [],
  operations: [],

  init: () => {
    const communities = storage.get<Community[]>(STORAGE_KEYS.COMMUNITIES, DEFAULT_COMMUNITIES);
    const forecasts = storage.get<ActivityForecast[]>(STORAGE_KEYS.FORECASTS, []);
    const reviews = storage.get<ActivityReview[]>(STORAGE_KEYS.REVIEWS, []);
    const educationInfos = storage.get<EducationInfo[]>(STORAGE_KEYS.EDUCATION, []);
    const operations = storage.get<Operation[]>(STORAGE_KEYS.OPERATIONS, []);

    set({ communities, forecasts, reviews, educationInfos, operations });
  },

  addForecast: (forecast) => {
    const newForecast: ActivityForecast = {
      ...forecast,
      id: generateId(),
      createTime: new Date().toISOString(),
    };
    const forecasts = [...get().forecasts, newForecast];
    set({ forecasts });
    storage.set(STORAGE_KEYS.FORECASTS, forecasts);
    get().addOperation({ type: 'create', module: '活动预告', description: `新增预告：${forecast.activityName}` });
  },

  updateForecast: (id, forecast) => {
    const forecasts = get().forecasts.map((f) =>
      f.id === id ? { ...f, ...forecast } : f
    );
    set({ forecasts });
    storage.set(STORAGE_KEYS.FORECASTS, forecasts);
    get().addOperation({ type: 'update', module: '活动预告', description: `更新预告` });
  },

  deleteForecast: (id) => {
    const forecasts = get().forecasts.filter((f) => f.id !== id);
    set({ forecasts });
    storage.set(STORAGE_KEYS.FORECASTS, forecasts);
    get().addOperation({ type: 'delete', module: '活动预告', description: `删除预告` });
  },

  addReview: (review) => {
    const newReview: ActivityReview = {
      ...review,
      id: generateId(),
      createTime: new Date().toISOString(),
    };
    const reviews = [...get().reviews, newReview];
    set({ reviews });
    storage.set(STORAGE_KEYS.REVIEWS, reviews);
    get().addOperation({ type: 'create', module: '活动回顾', description: `新增回顾：${review.activityName}` });
  },

  updateReview: (id, review) => {
    const reviews = get().reviews.map((r) =>
      r.id === id ? { ...r, ...review } : r
    );
    set({ reviews });
    storage.set(STORAGE_KEYS.REVIEWS, reviews);
    get().addOperation({ type: 'update', module: '活动回顾', description: `更新回顾` });
  },

  deleteReview: (id) => {
    const reviews = get().reviews.filter((r) => r.id !== id);
    set({ reviews });
    storage.set(STORAGE_KEYS.REVIEWS, reviews);
    get().addOperation({ type: 'delete', module: '活动回顾', description: `删除回顾` });
  },

  addEducationInfo: (info) => {
    const newInfo: EducationInfo = {
      ...info,
      id: generateId(),
    };
    const educationInfos = [...get().educationInfos, newInfo];
    set({ educationInfos });
    storage.set(STORAGE_KEYS.EDUCATION, educationInfos);
    get().addOperation({ type: 'create', module: '教育信息', description: `新增教育信息：${info.title}` });
  },

  updateEducationInfo: (id, info) => {
    const educationInfos = get().educationInfos.map((e) =>
      e.id === id ? { ...e, ...info } : e
    );
    set({ educationInfos });
    storage.set(STORAGE_KEYS.EDUCATION, educationInfos);
    get().addOperation({ type: 'update', module: '教育信息', description: `更新教育信息` });
  },

  deleteEducationInfo: (id) => {
    const educationInfos = get().educationInfos.filter((e) => e.id !== id);
    set({ educationInfos });
    storage.set(STORAGE_KEYS.EDUCATION, educationInfos);
    get().addOperation({ type: 'delete', module: '教育信息', description: `删除教育信息` });
  },

  updateCommunities: (communities) => {
    set({ communities });
    storage.set(STORAGE_KEYS.COMMUNITIES, communities);
    get().addOperation({ type: 'update', module: '系统设置', description: `更新社区配置` });
  },

  addOperation: (operation) => {
    const newOperation: Operation = {
      ...operation,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    const operations = [newOperation, ...get().operations].slice(0, 50);
    set({ operations });
    storage.set(STORAGE_KEYS.OPERATIONS, operations);
  },

  clearAllData: () => {
    storage.clear();
    set({
      forecasts: [],
      reviews: [],
      educationInfos: [],
      operations: [],
    });
  },

  importData: (data) => {
    return storage.importAll(data);
  },

  exportData: () => {
    return storage.exportAll();
  },
}));
