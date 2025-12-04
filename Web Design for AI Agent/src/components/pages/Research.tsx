import { BookOpen, Download, Play, FileText, Code, BarChart, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';

export function Research() {
  const tutorials = [
    {
      title: 'Giới thiệu về NLP trong phân tích mạng xã hội',
      description: 'Tìm hiểu cách AI phân loại nhu cầu mua bán từ text',
      duration: '15 phút',
      level: 'Cơ bản'
    },
    {
      title: 'Huấn luyện model phân loại text',
      description: 'Hướng dẫn fine-tune model cho dữ liệu riêng',
      duration: '30 phút',
      level: 'Nâng cao'
    },
    {
      title: 'Tối ưu độ chính xác của AI',
      description: 'Kỹ thuật cải thiện accuracy và F1-score',
      duration: '25 phút',
      level: 'Nâng cao'
    },
  ];

  const datasets = [
    {
      name: 'Vietnamese E-commerce Posts',
      description: '10,000 bài đăng mua bán đã được gán nhãn',
      size: '2.5 MB',
      format: 'CSV'
    },
    {
      name: 'Product Price Dataset',
      description: 'Dữ liệu giá sản phẩm từ các nền tảng',
      size: '1.8 MB',
      format: 'JSON'
    },
    {
      name: 'Social Media Conversations',
      description: 'Mẫu cuộc hội thoại mua bán trên mạng xã hội',
      size: '3.2 MB',
      format: 'TXT'
    },
  ];

  const experiments = [
    {
      id: 'exp001',
      name: 'BERT vs PhoBERT Comparison',
      description: 'So sánh hiệu suất giữa BERT và PhoBERT trên dữ liệu tiếng Việt',
      status: 'completed',
      accuracy: '94.2%'
    },
    {
      id: 'exp002',
      name: 'Price Extraction Accuracy',
      description: 'Đánh giá độ chính xác của thuật toán trích xuất giá',
      status: 'running',
      accuracy: '91.8%'
    },
    {
      id: 'exp003',
      name: 'Multi-label Classification',
      description: 'Phân loại đồng thời nhiều thuộc tính sản phẩm',
      status: 'pending',
      accuracy: '-'
    },
  ];

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Nghiên cứu & Học tập</h1>
            <p className="text-gray-500">Tài liệu, datasets và thí nghiệm AI/NLP</p>
          </div>
        </div>
      </header>

      <div className="p-8">
        <Tabs defaultValue="tutorials" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tutorials">
              <BookOpen className="w-4 h-4 mr-2" />
              Hướng dẫn
            </TabsTrigger>
            <TabsTrigger value="datasets">
              <FileText className="w-4 h-4 mr-2" />
              Datasets
            </TabsTrigger>
            <TabsTrigger value="experiments">
              <BarChart className="w-4 h-4 mr-2" />
              Thí nghiệm
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="w-4 h-4 mr-2" />
              Mã nguồn
            </TabsTrigger>
          </TabsList>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials">
            <div className="grid grid-cols-2 gap-6">
              {tutorials.map((tutorial, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle>{tutorial.title}</CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>⏱️ {tutorial.duration}</span>
                        <span>📊 {tutorial.level}</span>
                      </div>
                      <Button>
                        <Play className="w-4 h-4 mr-2" />
                        Bắt đầu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tài liệu tham khảo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="text-gray-900">NLP for Social Commerce - Research Paper</div>
                      <div className="text-sm text-gray-500">Bài báo khoa học về ứng dụng NLP trong thương mại xã hội</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Tải về
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="text-gray-900">API Documentation</div>
                      <div className="text-sm text-gray-500">Tài liệu API đầy đủ cho developers</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Tải về
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Datasets Tab */}
          <TabsContent value="datasets">
            <div className="grid grid-cols-2 gap-6">
              {datasets.map((dataset, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle>{dataset.name}</CardTitle>
                    <CardDescription>{dataset.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📁 {dataset.size}</span>
                        <span>📄 {dataset.format}</span>
                      </div>
                      <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Tải về
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Hướng dẫn sử dụng Dataset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-600">
                    Datasets được cung cấp để hỗ trợ nghiên cứu và phát triển các mô hình AI/NLP. 
                    Tất cả dữ liệu đã được làm sạch và gán nhãn bởi chuyên gia.
                  </p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-gray-900 mb-2">Lưu ý quan trọng:</div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Dữ liệu chỉ được sử dụng cho mục đích nghiên cứu và học tập</li>
                      <li>• Không chia sẻ hoặc phân phối lại datasets</li>
                      <li>• Trích dẫn nguồn khi sử dụng trong nghiên cứu</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments">
            <div className="space-y-4">
              {experiments.map((exp) => (
                <Card key={exp.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{exp.name}</CardTitle>
                        <CardDescription>{exp.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Accuracy</div>
                        <div className="text-2xl text-gray-900">{exp.accuracy}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Experiment ID: {exp.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          exp.status === 'completed' ? 'bg-green-100 text-green-700' :
                          exp.status === 'running' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {exp.status === 'completed' ? 'Hoàn thành' :
                           exp.status === 'running' ? 'Đang chạy' :
                           'Chờ xử lý'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Xem chi tiết</Button>
                        {exp.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Kết quả
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tạo thí nghiệm mới</CardTitle>
                <CardDescription>Thiết lập và chạy thí nghiệm AI của riêng bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo thí nghiệm
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mã nguồn mẫu</CardTitle>
                  <CardDescription>Code examples và snippets hữu ích</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-900 rounded-lg">
                      <div className="text-gray-400 text-sm mb-2"># Python - Phân tích bài đăng với NLP</div>
                      <pre className="text-green-400 text-sm">
{`from ai_filter import PostAnalyzer

analyzer = PostAnalyzer()
result = analyzer.analyze(
    text="Cần mua laptop Dell giá 7-10tr",
    platform="facebook"
)

print(result)  # {'type': 'buying', 'confidence': 0.92}`}
                      </pre>
                    </div>

                    <div className="p-4 bg-gray-900 rounded-lg">
                      <div className="text-gray-400 text-sm mb-2"># JavaScript - Gọi API phân tích</div>
                      <pre className="text-blue-400 text-sm">
{`const response = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({
    content: "Bán iPhone 12 Pro giá 15tr",
    platform: "facebook"
  })
});

const data = await response.json();
console.log(data);`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Repository GitHub</CardTitle>
                  <CardDescription>Mã nguồn đầy đủ và examples</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Code className="w-4 h-4 mr-2" />
                    Xem trên GitHub
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}