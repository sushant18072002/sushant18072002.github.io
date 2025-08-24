import React, { useState } from 'react';
import Button from '@/components/common/Button';

interface CalendarDay {
  date: Date;
  available: boolean;
  price?: number;
  maxBookings?: number;
  currentBookings: number;
}

interface AvailabilityCalendarProps {
  packageId: string;
  basePrice: number;
  onSave: (availability: any) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ 
  packageId, 
  basePrice, 
  onSave 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [bulkSettings, setBulkSettings] = useState({
    available: true,
    price: basePrice,
    maxBookings: 10
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date) return false;
    return selectedDates.some(selectedDate => 
      selectedDate.toDateString() === date.toDateString()
    );
  };

  const toggleDateSelection = (date: Date | null) => {
    if (!date) return;
    
    if (isDateSelected(date)) {
      setSelectedDates(selectedDates.filter(selectedDate => 
        selectedDate.toDateString() !== date.toDateString()
      ));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const applyBulkSettings = () => {
    if (selectedDates.length === 0) {
      alert('Please select dates first');
      return;
    }

    const availability = selectedDates.map(date => ({
      date,
      available: bulkSettings.available,
      price: bulkSettings.price,
      maxBookings: bulkSettings.maxBookings,
      currentBookings: 0
    }));

    onSave({ calendar: availability });
    setSelectedDates([]);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Availability Calendar</h3>
        <p className="text-primary-600 mb-4">
          Select dates and set availability, pricing, and booking limits
        </p>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigateMonth('prev')}>
          ← Previous
        </Button>
        <h4 className="text-xl font-semibold text-primary-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <Button variant="outline" onClick={() => navigateMonth('next')}>
          Next →
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-primary-200 rounded-lg p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-primary-600 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center text-sm cursor-pointer rounded transition-colors ${
                !date 
                  ? 'invisible' 
                  : isDateSelected(date)
                    ? 'bg-blue-ocean text-white'
                    : date < new Date()
                      ? 'text-primary-300 cursor-not-allowed'
                      : 'hover:bg-primary-100 text-primary-700'
              }`}
              onClick={() => date && date >= new Date() && toggleDateSelection(date)}
            >
              {date?.getDate()}
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Settings */}
      {selectedDates.length > 0 && (
        <div className="bg-primary-50 p-4 rounded-lg">
          <h4 className="font-semibold text-primary-900 mb-4">
            Apply Settings to {selectedDates.length} Selected Date{selectedDates.length > 1 ? 's' : ''}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Availability</label>
              <select
                value={bulkSettings.available.toString()}
                onChange={(e) => setBulkSettings({...bulkSettings, available: e.target.value === 'true'})}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Price per Person</label>
              <input
                type="number"
                value={bulkSettings.price}
                onChange={(e) => setBulkSettings({...bulkSettings, price: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Max Bookings</label>
              <input
                type="number"
                value={bulkSettings.maxBookings}
                onChange={(e) => setBulkSettings({...bulkSettings, maxBookings: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                min="1"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={applyBulkSettings}>
              Apply to Selected Dates
            </Button>
            <Button variant="outline" onClick={() => setSelectedDates([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => {
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const daysInNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
            const allDatesNextMonth = Array.from({length: daysInNextMonth}, (_, i) => 
              new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i + 1)
            );
            setSelectedDates(allDatesNextMonth);
          }}
        >
          Select Next Month
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            const today = new Date();
            const next30Days = Array.from({length: 30}, (_, i) => {
              const date = new Date(today);
              date.setDate(date.getDate() + i + 1);
              return date;
            });
            setSelectedDates(next30Days);
          }}
        >
          Select Next 30 Days
        </Button>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;