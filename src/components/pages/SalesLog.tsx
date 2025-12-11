import { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useLanguage } from '../../contexts/LanguageContext';

interface SalesLogEntry {
  _id: string;
  leadId: string;
  leadName: string;
  caretaker: string;
  editTime: string;
  customerRequest: string;
  conclusion: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  createdBy: string;
}

interface SalesLogProps {
  userRole: 'admin' | 'manager' | 'sales';
  currentUserId?: string;
}

export function SalesLog({ userRole, currentUserId }: SalesLogProps) {
  const { t } = useLanguage();
  const [salesLogs, setSalesLogs] = useState<SalesLogEntry[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SalesLogEntry | null>(null);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    fetchSalesLogs();
  }, []);

  const fetchSalesLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sales-logs');
      const data = await response.json();
      if (data.success && data.logs) {
        setSalesLogs(data.logs);
      }
    } catch (err) {
      console.error('Lỗi khi tải nhật ký sales:', err);
      // Demo data for testing
      setSalesLogs([
        {
          _id: '1',
          leadId: 'lead1',
          leadName: 'Nguyễn Văn A',
          caretaker: 'Sales 1',
          editTime: new Date().toISOString(),
          customerRequest: 'Muốn mua laptop Dell giá rẻ',
          conclusion: 'Khách hàng quan tâm, cần follow up',
          status: 'pending',
          createdBy: 'user1',
        },
        {
          _id: '2',
          leadId: 'lead2',
          leadName: 'Trần Thị B',
          caretaker: 'Sales 2',
          editTime: new Date(Date.now() - 86400000).toISOString(),
          customerRequest: 'Cần tư vấn iPhone 15',
          conclusion: 'Đã chốt đơn',
          status: 'approved',
          adminResponse: 'Tốt lắm, tiếp tục phát huy!',
          createdBy: 'user2',
        },
      ]);
    }
  };

  const handleApprove = async (logId: string, approve: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sales-logs/${logId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approve ? 'approved' : 'rejected',
          adminResponse: adminResponse,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(approve ? t('salesLog.approveSuccess') : t('salesLog.rejectSuccess'));
        setShowResponseDialog(false);
        setSelectedLog(null);
        setAdminResponse('');
        fetchSalesLogs();
      }
    } catch (err) {
      console.error('Lỗi:', err);
      // Demo update
      setSalesLogs(prev => prev.map(log => 
        log._id === logId 
          ? { ...log, status: approve ? 'approved' : 'rejected', adminResponse }
          : log
      ));
      alert(approve ? t('salesLog.approveSuccess') : t('salesLog.rejectSuccess'));
      setShowResponseDialog(false);
      setSelectedLog(null);
      setAdminResponse('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('salesLog.pending')}
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('salesLog.approved')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            {t('salesLog.rejected')}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filter logs based on role
  const filteredLogs = salesLogs.filter((log) => {
    // Sales can only see their own logs
    if (userRole === 'sales' && log.createdBy !== currentUserId) {
      return false;
    }

    // Filter by status
    const statusMatch = filterStatus === 'all' || log.status === filterStatus;

    // Filter by search query
    if (!searchQuery.trim()) {
      return statusMatch;
    }

    const query = searchQuery.toLowerCase();
    const searchMatch =
      log.leadName.toLowerCase().includes(query) ||
      log.caretaker.toLowerCase().includes(query) ||
      log.customerRequest.toLowerCase().includes(query) ||
      log.conclusion.toLowerCase().includes(query);

    return statusMatch && searchMatch;
  });

  const canReview = userRole === 'admin' || userRole === 'manager';

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('salesLog.title')}</h1>
            <p className="text-gray-500">{t('salesLog.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">{t('salesLog.totalLogs')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{salesLogs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">{t('salesLog.pending')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {salesLogs.filter((l) => l.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">{t('salesLog.approved')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {salesLogs.filter((l) => l.status === 'approved').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">{t('salesLog.rejected')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {salesLogs.filter((l) => l.status === 'rejected').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('salesLog.title')}</CardTitle>
              <div className="flex items-center gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('common.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="pending">{t('salesLog.pending')}</SelectItem>
                    <SelectItem value="approved">{t('salesLog.approved')}</SelectItem>
                    <SelectItem value="rejected">{t('salesLog.rejected')}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={t('salesLog.searchPlaceholder')}
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('salesLog.noLogs')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('salesLog.customer')}</TableHead>
                    <TableHead>{t('salesLog.caretaker')}</TableHead>
                    <TableHead>{t('salesLog.editTime')}</TableHead>
                    <TableHead>{t('salesLog.customerRequest')}</TableHead>
                    <TableHead>{t('salesLog.conclusion')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('salesLog.adminResponse')}</TableHead>
                    {canReview && <TableHead>{t('common.actions')}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{log.leadName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.caretaker}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(log.editTime).toLocaleString('vi-VN')}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{log.customerRequest}</div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{log.conclusion}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm text-gray-600">
                          {log.adminResponse || '-'}
                        </div>
                      </TableCell>
                      {canReview && (
                        <TableCell>
                          {log.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => {
                                  setSelectedLog(log);
                                  setShowResponseDialog(true);
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {t('salesLog.approve')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedLog(log);
                                  setShowResponseDialog(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                {t('salesLog.reject')}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('salesLog.reviewDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('salesLog.reviewDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-4">
              <div>
                <span className="font-medium">{t('salesLog.reviewCustomer')}:</span> {selectedLog.leadName}
              </div>
              <div>
                <span className="font-medium">{t('salesLog.reviewCaretaker')}:</span> {selectedLog.caretaker}
              </div>
              <div>
                <span className="font-medium">{t('salesLog.reviewRequest')}:</span> {selectedLog.customerRequest}
              </div>
              <div>
                <span className="font-medium">{t('salesLog.reviewConclusion')}:</span> {selectedLog.conclusion}
              </div>
              <div className="grid gap-2">
                <label className="font-medium">{t('salesLog.reviewAdminResponse')}:</label>
                <Input
                  placeholder={t('salesLog.reviewAdminResponsePlaceholder')}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedLog && handleApprove(selectedLog._id, false)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              {t('salesLog.reject')}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedLog && handleApprove(selectedLog._id, true)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {t('salesLog.approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

