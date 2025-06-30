import React, { useState } from 'react';
import { Bold, List, Link, Eye, Edit, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../contexts/LanguageContext';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [selectedText, setSelectedText] = useState('');

  // Initialize edit value when switching to edit mode
  const startEditing = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  // Save changes and switch to preview mode
  const saveChanges = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  // Cancel editing and revert changes
  const cancelEditing = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea[data-markdown-editor]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editValue.substring(start, end);
    
    const newText = editValue.substring(0, start) + before + selectedText + after + editValue.substring(end);
    setEditValue(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const text = selectedText || 'Link text';
      insertMarkdown(`[${text}](${url})`);
    }
  };

  const toolbarButtons = [
    {
      icon: Bold,
      title: 'Bold',
      action: () => insertMarkdown('**', '**')
    },
    {
      icon: List,
      title: 'List',
      action: () => insertMarkdown('- ')
    },
    {
      icon: Link,
      title: 'Link',
      action: insertLink
    }
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveChanges();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Preview mode - clickable to edit */}
      {!isEditing && (
        <div
          onClick={startEditing}
          className="min-h-[120px] p-3 cursor-pointer hover:bg-gray-50 transition-colors group"
        >
          {value ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-500 italic">{placeholder || 'Click to add description...'}</p>
          )}
          
          {/* Edit overlay */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 rtl:left-2 rtl:right-auto">
            <div className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-600 flex items-center space-x-1 rtl:space-x-reverse shadow-sm">
              <Edit className="w-3 h-3" />
              <span>{t('markdown.edit')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit mode */}
      {isEditing && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between bg-gray-50 border-b border-gray-300 px-3 py-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {toolbarButtons.map((button, index) => {
                const Icon = button.icon;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={button.action}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title={button.title}
                  >
                    <Icon className="w-4 h-4 text-gray-600" />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={saveChanges}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1 rtl:space-x-reverse"
              >
                <Save className="w-3 h-3" />
                <span>{t('save')}</span>
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="min-h-[120px]">
            <textarea
              data-markdown-editor
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onSelect={(e) => {
                const target = e.target as HTMLTextAreaElement;
                setSelectedText(target.value.substring(target.selectionStart, target.selectionEnd));
              }}
              placeholder={placeholder}
              className="w-full p-3 border-none outline-none resize-none min-h-[120px] focus:ring-0"
              rows={5}
              autoFocus
            />
          </div>

          {/* Help text */}
          <div className="bg-gray-50 border-t border-gray-300 px-3 py-2 text-xs text-gray-600">
            <span>Supports **bold**, - lists, and [links](url). Press Ctrl+Enter to save, Esc to cancel.</span>
          </div>
        </>
      )}
    </div>
  );
}