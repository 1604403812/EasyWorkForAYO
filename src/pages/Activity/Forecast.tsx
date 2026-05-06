import { useState, useEffect, useRef } from 'react';
import { Plus, Upload, Download, Search, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';
import { Layout, Card, Button, Modal } from '@/components';
import { useStore } from '@/store';
import { ACTIVITY_TYPES } from '@/constants';
import { ActivityForecast as ActivityForecastType } from '@/types';
import { formatDate, formatDateTime } from '@/utils/storage';
import { exportToExcel, parseExcel, parseTextTable } from '@/utils/excel';

const initialFormData: {
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
  status: 'pending' | 'reviewed' | 'completed';
} = {
  communityId: '',
  activityName: '',
  activityType: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  expectedParticipants: 0,
  contactPerson: '',
  contactPhone: '',
  status: 'pending',
};

export const ActivityForecast = () => {
  const { communities, forecasts, init, addForecast, updateForecast, deleteForecast } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCommunity, setFilterCommunity] = useState('');
  const [importText, setImportText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    init();
  }, [init]);

  const filteredForecasts = forecasts.filter((f) => {
    const matchesSearch = f.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCommunity = !filterCommunity || f.communityId === filterCommunity;
    return matchesSearch && matchesCommunity;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateForecast(editingId, formData);
    } else {
      addForecast(formData);
    }
    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleEdit = (forecast: ActivityForecastType) => {
    setFormData({
      ...forecast,
      status: forecast.status || 'pending',
    });
    setEditingId(forecast.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条预告吗？')) {
      deleteForecast(id);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcel<Record<string, string>>(file);
      data.forEach((row) => {
        const community = communities.find(
          (c) => c.name === row['社区名称'] || c.name === row['社区'] || c.id === row['社区ID']
        );
        if (community) {
          addForecast({
            communityId: community.id,
            activityName: row['活动名称'] || row['活动'] || '',
            activityType: row['活动类型'] || row['类型'] || '其他',
            startTime: row['开始时间'] || row['时间'] || '',
            endTime: row['结束时间'] || '',
            location: row['地点'] || row['活动地点'] || '',
            description: row['描述'] || row['活动描述'] || '',
            expectedParticipants: Number(row['预计人数'] || row['人数'] || 0),
            contactPerson: row['联系人'] || '',
            contactPhone: row['联系电话'] || row['电话'] || '',
            status: 'pending',
          });
        }
      });
      setIsImportModalOpen(false);
      setImportText('');
    } catch (error) {
      alert('文件解析失败，请检查格式');
    }
  };

  const handleTextImport = () => {
    const columnMapping = {
      communityId: '社区ID',
      activityName: '活动名称',
      activityType: '活动类型',
      startTime: '开始时间',
      endTime: '结束时间',
      location: '地点',
      description: '描述',
      expectedParticipants: '预计人数',
      contactPerson: '联系人',
      contactPhone: '联系电话',
    };
    
    const data = parseTextTable<Record<string, string>>(importText, columnMapping);
    data.forEach((row) => {
      const community = communities.find(
        (c) => c.name === row.communityId || c.id === row.communityId
      );
      if (community) {
        addForecast({
          communityId: community.id,
          activityName: row.activityName || '',
          activityType: row.activityType || '其他',
          startTime: row.startTime || '',
          endTime: row.endTime || '',
          location: row.location || '',
          description: row.description || '',
          expectedParticipants: Number(row.expectedParticipants) || 0,
          contactPerson: row.contactPerson || '',
          contactPhone: row.contactPhone || '',
          status: 'pending',
        });
      }
    });
    setIsImportModalOpen(false);
    setImportText('');
  };

  const handleExport = () => {
    const exportData = filteredForecasts.map((f) => ({
      '社区名称': communities.find((c) => c.id === f.communityId)?.name || '',
      '活动名称': f.activityName,
      '活动类型': f.activityType,
      '开始时间': f.startTime,
      '结束时间': f.endTime,
      '活动地点': f.location,
      '活动描述': f.description,
      '预计人数': f.expectedParticipants,
      '联系人': f.contactPerson,
      '联系电话': f.contactPhone,
      '状态': f.status === 'pending' ? '待审核' : f.status === 'reviewed' ? '已审核' : '已完成',
      '创建时间': formatDateTime(f.createTime),
    }));
    exportToExcel(exportData, `活动预告_${formatDate(new Date())}`);
  };

  const getCommunityName = (id: string) => {
    return communities.find((c) => c.id === id)?.name || '';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">待审核</span>;
      case 'reviewed':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">已审核</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">已完成</span>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">活动预告报送</h1>
            <p className="text-gray-500 mt-1">管理各社区的活动预告信息</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              批量导入
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新增预告
            </Button>
          </div>
        </div>

        <Card>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索活动名称或地点..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
            <select
              value={filterCommunity}
              onChange={(e) => setFilterCommunity(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">活动类型</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">地点</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">预计人数</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredForecasts.length > 0 ? (
                  filteredForecasts.map((forecast) => (
                    <tr key={forecast.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{getCommunityName(forecast.communityId)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{forecast.activityName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{forecast.activityType}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <div>{formatDate(forecast.startTime)}</div>
                        {forecast.endTime && <div className="text-xs text-gray-400">至 {formatDate(forecast.endTime)}</div>}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{forecast.location}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{forecast.expectedParticipants}人</td>
                      <td className="py-3 px-4">{getStatusBadge(forecast.status)}</td>
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
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无活动预告数据</p>
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
          setFormData(initialFormData);
          setEditingId(null);
        }}
        title={editingId ? '编辑活动预告' : '新增活动预告'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">社区 *</label>
              <select
                required
                value={formData.communityId}
                onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
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
                value={formData.activityName}
                onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">活动类型</label>
              <select
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              >
                <option value="">请选择类型</option>
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">预计人数</label>
              <input
                type="number"
                min="0"
                value={formData.expectedParticipants}
                onChange={(e) => setFormData({ ...formData, expectedParticipants: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始时间 *</label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动地点 *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            >
              <option value="pending">待审核</option>
              <option value="reviewed">已审核</option>
              <option value="completed">已完成</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setFormData(initialFormData);
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

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportText('');
        }}
        title="批量导入活动预告"
        size="lg"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">点击上传或拖拽Excel文件到此处</p>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              选择文件
            </Button>
          </div>

          <div className="text-center text-gray-400 text-sm">或</div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">粘贴文本数据（Tab分隔）</label>
            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="社区ID&#9;活动名称&#9;活动类型&#9;开始时间&#9;结束时间&#9;地点&#9;描述&#9;预计人数&#9;联系人&#9;联系电话"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => {
              setIsImportModalOpen(false);
              setImportText('');
            }}>
              取消
            </Button>
            <Button onClick={handleTextImport} disabled={!importText.trim()}>
              导入数据
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
