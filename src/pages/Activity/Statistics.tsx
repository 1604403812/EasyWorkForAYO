import { useState, useEffect } from 'react';
import { Download, BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Layout, Card, Button } from '@/components';
import { useStore } from '@/store';
import { StatisticsData } from '@/types';
import { exportToExcel } from '@/utils/excel';

const COLORS = ['#1e3a5f', '#4a90d9', '#f5a623', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#84cc16', '#6366f1', '#14b8a6', '#f43f5e'];

export const ActivityStatistics = () => {
  const { communities, forecasts, reviews, init } = useStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [statisticsData, setStatisticsData] = useState<StatisticsData[]>([]);
  const [activityTypeData, setActivityTypeData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    calculateStatistics();
  }, [selectedYear, selectedMonth, forecasts, reviews, communities]);

  const calculateStatistics = () => {
    const start = new Date(selectedYear, selectedMonth - 1, 1);
    const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

    const stats: StatisticsData[] = communities.map((community) => {
      const communityForecasts = forecasts.filter((f) => {
        const date = new Date(f.startTime);
        return f.communityId === community.id && date >= start && date <= end;
      });

      const communityReviews = reviews.filter((r) => {
        const date = new Date(r.actualStartTime);
        return r.communityId === community.id && date >= start && date <= end;
      });

      const totalParticipants = communityReviews.reduce((sum, r) => sum + r.actualParticipants, 0);

      return {
        communityId: community.id,
        communityName: community.name,
        activityCount: communityForecasts.length,
        totalParticipants,
        rank: 0,
      };
    });

    stats.sort((a, b) => b.activityCount - a.activityCount || b.totalParticipants - a.totalParticipants);
    stats.forEach((item, index) => {
      item.rank = index + 1;
    });

    setStatisticsData(stats);

    const typeCount: Record<string, number> = {};
    forecasts.forEach((f) => {
      const date = new Date(f.startTime);
      if (date >= start && date <= end) {
        const type = f.activityType || '其他';
        typeCount[type] = (typeCount[type] || 0) + 1;
      }
    });

    const typeData = Object.entries(typeCount).map(([name, value]) => ({
      name,
      value,
    }));
    setActivityTypeData(typeData);
  };

  const handleExport = () => {
    const exportData = statisticsData.map((item) => ({
      '排名': item.rank,
      '社区名称': item.communityName,
      '活动数量': item.activityCount,
      '参与人数': item.totalParticipants,
    }));
    exportToExcel(exportData, `活动统计_${selectedYear}年${selectedMonth}月`);
  };

  const totalActivities = statisticsData.reduce((sum, item) => sum + item.activityCount, 0);
  const totalParticipants = statisticsData.reduce((sum, item) => sum + item.totalParticipants, 0);
  const avgActivities = totalActivities / communities.length || 0;

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">活动统计</h1>
            <p className="text-gray-500 mt-1">查看各社区活动数据和排名</p>
          </div>
          <Button onClick={handleExport} disabled={statisticsData.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>

        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">统计时间：</span>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            >
              {months.map((month) => (
                <option key={month} value={month}>{month}月</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <p className="text-sm text-blue-600">活动总数</p>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-1">{totalActivities}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-600">参与总人数</p>
              </div>
              <p className="text-2xl font-bold text-green-700 mt-1">{totalParticipants}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <p className="text-sm text-purple-600">社区平均活动数</p>
              </div>
              <p className="text-2xl font-bold text-purple-700 mt-1">{avgActivities.toFixed(1)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <p className="text-sm text-orange-600">统计月份</p>
              </div>
              <p className="text-2xl font-bold text-orange-700 mt-1">{selectedYear}年{selectedMonth}月</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <Card title="社区活动排名">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">排名</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">社区</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">活动数</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">参与人数</th>
                  </tr>
                </thead>
                <tbody>
                  {statisticsData.slice(0, 10).map((item) => (
                    <tr key={item.communityId} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          item.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                          item.rank === 2 ? 'bg-gray-100 text-gray-600' :
                          item.rank === 3 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.communityName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.activityCount}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.totalParticipants}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="活动类型分布">
            {activityTypeData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            )}
          </Card>
        </div>

        <Card title="各社区活动数量对比">
          {statisticsData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statisticsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="communityName" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="activityCount" name="活动数量" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              暂无数据
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
