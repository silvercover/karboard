import React from 'react';
import { Calendar, Edit, Trash2, Clock, CheckSquare, Paperclip, MessageCircle } from 'lucide-react';
import { Card } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatJalaliDate } from '../utils/jalali';

interface CardComponentProps {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  isDragging: boolean;
  searchTerm: string;
}

export function CardComponent({ card, onEdit, onDelete, onClick, isDragging, searchTerm }: CardComponentProps) {
  const { t, language } = useLanguage();

  const getDueDateStatus = () => {
    if (!card.dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(card.dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: t('overdue'), color: 'text-red-600 bg-red-50 border-red-200' };
    if (diffDays === 0) return { text: t('today'), color: 'text-orange-600 bg-orange-50 border-orange-200' };
    if (diffDays === 1) return { text: t('tomorrow'), color: 'text-blue-600 bg-blue-50 border-blue-200' };
    return null;
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const dueDateStatus = getDueDateStatus();
  const completedItems = card.checklist.filter(item => item.completed).length;
  const checklistProgress = card.checklist.length > 0 ? (completedItems / card.checklist.length) * 100 : 0;

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group ${
        isDragging ? 'rotate-2 scale-105 shadow-lg' : ''
      }`}
      draggable
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-800 leading-tight flex-1 cursor-pointer">
          {highlightText(card.title, searchTerm)}
        </h3>
        <div className="flex items-center space-x-1 rtl:space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity ml-2 rtl:mr-2 rtl:ml-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.labels.slice(0, 3).map((label, index) => (
            <div
              key={index}
              className={`w-8 h-2 rounded-full ${label}`}
            />
          ))}
          {card.labels.length > 3 && (
            <div className="text-xs text-gray-500">+{card.labels.length - 3}</div>
          )}
        </div>
      )}

      {/* Checklist */}
      {card.checklist.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-600">
              {completedItems}/{card.checklist.length}
            </span>
            {checklistProgress === 100 && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
          
          {checklistProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  checklistProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Bottom row with icons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {card.attachments.length > 0 && (
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Paperclip className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">
                {card.attachments.length}
              </span>
            </div>
          )}

          {card.comments.length > 0 && (
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">
                {card.comments.length}
              </span>
            </div>
          )}
        </div>

        {card.dueDate && (
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {dueDateStatus ? (
              <div className={`flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded-full text-xs border ${dueDateStatus.color}`}>
                <Clock className="w-3 h-3" />
                <span>{dueDateStatus.text}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 rtl:space-x-reverse text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatJalaliDate(card.dueDate, language.code)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}