import React, { useState } from 'react';
import { Plus, Check, X, Trash2 } from 'lucide-react';
import { ChecklistItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { v4 as uuidv4 } from 'uuid';

interface ChecklistProps {
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
}

export function Checklist({ items, onItemsChange }: ChecklistProps) {
  const { t } = useLanguage();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const addItem = () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: uuidv4(),
      text: newItemText.trim(),
      completed: false
    };

    onItemsChange([...items, newItem]);
    setNewItemText('');
    setIsAddingItem(false);
  };

  const toggleItem = (itemId: string) => {
    onItemsChange(
      items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    onItemsChange(items.filter(item => item.id !== itemId));
  };

  const updateItemText = (itemId: string, text: string) => {
    onItemsChange(
      items.map(item =>
        item.id === itemId ? { ...item, text } : item
      )
    );
  };

  const completedCount = items.filter(item => item.completed).length;
  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{completedCount}/{items.length} {t('checklist.completed')}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <ChecklistItemComponent
            key={item.id}
            item={item}
            onToggle={() => toggleItem(item.id)}
            onRemove={() => removeItem(item.id)}
            onUpdateText={(text) => updateItemText(item.id, text)}
          />
        ))}
      </div>

      {isAddingItem ? (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <input
            type="text"
            placeholder={t('checklist.item.placeholder')}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addItem();
              if (e.key === 'Escape') {
                setIsAddingItem(false);
                setNewItemText('');
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            autoFocus
          />
          <button
            onClick={addItem}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsAddingItem(false);
              setNewItemText('');
            }}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingItem(true)}
          className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors w-full text-left rtl:text-right"
        >
          <Plus className="w-4 h-4" />
          <span>{t('checklist.add.item')}</span>
        </button>
      )}
    </div>
  );
}

interface ChecklistItemComponentProps {
  item: ChecklistItem;
  onToggle: () => void;
  onRemove: () => void;
  onUpdateText: (text: string) => void;
}

function ChecklistItemComponent({ item, onToggle, onRemove, onUpdateText }: ChecklistItemComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdateText(editText.trim());
    } else {
      setEditText(item.text);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center space-x-3 rtl:space-x-reverse group">
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          item.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {item.completed && <Check className="w-3 h-3" />}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setEditText(item.text);
              setIsEditing(false);
            }
          }}
          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          autoFocus
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={`flex-1 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors ${
            item.completed ? 'line-through text-gray-500' : 'text-gray-800'
          }`}
        >
          {item.text}
        </span>
      )}

      <button
        onClick={onRemove}
        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 rounded transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}