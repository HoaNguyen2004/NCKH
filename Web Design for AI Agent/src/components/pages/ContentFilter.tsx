import { useState } from 'react';
import { Search, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface ContentFilterProps {
  posts: any[];
}

export function ContentFilter({ posts }: ContentFilterProps) {
  const [filters, setFilters] = useState([
    { id: 1, name: 'Electronics', minPrice: 1000000, maxPrice: 20000000, locations: ['Hà Nội', 'TP.HCM'], active: true },
    { id: 2, name: 'Laptop', minPrice: 5000000, maxPrice: 30000000, locations: ['Hà Nội'], active: true },
    { id: 3, name: 'Phone', minPrice: 2000000, maxPrice: 15000000, locations: ['TP.HCM', 'Đà Nẵng'], active: false },
  ]);

  const [newFilter, setNewFilter] = useState({
    name: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });

  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const addLocation = (location: string) => {
    if (location && !selectedLocations.includes(location)) {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const removeLocation = (location: string) => {
    setSelectedLocations(selectedLocations.filter(l => l !== location));
  };

  const handleSaveFilter = () => {
    if (newFilter.name && selectedLocations.length > 0) {
      const filter = {
        id: Date.now(),
        name: newFilter.name,
        minPrice: parseInt(newFilter.minPrice) || 0,
        maxPrice: parseInt(newFilter.maxPrice) || 999999999,
        locations: [...selectedLocations],
        active: true
      };
      setFilters([...filters, filter]);
      setNewFilter({ name: '', minPrice: '', maxPrice: '', location: '' });
      setSelectedLocations([]);
    }
  };

  const toggleFilter = (id: number) => {
    setFilters(filters.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  const deleteFilter = (id: number) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Content Filter Configuration</h1>
            <p className="text-gray-500">Configure filters for product categories, price ranges, and locations</p>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Create New Filter */}
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Create New Filter</CardTitle>
                <CardDescription>Set up product filters for automatic detection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Product Category</Label>
                  <Input
                    placeholder="e.g., Laptop, Phone, Furniture"
                    value={newFilter.name}
                    onChange={(e) => setNewFilter({ ...newFilter, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Price (VNĐ)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newFilter.minPrice}
                      onChange={(e) => setNewFilter({ ...newFilter, minPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Max Price (VNĐ)</Label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={newFilter.maxPrice}
                      onChange={(e) => setNewFilter({ ...newFilter, maxPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Locations</Label>
                  <div className="flex gap-2 mb-2">
                    <Select value={newFilter.location} onValueChange={(value) => {
                      setNewFilter({ ...newFilter, location: value });
                      addLocation(value);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                        <SelectItem value="TP.HCM">TP. Hồ Chí Minh</SelectItem>
                        <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                        <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                        <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocations.map((loc) => (
                      <Badge key={loc} variant="secondary">
                        {loc}
                        <button
                          onClick={() => removeLocation(loc)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSaveFilter} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Filter
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Active Filters */}
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Filters</CardTitle>
                <CardDescription>Manage your product filters and detection rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filters.map((filter) => (
                    <div key={filter.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={filter.active}
                            onCheckedChange={() => toggleFilter(filter.id)}
                          />
                          <div>
                            <div className="text-gray-900">{filter.name}</div>
                            <div className="text-gray-500 text-sm">
                              {filter.minPrice.toLocaleString()} - {filter.maxPrice.toLocaleString()} VNĐ
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFilter(filter.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filter.locations.map((loc) => (
                          <Badge key={loc} variant="outline">
                            {loc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filter Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Filter Performance</CardTitle>
                <CardDescription>Statistics for your active filters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-sm mb-1">Total Matches</div>
                    <div className="text-gray-900 text-2xl">{posts.length}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-sm mb-1">Active Filters</div>
                    <div className="text-gray-900 text-2xl">{filters.filter(f => f.active).length}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-sm mb-1">Avg. Confidence</div>
                    <div className="text-gray-900 text-2xl">92%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
