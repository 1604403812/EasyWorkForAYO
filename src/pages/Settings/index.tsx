import { useState, useRef, useEffect } from 'react';
import { Save, Upload, Download, Trash2, AlertTriangle, Building2 } from 'lucide-react';
import { Layout, Card, Button, Modal } from '@/components';
import { useStore } from '@/store';
import { Community } from '@/types';
import { DEFAULT_COMMUNITIES } from '@/constants';
import { downloadFile } from '@/utils/storage';

export const Settings = () => {
  const { communities, updateCommunities, clearAllData, importData, exportData, init } = useStore();
  const [editedCommunities, setEditedCommunities] = useState<Community[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    setEditedCommunities(communities);
  }, [communities]);

  const handleSaveCommunities = () => {
    updateCommunities(editedCommunities);
    alert('社区配置已保存');
  };

  const handleResetCommunities = () => {
    setEditedCommunities(DEFAULT_COMMUNITIES);
  };

  const handleCommunityChange = (id: string, field: 'name' | 'order', value: string | number) => {
    setEditedCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleExportData = () => {
    const data = exportData();
    downloadFile(data, `街道工作数据备份_${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        alert('数据导入成功');
        init();
      } else {
        alert('数据导入失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    clearAllData();
    setIsDeleteModalOpen(false);
    alert('所有数据已清空');
    init();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-500 mt-1">管理社区信息和系统数据</p>
        </div>

        <Card title="社区配置" action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleResetCommunities}>
              恢复默认
            </Button>
            <Button size="sm" onClick={handleSaveCommunities}>
              <Save className="w-4 h-4 mr-1" />
              保存配置
            </Button>
          </div>
        }>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              配置下辖社区的基本信息，当前共 <span className="font-medium text-gray-700">{editedCommunities.length}</span> 个社区
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-20">序号</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">社区名称</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-24">排序</th>
                  </tr>
                </thead>
                <tbody>
                  {editedCommunities.map((community, index) => (
                    <tr key={community.id} className="border-b border-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={community.name}
                          onChange={(e) => handleCommunityChange(community.id, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="1"
                          value={community.order}
                          onChange={(e) => handleCommunityChange(community.id, 'order', Number(e.target.value))}
                          className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card title="数据管理">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Download className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">数据备份</h4>
                    <p className="text-sm text-gray-500">导出所有数据到JSON文件</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={handleExportData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  导出数据
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Upload className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">数据恢复</h4>
                    <p className="text-sm text-gray-500">从备份文件恢复数据</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  导入数据
                </Button>
              </div>
            </div>

            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="font-medium text-red-900">清空数据</h4>
                  <p className="text-sm text-red-600">删除所有活动预告、回顾和教育信息数据</p>
                </div>
              </div>
              <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                清空所有数据
              </Button>
            </div>
          </div>
        </Card>

        <Card title="关于系统">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">系统名称：</span>
              <span className="text-gray-900">街道工作管理系统</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">版本号：</span>
              <span className="text-gray-900">1.0.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">数据存储：</span>
              <span className="text-gray-900">本地浏览器存储（localStorage）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">技术栈：</span>
              <span className="text-gray-900">React + TypeScript + Tailwind CSS</span>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="确认清空数据"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">危险操作</p>
              <p className="text-sm text-red-600">此操作将删除所有数据，且无法恢复！</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            您确定要清空所有活动预告、活动回顾和教育信息数据吗？建议先进行数据备份。
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleClearData}>
              确认清空
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
