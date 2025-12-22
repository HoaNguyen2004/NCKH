import { useState } from 'react';
import { Brain, CheckCircle2, Settings2, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function AISettings() {
  const [confidenceThreshold, setConfidenceThreshold] = useState([75]);
  const [enableNLP, setEnableNLP] = useState(true);
  const [enableOCR, setEnableOCR] = useState(true);
  const [enableSpamDetection, setEnableSpamDetection] = useState(true);
  const [modelVersion, setModelVersion] = useState('v2.1');

  const aiModels = [
    {
      name: 'NLP Text Classifier',
      description: 'Classifies posts as buying or selling requests',
      status: 'active',
      accuracy: '94.2%',
      enabled: enableNLP,
      toggle: setEnableNLP
    },
    {
      name: 'OCR Image Reader',
      description: 'Extracts text from images in posts',
      status: 'active',
      accuracy: '89.7%',
      enabled: enableOCR,
      toggle: setEnableOCR
    },
    {
      name: 'Spam Detector',
      description: 'Filters out spam and fraudulent posts',
      status: 'active',
      accuracy: '96.5%',
      enabled: enableSpamDetection,
      toggle: setEnableSpamDetection
    },
    {
      name: 'Price Extractor',
      description: 'Identifies and extracts price information',
      status: 'active',
      accuracy: '91.3%',
      enabled: true,
      toggle: () => {}
    }
  ];

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">AI Settings</h1>
            <p className="text-gray-500">Configure AI models and analysis parameters</p>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Model Configuration */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Configuration</CardTitle>
                <CardDescription>Manage AI modules and their settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {aiModels.map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-gray-900 flex items-center gap-2">
                          {model.name}
                          {model.status === 'active' && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="text-gray-500 text-sm">{model.description}</div>
                        <div className="text-gray-600 text-sm mt-1">Accuracy: {model.accuracy}</div>
                      </div>
                    </div>
                    <Switch
                      checked={model.enabled}
                      onCheckedChange={model.toggle}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Fine-tune AI analysis parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Confidence Threshold</Label>
                    <span className="text-gray-900">{confidenceThreshold[0]}%</span>
                  </div>
                  <Slider
                    value={confidenceThreshold}
                    onValueChange={setConfidenceThreshold}
                    min={50}
                    max={100}
                    step={5}
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    Only show results with confidence level above this threshold
                  </p>
                </div>

                <div>
                  <Label>Model Version</Label>
                  <Select value={modelVersion} onValueChange={setModelVersion}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1.8">v1.8 (Stable)</SelectItem>
                      <SelectItem value="v2.0">v2.0 (Production)</SelectItem>
                      <SelectItem value="v2.1">v2.1 (Latest)</SelectItem>
                      <SelectItem value="v2.2-beta">v2.2 (Beta)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-gray-500 text-sm mt-2">
                    Select the AI model version to use for analysis
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1">
                    <Settings2 className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button variant="outline">
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Model Performance */}
          <div className="col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>Real-time performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-green-600 text-sm mb-1">Overall Accuracy</div>
                  <div className="text-green-900 text-2xl">93.8%</div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 text-sm mb-1">Processing Speed</div>
                  <div className="text-blue-900 text-2xl">245ms</div>
                  <div className="text-blue-600 text-sm">avg. per post</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-purple-600 text-sm mb-1">Active Models</div>
                  <div className="text-purple-900 text-2xl">
                    {aiModels.filter(m => m.enabled).length}/{aiModels.length}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Test Model
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Calibrate Models
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  View Training Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
