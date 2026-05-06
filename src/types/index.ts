export interface Community {
  id: string;
  name: string;
  order: number;
}

export interface ActivityForecast {
  id: string;
  communityId: string;
  activityName: string;
  activityType: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  expectedParticipants: number;
  contactPerson: string;
  contactPhone: string;
  createTime: string;
  status: 'pending' | 'reviewed' | 'completed';
  isPermanent: boolean;
  activityObject: string;
}

export interface ActivityReview {
  id: string;
  forecastId: string;
  communityId: string;
  activityName: string;
  actualStartTime: string;
  actualEndTime: string;
  actualParticipants: number;
  summary: string;
  photos: string[];
  videos: string[];
  createTime: string;
}

export interface EducationInfo {
  id: string;
  communityId: string;
  title: string;
  content: string;
  date: string;
  participants: number;
  location: string;
}

export interface Operation {
  id: string;
  type: 'create' | 'update' | 'delete';
  module: string;
  description: string;
  timestamp: string;
}

export interface TodoItem {
  task: string;
  deadline: string;
  type: 'warning' | 'info' | 'success';
}

export interface StatisticsData {
  communityId: string;
  communityName: string;
  activityCount: number;
  totalParticipants: number;
  rank: number;
}

export interface LedgerItem {
  communityName: string;
  activityName: string;
  activityType: string;
  startTime: string;
  endTime: string;
  location: string;
  expectedParticipants: number;
  actualParticipants: number;
  status: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  communityCount: number;
}
