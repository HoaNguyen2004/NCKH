import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Calendar as CalendarComponent } from '../ui/calendar';

interface DateRangeDialogProps {
  onApply: (startDate: Date, endDate: Date) => void;
}

export function DateRangeDialog({ onApply }: DateRangeDialogProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Chọn ngày
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chọn khoảng thời gian</DialogTitle>
          <DialogDescription>
            Chọn ngày bắt đầu và ngày kết thúc để xem báo cáo
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          <div>
            <Label className="mb-2 block">Từ ngày</Label>
            <CalendarComponent
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              className="border rounded-lg"
            />
          </div>
          <div>
            <Label className="mb-2 block">Đến ngày</Label>
            <CalendarComponent
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              className="border rounded-lg"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleApply}>
            Áp dụng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}