import { useState, useEffect, useRef } from 'react';
import { Plus, Upload, Download, Search, Edit2, Trash2, Link2, FileSpreadsheet } from 'lucide-react';
import { Layout, Card, Button, Modal } from '@/components';
import { useStore } from '@/store';
import { ActivityReview } from '@/types';
import { formatDate, formatDateTime } from '@/utils/storage';
import { exportToExcel, parseExcel, parseTextTable } from '@/utils/excel';

const initialFormData = {
  forecastId: '',
  communityId: '',
  activityName: '',
  actualStartTime: '',
  actualEndTime: '',
  actualParticipants: 0,
  summary: '',
  photos: [] as string[],
  videos: [] as string[],
};

export const ActivityReviewPage = () => {
  const { communities, forecasts, reviews, init, addReview, updateReview, deleteReview } = useStore();
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

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch = r.activityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCommunity = !filterCommunity || r.communityId === filterCommunity;
    return matchesSearch && matchesCommunity;
  });

  const availableForecasts = forecasts.filter(
    (f) => !reviews.some((r) => r.forecastId === f.id) || formData.forecastId === f.id
  );

  const handleForecastSelect = (forecastId: string) => {
    const forecast = forecasts.find((f) => f.id === forecastId);
    if (forecast) {
      setFormData({
        ...formData,
        forecastId,
        communityId: forecast.communityId,
        activityName: forecast.activityName,
        actualStartTime: forecast.startTime,
        actualEndTime: forecast.endTime || forecast.startTime,
        actualParticipants: forecast.expectedParticipants,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateReview(editingId, formData);
    } else {
      addReview(formData);
    }
    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleEdit = (review: ActivityReview) => {
    setFormData(review);
    setEditingId(review.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条回顾吗？')) {
      deleteReview(id);
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
          addReview({
            forecastId: '',
            communityId: community.id,
            activityName: row['活动名称'] || row['活动'] || '',
            actualStartTime: row['开始时间'] || row['时间'] || '',
            actualEndTime: row['结束时间'] || '',
            actualParticipants: Number(row['实际人数'] || row['人数'] || 0),
            summary: row['总结'] || row['活动总结'] || '',
            photos: [],
            videos: [],
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
      actualStartTime: '开始时间',
      actualEndTime: '结束时间',
      actualParticipants: '实际人数',
      summary: '总结',
    };
    
    const data = parseTextTable<Record<string, string>>(importText, columnMapping);
    data.forEach((row) => {
      const community = communities.find(
        (c) => c.name === row.communityId || c.id === row.communityId
      );
      if (community) {
        addReview({
          forecastId: '',
          communityId: community.id,
          activityName: row.activityName || '',
          actualStartTime: row.actualStartTime || '',
          actualEndTime: row.actualEndTime || '',
          actualParticipants: Number(row.actualParticipants) || 0,
          summary: row.summary || '',
          photos: [],
          videos: [],
        });
      }
    });
    setIsImportModalOpen(false);
    setImportText('');
  };

  const handleExport = () => {
    const exportData = filteredReviews.map((r) => ({
      '社区名称': communities.find((c) => c.id === r.communityId)?.name || '',
      '活动名称': r.activityName,
      '开始时间': r.actualStartTime,
      '结束时间': r.actualEndTime,
      '实际人数': r.actualParticipants,
      '活动总结': r.summary,
      '创建时间': formatDateTime(r.createTime),
    }));
    exportToExcel(exportData, `活动回顾_${formatDate(new Date())}`);
  };

  const getCommunityName = (id: string) => {
    return communities.find((c) => c.id === id)?.name || '';
  };

  const getForecastName = (id: string) => {
    if (!id) return null;
    const forecast = forecasts.find((f) => f.id === id);
    return forecast ? forecast.activityName : null;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">活动回顾报送</h1>
            <p className="text-gray-500 mt-1">记录活动实际开展情况</p>
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
              新增回顾
            </Button>
          </div>
        </div>

        <Card>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索活动名称..."
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">实际人数</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">关联预告</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">创建时间</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{getCommunityName(review.communityId)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{review.activityName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <div>{formatDate(review.actualStartTime)}</div>
                        {review.actualEndTime && <div className="text-xs text-gray-400">至 {formatDate(review.actualEndTime)}</div>}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{review.actualParticipants}人</td>
                      <td className="py-3 px-4">
                        {review.forecastId ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                            <Link2 className="w-3 h-3" />
                            {getForecastName(review.forecastId)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">未关联</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">{formatDateTime(review.createTime)}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(review)}
                            className="p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
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
                      <p>暂无活动回顾数据</p>
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
        title={editingId ? '编辑活动回顾' : '新增活动回顾'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关联预告（可选）</label>
            <select
              value={formData.forecastId}
              onChange={(e) => handleForecastSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            >
              <option value="">不关联预告</option>
              {availableForecasts.map((f) => (
                <option key={f.id} value={f.id}>
                  {communities.find((c) => c.id === f.communityId)?.name} - {f.activityName}
                </option>
              ))}
            </select>
          </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">开始时间 *</label>
              <input
                type="datetime-local"
                required
                value={formData.actualStartTime}
                onChange={(e) => setFormData({ ...formData, actualStartTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
              <input
                type="datetime-local"
                value={formData.actualEndTime}
                onChange={(e) => setFormData({ ...formData, actualEndTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">实际参与人数</label>
            <input
              type="number"
              min="0"
              value={formData.actualParticipants}
              onChange={(e) => setFormData({ ...formData, actualParticipants: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动总结</label>
            <textarea
              rows={4}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            />
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
              {editingId ? '保存修改' : '添加回顾'}
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
        title="批量导入活动回顾"
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
              placeholder="社区ID&#9;活动名称&#9;开始时间&#9;结束时间&#9;实际人数&#9;总结"
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
