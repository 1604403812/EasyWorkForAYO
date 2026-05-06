import { useState, useEffect, useRef } from 'react';
import { Plus, Upload, Download, Search, Edit2, Trash2, FileSpreadsheet, Calendar, Clock, Target, Users, Phone, X, FileText } from 'lucide-react';
import { Layout, Card, Button, Modal } from '@/components';
import { useStore } from '@/store';
import { ACTIVITY_TYPES } from '@/constants';
import { ActivityForecast as ActivityForecastType } from '@/types';
import { formatDate } from '@/utils/storage';
import { downloadFile } from '@/utils/storage';

interface FixedForecastForm {
  communityId: string;
  activityName: string;
  startTime: string;
  endTime: string;
  location: string;
  activityObject: string;
  contactPhone: string;
}

interface TempForecast {
  id: string;
  communityId: string;
  communityName: string;
  activityName: string;
  startTime: string;
  endTime: string;
  location: string;
  activityObject: string;
  contactPhone: string;
}

const initialFixedForm: FixedForecastForm = {
  communityId: '',
  activityName: '',
  startTime: '',
  endTime: '',
  location: '',
  activityObject: '',
  contactPhone: '',
};

const ACTIVITY_OBJECTS = [
  '辖区亲子家庭',
  '辖区青少年',
  '辖区银龄群众',
  '辖区居民',
  '辖区新就业群体',
];

export const ActivityForecast = () => {
  const { communities, forecasts, init, addForecast, updateForecast, deleteForecast } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fixedForm, setFixedForm] = useState<FixedForecastForm>(initialFixedForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCommunity, setFilterCommunity] = useState('');
  const [tempForecasts, setTempForecasts] = useState<TempForecast[]>([]);
  const [tempForm, setTempForm] = useState<FixedForecastForm>(initialFixedForm);
  const [weekendForecast, setWeekendForecast] = useState<TempForecast[]>([]);
  const [twoWeekForecast, setTwoWeekForecast] = useState<TempForecast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    if (dayOfWeek === 3) {
      const weekend = getThisWeekendActivities();
      setWeekendForecast(weekend);
    }
  }, [forecasts]);

  const getThisWeekendActivities = (): TempForecast[] => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);

    const saturdayStart = new Date(saturday.setHours(0, 0, 0, 0));
    const sundayEnd = new Date(sunday.setHours(23, 59, 59, 999));

    return forecasts
      .filter(f => {
        const start = new Date(f.startTime);
        return start >= saturdayStart && start <= sundayEnd;
      })
      .map(f => ({
        id: f.id,
        communityId: f.communityId,
        communityName: communities.find(c => c.id === f.communityId)?.name || '',
        activityName: f.activityName,
        startTime: f.startTime,
        endTime: f.endTime,
        location: f.location,
        activityObject: f.activityObject || '',
        contactPhone: f.contactPhone,
      }));
  };

  const permanentForecasts = forecasts.filter(f => f.isPermanent);
  const filteredForecasts = permanentForecasts.filter(f => {
    return !filterCommunity || f.communityId === filterCommunity;
  });

  const handleSubmitFixed = (e: React.FormEvent) => {
    e.preventDefault();
    
    const forecastData = {
      communityId: fixedForm.communityId,
      activityName: fixedForm.activityName,
      activityType: '固定活动',
      startTime: fixedForm.startTime,
      endTime: fixedForm.endTime,
      location: fixedForm.location,
      description: fixedForm.activityObject,
      expectedParticipants: 0,
      contactPerson: '',
      contactPhone: fixedForm.contactPhone,
      status: 'pending' as const,
      isPermanent: true,
      activityObject: fixedForm.activityObject,
    };

    if (editingId) {
      updateForecast(editingId, forecastData);
    } else {
      addForecast(forecastData);
    }
    setIsModalOpen(false);
    setFixedForm(initialFixedForm);
    setEditingId(null);
  };

  const handleEdit = (forecast: ActivityForecastType) => {
    setFixedForm({
      communityId: forecast.communityId,
      activityName: forecast.activityName,
      startTime: forecast.startTime,
      endTime: forecast.endTime,
      location: forecast.location,
      activityObject: forecast.activityObject || '',
      contactPhone: forecast.contactPhone,
    });
    setEditingId(forecast.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条固定预告吗？')) {
      deleteForecast(id);
    }
  };

  const handleAddTempForecast = () => {
    if (!tempForm.communityId || !tempForm.activityName) {
      alert('请填写社区和活动名称');
      return;
    }
    const newTemp: TempForecast = {
      id: Date.now().toString(),
      communityId: tempForm.communityId,
      communityName: communities.find(c => c.id === tempForm.communityId)?.name || '',
      activityName: tempForm.activityName,
      startTime: tempForm.startTime,
      endTime: tempForm.endTime,
      location: tempForm.location,
      activityObject: tempForm.activityObject,
      contactPhone: tempForm.contactPhone,
    };
    setTempForecasts([...tempForecasts, newTemp]);
    setTempForm(initialFixedForm);
  };

  const handleRemoveTempForecast = (id: string) => {
    setTempForecasts(tempForecasts.filter(t => t.id !== id));
  };

  const formatTimeForExport = (isoTime: string): string => {
    if (!isoTime) return '';
    const date = new Date(isoTime);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日${hours}:${minutes}`;
  };

  const generateForecastText = (forecast: TempForecast): string => {
    const lines: string[] = [];
    lines.push(`${forecast.communityName}党群服务中心`);
    lines.push('');
    lines.push(`活动时间：${formatTimeForExport(forecast.startTime)}-${formatTimeForExport(forecast.endTime)}`);
    lines.push(`活动地点：${forecast.location}`);
    lines.push(`活动主题：${forecast.activityName}`);
    lines.push(`活动对象：${forecast.activityObject}`);
    lines.push(`报名方式：1、直接填写电话号码 ${forecast.contactPhone}`);
    return lines.join('\n');
  };

  const handleExportWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    const saturdayMonth = saturday.getMonth() + 1;
    const saturdayDay = saturday.getDate();

    const allForecasts = [...weekendForecast, ...tempForecasts];
    
    const text = allForecasts.map((f, index) => {
      let content = generateForecastText(f);
      if (index < allForecasts.length - 1) {
        content += '\n\n' + '─'.repeat(50) + '\n\n';
      }
      return content;
    }).join('\n');

    const filename = `${saturdayMonth}月${saturdayDay}日周末活动预告_${formatDate(new Date())}.txt`;
    downloadFile(text, filename, 'text/plain;charset=utf-8');
    
    setTempForecasts([]);
  };

  const handleExportTwoWeek = () => {
    const today = new Date();
    const saturday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    saturday.setDate(today.getDate() + daysUntilSaturday);
    
    const nextSaturday = new Date(saturday);
    nextSaturday.setDate(saturday.getDate() + 7);
    const nextSunday = new Date(nextSaturday);
    nextSunday.setDate(nextSaturday.getDate() + 1);

    const startDate = new Date(saturday);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(nextSunday);
    endDate.setHours(23, 59, 59, 999);

    const twoWeekForecasts = forecasts
      .filter(f => {
        const start = new Date(f.startTime);
        return start >= startDate && start <= endDate;
      })
      .slice(0, 5)
      .map(f => ({
        id: f.id,
        communityId: f.communityId,
        communityName: communities.find(c => c.id === f.communityId)?.name || '',
        activityName: f.activityName,
        startTime: f.startTime,
        endTime: f.endTime,
        location: f.location,
        activityObject: (f as ActivityForecastType & { activityObject?: string }).activityObject || '',
        contactPhone: f.contactPhone,
      }));

    const text = twoWeekForecasts.map((f, index) => {
      let content = generateForecastText(f);
      if (index < twoWeekForecasts.length - 1) {
        content += '\n\n' + '─'.repeat(50) + '\n\n';
      }
      return content;
    }).join('\n');

    const filename = `下两周活动预告_${formatDate(new Date())}.txt`;
    downloadFile(text, filename, 'text/plain;charset=utf-8');
  };

  const handleExportAll = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    const saturdayMonth = saturday.getMonth() + 1;
    const saturdayDay = saturday.getDate();

    const allForecasts = [...weekendForecast, ...tempForecasts];
    
    const text = allForecasts.map((f, index) => {
      let content = generateForecastText(f);
      if (index < allForecasts.length - 1) {
        content += '\n\n' + '─'.repeat(50) + '\n\n';
      }
      return content;
    }).join('\n');

    const filename = `${saturdayMonth}月${saturdayDay}日周末活动预告_${formatDate(new Date())}.txt`;
    downloadFile(text, filename, 'text/plain;charset=utf-8');
    
    setTempForecasts([]);
  };

  const getCommunityName = (id: string) => {
    return communities.find(c => c.id === id)?.name || '';
  };

  const today = new Date();
  const dayOfWeek = today.getDay();
  const isWednesday = dayOfWeek === 3;
  const isFriday = dayOfWeek === 5;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">活动预告报送</h1>
            <p className="text-gray-500 mt-1">管理各社区的活动预告信息</p>
          </div>
          <div className="flex gap-3">
            {isWednesday && (
              <>
                <Button variant="secondary" onClick={handleExportWeekend} disabled={weekendForecast.length === 0 && tempForecasts.length === 0}>
                  <FileText className="w-4 h-4 mr-2" />
                  导出周末预告
                </Button>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  新增固定预告
                </Button>
              </>
            )}
            {isFriday && (
              <Button variant="secondary" onClick={handleExportTwoWeek}>
                <FileText className="w-4 h-4 mr-2" />
                导出下两周预告（限5条）
              </Button>
            )}
            {!isWednesday && !isFriday && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                新增固定预告
              </Button>
            )}
          </div>
        </div>

        {isWednesday && (
          <Card title="周末临时预告（导出后可清空）">
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">社区</label>
                  <select
                    value={tempForm.communityId}
                    onChange={(e) => setTempForm({ ...tempForm, communityId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  >
                    <option value="">选择社区</option>
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">活动名称</label>
                  <input
                    type="text"
                    value={tempForm.activityName}
                    onChange={(e) => setTempForm({ ...tempForm, activityName: e.target.value })}
                    placeholder="请输入活动名称"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                  <input
                    type="datetime-local"
                    value={tempForm.startTime}
                    onChange={(e) => setTempForm({ ...tempForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                  <input
                    type="datetime-local"
                    value={tempForm.endTime}
                    onChange={(e) => setTempForm({ ...tempForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">活动对象</label>
                  <input
                    type="text"
                    value={tempForm.activityObject}
                    onChange={(e) => setTempForm({ ...tempForm, activityObject: e.target.value })}
                    placeholder="如：辖区居民（50人）"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                  <input
                    type="tel"
                    value={tempForm.contactPhone}
                    onChange={(e) => setTempForm({ ...tempForm, contactPhone: e.target.value })}
                    placeholder="电话"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTempForecast}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加临时预告
                </Button>
                <Button variant="secondary" onClick={() => setTempForecasts([])} disabled={tempForecasts.length === 0}>
                  清空临时预告
                </Button>
              </div>

              {tempForecasts.length > 0 && (
                <div className="border rounded-lg divide-y">
                  {tempForecasts.map((temp) => (
                    <div key={temp.id} className="p-3 flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-6 gap-4">
                        <span className="text-sm font-medium text-gray-900">{temp.communityName}</span>
                        <span className="text-sm text-gray-600">{temp.activityName}</span>
                        <span className="text-sm text-gray-500">
                          {formatTimeForExport(temp.startTime)}-{formatTimeForExport(temp.endTime)}
                        </span>
                        <span className="text-sm text-gray-500">{temp.location}</span>
                        <span className="text-sm text-gray-500">{temp.activityObject}</span>
                        <span className="text-sm text-gray-500">{temp.contactPhone}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveTempForecast(temp.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {isWednesday && weekendForecast.length > 0 && (
          <Card title="本周固定预告（周末活动）">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">社区</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">活动名称</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">时间</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">地点</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">活动对象</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">联系电话</th>
                  </tr>
                </thead>
                <tbody>
                  {weekendForecast.map((f) => (
                    <tr key={f.id} className="border-b border-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{f.communityName}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{f.activityName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatTimeForExport(f.startTime)}-{formatTimeForExport(f.endTime)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{f.location}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{f.activityObject}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{f.contactPhone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card title="固定预告库">
          <div className="flex gap-4 mb-6">
            <select
              value={filterCommunity}
              onChange={(e) => setFilterCommunity(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            >
              <option value="">全部社区</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">社区</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">活动名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">地点</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">活动对象</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">联系电话</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredForecasts.length > 0 ? (
                  filteredForecasts.map((forecast) => (
                    <tr key={forecast.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{getCommunityName(forecast.communityId)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{forecast.activityName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(forecast.startTime)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{forecast.location}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{(forecast as ActivityForecastType & { activityObject?: string }).activityObject || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{forecast.contactPhone || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(forecast)}
                            className="p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(forecast.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无固定预告数据</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFixedForm(initialFixedForm);
          setEditingId(null);
        }}
        title={editingId ? '编辑固定预告' : '新增固定预告'}
        size="lg"
      >
        <form onSubmit={handleSubmitFixed} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">社区 *</label>
              <select
                required
                value={fixedForm.communityId}
                onChange={(e) => setFixedForm({ ...fixedForm, communityId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              >
                <option value="">请选择社区</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">活动名称 *</label>
              <input
                type="text"
                required
                value={fixedForm.activityName}
                onChange={(e) => setFixedForm({ ...fixedForm, activityName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始时间 *</label>
              <input
                type="datetime-local"
                required
                value={fixedForm.startTime}
                onChange={(e) => setFixedForm({ ...fixedForm, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束时间 *</label>
              <input
                type="datetime-local"
                required
                value={fixedForm.endTime}
                onChange={(e) => setFixedForm({ ...fixedForm, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动地点 *</label>
            <input
              type="text"
              required
              value={fixedForm.location}
              onChange={(e) => setFixedForm({ ...fixedForm, location: e.target.value })}
              placeholder="如：XX党群服务中心"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动对象</label>
            <input
              type="text"
              value={fixedForm.activityObject}
              onChange={(e) => setFixedForm({ ...fixedForm, activityObject: e.target.value })}
              placeholder="如：辖区居民（50人）、辖区亲子家庭（10对）"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
            <input
              type="tel"
              value={fixedForm.contactPhone}
              onChange={(e) => setFixedForm({ ...fixedForm, contactPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setFixedForm(initialFixedForm);
              setEditingId(null);
            }}>
              取消
            </Button>
            <Button type="submit">
              {editingId ? '保存修改' : '添加预告'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
