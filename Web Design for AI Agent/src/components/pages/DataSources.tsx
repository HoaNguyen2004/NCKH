import { useState } from 'react';
import { Facebook, Instagram, Twitter, Plus, Link, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export function DataSources() {
  const [sources, setSources] = useState([
    {
      id: 1,
      name: 'Facebook Marketplace',
      platform: 'Facebook',
      status: 'connected',
      icon: Facebook,
      postsCollected: 1247,
      lastSync: '2 minutes ago',
      active: true,
      groups: ['Mua bán Laptop HN', 'Điện thoại cũ giá rẻ']
    },
    {
      id: 2,
      name: 'Facebook Groups',
      platform: 'Facebook',
      status: 'connected',
      icon: Facebook,
      postsCollected: 892,
      lastSync: '5 minutes ago',
      active: true,
      groups: ['Chợ Online', 'Mua bán đồ cũ']
    },
    {
      id: 3,
      name: 'Instagram Shopping',
      platform: 'Instagram',
      status: 'error',
      icon: Instagram,
      postsCollected: 0,
      lastSync: 'Never',
      active: false,
      groups: []
    },
    {
      id: 4,
      name: 'Twitter Feed',
      platform: 'Twitter',
      status: 'disconnected',
      icon: Twitter,
      postsCollected: 0,
      lastSync: 'Never',
      active: false,
      groups: []
    }
  ]);

  const [newGroupUrl, setNewGroupUrl] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const toggleSource = (id: number) => {
    setSources(sources.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'disconnected':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'connected' ? (
      <CheckCircle2 className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Data Sources</h1>
            <p className="text-gray-500">Manage social media connections and data collection</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Source
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Data Source</DialogTitle>
                <DialogDescription>
                  Connect a new social media platform or group to collect posts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Platform</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <Button variant="outline" className="flex-col h-auto py-4">
                      <Facebook className="w-6 h-6 mb-2 text-blue-600" />
                      Facebook
                    </Button>
                    <Button variant="outline" className="flex-col h-auto py-4">
                      <Instagram className="w-6 h-6 mb-2 text-pink-600" />
                      Instagram
                    </Button>
                    <Button variant="outline" className="flex-col h-auto py-4">
                      <Twitter className="w-6 h-6 mb-2 text-blue-400" />
                      Twitter
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Group/Page URL</Label>
                  <Input
                    placeholder="https://facebook.com/groups/..."
                    value={newGroupUrl}
                    onChange={(e) => setNewGroupUrl(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button className="w-full" onClick={() => setOpenDialog(false)}>
                  <Link className="w-4 h-4 mr-2" />
                  Connect Source
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Connected Sources */}
          <div className="col-span-2 space-y-4">
            {sources.map((source) => {
              const Icon = source.icon;
              return (
                <Card key={source.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                          <CardTitle>{source.name}</CardTitle>
                          <CardDescription>
                            {source.postsCollected.toLocaleString()} posts collected
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(source.status)}>
                          {source.status}
                        </Badge>
                        <Switch
                          checked={source.active}
                          onCheckedChange={() => toggleSource(source.id)}
                          disabled={source.status !== 'connected'}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        {getStatusIcon(source.status)}
                        <span className="text-sm">Last sync: {source.lastSync}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Sync Now
                      </Button>
                    </div>
                    
                    {source.groups.length > 0 && (
                      <div>
                        <div className="text-gray-700 text-sm mb-2">Connected Groups:</div>
                        <div className="flex flex-wrap gap-2">
                          {source.groups.map((group, idx) => (
                            <Badge key={idx} variant="secondary">
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Statistics */}
          <div className="col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 text-sm mb-1">Total Sources</div>
                  <div className="text-blue-900 text-2xl">{sources.length}</div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-green-600 text-sm mb-1">Active Sources</div>
                  <div className="text-green-900 text-2xl">
                    {sources.filter(s => s.active).length}
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-purple-600 text-sm mb-1">Total Posts</div>
                  <div className="text-purple-900 text-2xl">
                    {sources.reduce((acc, s) => acc + s.postsCollected, 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-orange-600 text-sm mb-1">Posts Today</div>
                  <div className="text-orange-900 text-2xl">247</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Facebook API</span>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Instagram API</span>
                  <Badge className="bg-red-100 text-red-700">Error</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Twitter API</span>
                  <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
