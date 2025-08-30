import React from 'react';
import Button from '@/components/common/Button';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ContentModal: React.FC<ContentModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-primary-900">{title}</h2>
          <button onClick={onClose} className="text-2xl text-primary-400 hover:text-primary-600">×</button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default ContentModal;