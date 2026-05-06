import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { Layout, Card, Button } from '@/components';
import { useStore } from '@/store';
import { LedgerItem } from '@/types';
import { formatDate } from '@/utils/storage';
import { exportToExcel } from '@/utils/excel';
import { getLastMonthRange } from '@/utils/date';

export const ActivityLedger = () => {
  const { communities, forecasts, reviews, init } = useStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ledgerData, setLedgerData] = useState<LedgerItem[]>([]);

  useEffect(() => {
    init();
    const { start, end } = getLastMonthRange();
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, [init]);

  useEffect(() => {
    if (startDate && endDate) {
      generateLedger();
    }
  }, [startDate, endDate, forecasts, reviews]);

  const generateLedger = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const data: LedgerItem[] = [];

    forecasts.forEach((forecast) => {
      const forecastDate = new Date(forecast.startTime);
      if (forecastDate >= start && forecastDate <= end) {
        const review = reviews.find((r) => r.forecastId === forecast.id);
        const community = communities.find((c) => c.id === forecast.communityId);

        data.push({
          communityName: community?.name || '',
          activityName: forecast.activityName,
          activityType: forecast.activityType,
          startTime: forecast.startTime,
          endTime: forecast.endTime || forecast.startTime,
          location: forecast.location,
          expectedParticipants: forecast.expectedParticipants,
          actualParticipants: review?.actualParticipants || 0,
          status: review ? '已完成' : forecast.status === 'reviewed' ? '已审核' : '待审核',
        });
      }
    });

    reviews.forEach((review) => {
      if (!review.forecastId) {
        const reviewDate = new Date(review.actualStartTime);
        if (reviewDate >= start && reviewDate <= end) {
          const community = communities.find((c) => c.id === review.communityId);

          data.push({
            communityName: community?.name || '',
            activityName: review.activityName,
            activityType: '',
            startTime: review.actualStartTime,
            endTime: review.actualEndTime || review.actualStartTime,
            location: '',
            expectedParticipants: 0,
            actualParticipants: review.actualParticipants,
            status: '已完成',
          });
        }
      }
    });

    data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    setLedgerData(data);
  };

  const handleExport = () => {
    const exportData = ledgerData.map((item) => ({
      '社区名称': item.communityName,
      '活动名称': item.activityName,
      '活动类型': item.activityType,
      '开始时间': formatDate(item.startTime),
      '结束时间': formatDate(item.endTime),
      '活动地点': item.location,
      '预计人数': item.expectedParticipants,
      '实际人数': item.actualParticipants,
      '状态': item.status,
    }));
    exportToExcel(exportData, `活动台账_${startDate}_${endDate}`);
  };

  const setQuickRange = (type: 'lastMonth' | 'thisMonth' | 'lastWeek' | 'thisWeek') => {
    const today = new Date();
    let start: Date;
    let end: Date;

    switch (type) {
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 6);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        start = lastWeekStart;
        end = lastWeekEnd;
        break;
      case 'thisWeek':
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay() + 1);
        const thisWeekEnd = new Date(thisWeekStart);
        thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
        start = thisWeekStart;
        end = thisWeekEnd;
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const totalExpected = ledgerData.reduce((sum, item) => sum + item.expectedParticipants, 0);
  const totalActual = ledgerData.reduce((sum, item) => sum + item.actualParticipants, 0);
  const completedCount = ledgerData.filter((item) => item.status === '已完成').length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">活动台账</h1>
            <p className="text-gray-500 mt-1">按时间段生成活动台账</p>
          </div>
          <Button onClick={handleExport} disabled={ledgerData.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            导出Excel
          </Button>
        </div>

        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">时间范围：</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            />
            <span className="text-gray-400">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            />
            <div className="flex gap-2 ml-4">
              <Button variant="secondary" size="sm" onClick={() => setQuickRange('lastMonth')}>
                上月
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setQuickRange('thisMonth')}>
                本月
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setQuickRange('lastWeek')}>
                上周
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setQuickRange('thisWeek')}>
                本周
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">活动总数</p>
              <p className="text-2xl font-bold text-blue-700">{ledgerData.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">已完成</p>
              <p className="text-2xl font-bold text-green-700">{completedCount}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600">预计参与人数</p>
              <p className="text-2xl font-bold text-purple-700">{totalExpected}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600">实际参与人数</p>
              <p className="text-2xl font-bold text-orange-700">{totalActual}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">序号</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">社区名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">活动名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">活动类型</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">开始时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">结束时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">活动地点</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">预计人数</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">实际人数</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                </tr>
              </thead>
              <tbody>
                {ledgerData.length > 0 ? (
                  ledgerData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.communityName}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.activityName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.activityType || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(item.startTime)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(item.endTime)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.location || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.expectedParticipants || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.actualParticipants || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === '已完成' 
                            ? 'bg-green-100 text-green-700' 
                            : item.status === '已审核'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-400">
                      <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>该时间段内暂无活动数据</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
