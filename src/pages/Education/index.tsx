import { useState, useRef } from 'react';
import { Upload, Download, Copy, Check, FileText, RefreshCw } from 'lucide-react';
import { Layout, Card, Button } from '@/components';
import { useStore } from '@/store';
import { exportToExcel, parseExcel, parseTextTable } from '@/utils/excel';

interface EducationInputData {
  communityName?: string;
  title?: string;
  content?: string;
  date?: string;
  participants?: string | number;
  location?: string;
  [key: string]: string | number | undefined;
}

interface FormattedData {
  社区名称: string;
  教育主题: string;
  教育内容: string;
  教育日期: string;
  参与人数: number;
  地点: string;
  [key: string]: string | number;
}

export const Education = () => {
  const { communities, addEducationInfo } = useStore();
  const [inputText, setInputText] = useState('');
  const [formattedData, setFormattedData] = useState<FormattedData[]>([]);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcel<EducationInputData>(file);
      processInputData(data);
    } catch (error) {
      alert('文件解析失败，请检查格式');
    }
  };

  const handleTextParse = () => {
    const lines = inputText.trim().split('\n');
    if (lines.length === 0) return;

    const hasHeader = lines[0].includes('社区') || lines[0].includes('主题') || lines[0].includes('标题');
    
    const data: EducationInputData[] = [];
    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split('\t').map((v) => v.trim());
      if (values.length >= 3) {
        data.push({
          communityName: values[0],
          title: values[1],
          content: values[2],
          date: values[3] || '',
          participants: values[4] || 0,
          location: values[5] || '',
        });
      }
    }

    processInputData(data);
  };

  const processInputData = (data: EducationInputData[]) => {
    const formatted: FormattedData[] = data.map((item) => {
      const community = communities.find(
        (c) => c.name === item.communityName || c.id === item.communityName
      );

      return {
        社区名称: community?.name || item.communityName || '',
        教育主题: String(item.title || item['主题'] || item['教育主题'] || ''),
        教育内容: String(item.content || item['内容'] || item['教育内容'] || ''),
        教育日期: String(item.date || item['日期'] || item['教育日期'] || ''),
        参与人数: Number(item.participants || item['人数'] || item['参与人数'] || 0),
        地点: String(item.location || item['地点'] || ''),
      };
    });

    setFormattedData(formatted);
  };

  const handleCopy = () => {
    const text = formattedData
      .map((item) => 
        `${item.社区名称}\t${item.教育主题}\t${item.教育内容}\t${item.教育日期}\t${item.参与人数}\t${item.地点}`
      )
      .join('\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    exportToExcel(formattedData, `教育信息_${new Date().toISOString().split('T')[0]}`);
  };

  const handleSaveToSystem = () => {
    formattedData.forEach((item) => {
      const community = communities.find((c) => c.name === item.社区名称);
      if (community) {
        addEducationInfo({
          communityId: community.id,
          title: item.教育主题,
          content: item.教育内容,
          date: item.教育日期,
          participants: item.参与人数,
          location: item.地点,
        });
      }
    });
    alert(`已保存 ${formattedData.length} 条教育信息到系统`);
  };

  const handleClear = () => {
    setInputText('');
    setFormattedData([]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">教育信息处理</h1>
            <p className="text-gray-500 mt-1">对社区教育信息进行格式化处理</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card title="数据输入" action={
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1" />
              上传Excel
            </Button>
          }>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  粘贴文本数据（Tab分隔，每行一条记录）
                </label>
                <textarea
                  rows={12}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="社区名称&#9;教育主题&#9;教育内容&#9;教育日期&#9;参与人数&#9;地点&#10;第一社区&#9;消防安全教育&#9;讲解消防知识&#9;2024-01-15&#9;50&#9;社区活动室"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleTextParse} disabled={!inputText.trim()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  格式化处理
                </Button>
                <Button variant="secondary" onClick={handleClear}>
                  清空
                </Button>
              </div>
            </div>
          </Card>

          <Card title="格式化结果" action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleCopy} disabled={formattedData.length === 0}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? '已复制' : '复制'}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExport} disabled={formattedData.length === 0}>
                <Download className="w-4 h-4 mr-1" />
                导出
              </Button>
            </div>
          }>
            {formattedData.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-500">社区</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">主题</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">内容</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">日期</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">人数</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">地点</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formattedData.map((item, index) => (
                        <tr key={index} className="border-b border-gray-50">
                          <td className="py-2 px-3 text-gray-900">{item.社区名称}</td>
                          <td className="py-2 px-3 text-gray-900">{item.教育主题}</td>
                          <td className="py-2 px-3 text-gray-600 max-w-xs truncate">{item.教育内容}</td>
                          <td className="py-2 px-3 text-gray-600">{item.教育日期}</td>
                          <td className="py-2 px-3 text-gray-600">{item.参与人数}</td>
                          <td className="py-2 px-3 text-gray-600">{item.地点}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-500">共 {formattedData.length} 条记录</span>
                  <Button onClick={handleSaveToSystem}>
                    保存到系统
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <FileText className="w-12 h-12 mb-2 opacity-50" />
                <p>暂无格式化数据</p>
                <p className="text-xs mt-1">请先输入或上传数据</p>
              </div>
            )}
          </Card>
        </div>

        <Card title="使用说明">
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="font-medium text-gray-700">1. 数据输入：</span>
              <span>支持Excel文件上传或直接粘贴Tab分隔的文本数据</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-gray-700">2. 文本格式：</span>
              <span>每行一条记录，列之间用Tab键分隔</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-gray-700">3. 列顺序：</span>
              <span>社区名称、教育主题、教育内容、教育日期、参与人数、地点</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-gray-700">4. 导出功能：</span>
              <span>可将格式化后的数据导出为Excel文件或保存到系统</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
