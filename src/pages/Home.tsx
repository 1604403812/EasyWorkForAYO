import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarPlus, 
  ClipboardList, 
  FileSpreadsheet, 
  BarChart3, 
  GraduationCap, 
  Settings,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Layout, Card } from '@/components';
import { useStore } from '@/store';
import { getTodoList } from '@/utils/date';
import { formatDateTime } from '@/utils/storage';
import { TodoItem } from '@/types';

const quickLinks = [
  { path: '/activity/forecast', label: '活动预告报送', icon: CalendarPlus, color: 'bg-blue-500' },
  { path: '/activity/review', label: '活动回顾报送', icon: ClipboardList, color: 'bg-green-500' },
  { path: '/activity/ledger', label: '活动台账', icon: FileSpreadsheet, color: 'bg-purple-500' },
  { path: '/activity/statistics', label: '活动统计', icon: BarChart3, color: 'bg-orange-500' },
  { path: '/education', label: '教育信息处理', icon: GraduationCap, color: 'bg-pink-500' },
  { path: '/settings', label: '系统设置', icon: Settings, color: 'bg-gray-500' },
];

const getTodoTypeStyles = (type: TodoItem['type']) => {
  switch (type) {
    case 'warning':
      return 'bg-orange-50 border-orange-200 text-orange-700';
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-700';
    case 'success':
      return 'bg-green-50 border-green-200 text-green-700';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
};

export const Home = () => {
  const { forecasts, reviews, operations, init } = useStore();
  const todos = getTodoList();

  useEffect(() => {
    init();
  }, [init]);

  const stats = [
    { 
      label: '活动预告', 
      value: forecasts.length, 
      icon: CalendarPlus, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    { 
      label: '活动回顾', 
      value: reviews.length, 
      icon: ClipboardList, 
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    { 
      label: '本月活动', 
      value: forecasts.filter(f => {
        const date = new Date(f.startTime);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length, 
      icon: TrendingUp, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
            <p className="text-gray-500 mt-1">欢迎回来，今天是 {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card title="待办事项" className="col-span-1">
            {todos.length > 0 ? (
              <div className="space-y-3">
                {todos.map((todo, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getTodoTypeStyles(todo.type)}`}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{todo.task}</p>
                      <p className="text-xs opacity-75">{todo.deadline}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无待办事项</p>
              </div>
            )}
          </Card>

          <Card title="快捷入口" className="col-span-2">
            <div className="grid grid-cols-3 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                >
                  <div className={`p-2.5 rounded-lg ${link.color} text-white`}>
                    <link.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#1e3a5f]">{link.label}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <Card title="最近操作" action={
          <span className="text-xs text-gray-400">显示最近5条</span>
        }>
          {operations.length > 0 ? (
            <div className="space-y-3">
              {operations.slice(0, 5).map((op) => (
                <div 
                  key={op.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      op.type === 'create' ? 'bg-green-100 text-green-700' :
                      op.type === 'update' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {op.type === 'create' ? '新增' : op.type === 'update' ? '更新' : '删除'}
                    </span>
                    <span className="text-sm text-gray-600">{op.module}</span>
                    <span className="text-sm text-gray-500">{op.description}</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDateTime(op.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>暂无操作记录</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
