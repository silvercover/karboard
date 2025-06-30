import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, Tag, Clock, CheckSquare, Paperclip, MessageCircle, Save, AlertCircle } from 'lucide-react';
import { Card } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatJalaliDate } from '../utils/jalali';
import { JalaliDatePickerWrapper } from './JalaliDatePickerWrapper';
import { Checklist } from './Checklist';
import { FileUpload } from './FileUpload';
import { MarkdownEditor } from './MarkdownEditor';
import { Comments } from './Comments';
import { saveDraft, loadDraft, clearDraft, hasDraft } from '../utils/draftStorage';

interface CardModalProps {
  card?: Card;
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function CardModal({ card, isOpen, onClose, onSave }: CardModalProps) {
  const { t, language } = useLanguage();
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(card?.dueDate);
  const [labels, setLabels] = useState<string[]>(card?.labels || []);
  const [checklist, setChecklist] = useState(card?.checklist || []);
  const [attachments, setAttachments] = useState(card?.attachments || []);
  const [comments, setComments] = useState(card?.comments || []);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDraftNotice, setShowDraftNotice] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const draftTimeoutRef = useRef<NodeJS.Timeout>();
  
  const cardId = card?.id || 'new-card';

  const labelColors = [
    'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-500'
  ];

  // Load initial data and check for drafts
  useEffect(() => {
    if (isOpen) {
      if (card) {
        // Editing existing card
        setTitle(card.title);
        setDescription(card.description || '');
        setDueDate(card.dueDate);
        setLabels(card.labels);
        setChecklist(card.checklist);
        setAttachments(card.attachments);
        setComments(card.comments);
        
        // Check for draft
        const draft = loadDraft(cardId);
        if (draft) {
          setShowDraftNotice(true);
        }
      } else {
        // Creating new card
        setTitle('');
        setDescription('');
        setDueDate(undefined);
        setLabels([]);
        setChecklist([]);
        setAttachments([]);
        setComments([]);
        
        // Check for draft for new cards
        const draft = loadDraft(cardId);
        if (draft) {
          setTitle(draft.title || '');
          setDescription(draft.description || '');
          setDueDate(draft.dueDate);
          setLabels(draft.labels || []);
          setChecklist(draft.checklist || []);
          setAttachments(draft.attachments || []);
          setComments(draft.comments || []);
          setShowDraftNotice(true);
        }
      }
      setHasUnsavedChanges(false);
    }
  }, [card, isOpen, cardId]);

  // Save draft when content changes
  const saveDraftData = () => {
    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current);
    }

    draftTimeoutRef.current = setTimeout(() => {
      const draftData = {
        title,
        description,
        dueDate,
        labels,
        checklist,
        attachments,
        comments
      };
      
      // Only save draft if there's meaningful content
      if (title.trim() || description.trim() || labels.length > 0 || checklist.length > 0 || attachments.length > 0) {
        saveDraft(cardId, draftData);
      }
    }, 1000); // Save draft after 1 second of inactivity
  };

  // Track changes for unsaved indicator
  useEffect(() => {
    if (isOpen) {
      const hasChanges = card ? (
        title !== card.title ||
        description !== (card.description || '') ||
        dueDate?.getTime() !== card.dueDate?.getTime() ||
        JSON.stringify(labels) !== JSON.stringify(card.labels) ||
        JSON.stringify(checklist) !== JSON.stringify(card.checklist) ||
        JSON.stringify(attachments) !== JSON.stringify(card.attachments) ||
        JSON.stringify(comments) !== JSON.stringify(card.comments)
      ) : (
        title.trim() !== '' ||
        description.trim() !== '' ||
        dueDate !== undefined ||
        labels.length > 0 ||
        checklist.length > 0 ||
        attachments.length > 0 ||
        comments.length > 0
      );
      
      setHasUnsavedChanges(hasChanges);
      
      // Save draft when there are changes
      if (hasChanges) {
        saveDraftData();
      }
    }
  }, [title, description, dueDate, labels, checklist, attachments, comments, card, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      
      // Don't close modal if clicking on date picker elements
      if (target.closest('.jdp-container') || target.closest('[data-jdp]')) {
        return;
      }
      
      if (modalRef.current && !modalRef.current.contains(target)) {
        handleClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    
    const cardData = {
      title: title.trim(),
      description: description.trim(),
      dueDate,
      labels,
      checklist,
      attachments,
      comments
    };

    onSave(cardData);
    
    // Clear draft after successful save
    clearDraft(cardId);
    setHasUnsavedChanges(false);
    setShowDraftNotice(false);
    onClose();
  };

  const handleClose = () => {
    // If there are unsaved changes, save as draft
    if (hasUnsavedChanges) {
      saveDraftData();
    }
    onClose();
  };

  const loadDraftData = () => {
    const draft = loadDraft(cardId);
    if (draft) {
      setTitle(draft.title || '');
      setDescription(draft.description || '');
      setDueDate(draft.dueDate);
      setLabels(draft.labels || []);
      setChecklist(draft.checklist || []);
      setAttachments(draft.attachments || []);
      setComments(draft.comments || []);
      setShowDraftNotice(false);
    }
  };

  const discardDraft = () => {
    clearDraft(cardId);
    setShowDraftNotice(false);
    
    // Reset to original values
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setDueDate(card.dueDate);
      setLabels(card.labels);
      setChecklist(card.checklist);
      setAttachments(card.attachments);
      setComments(card.comments);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(undefined);
      setLabels([]);
      setChecklist([]);
      setAttachments([]);
      setComments([]);
    }
  };

  const toggleLabel = (color: string) => {
    setLabels(prev => 
      prev.includes(color) 
        ? prev.filter(l => l !== color)
        : [...prev, color]
    );
  };

  const removeDueDate = () => {
    setDueDate(undefined);
  };

  const getDueDateStatus = () => {
    if (!dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: t('overdue'), color: 'text-red-600 bg-red-50' };
    if (diffDays === 0) return { text: t('today'), color: 'text-orange-600 bg-orange-50' };
    if (diffDays === 1) return { text: t('tomorrow'), color: 'text-blue-600 bg-blue-50' };
    return null;
  };

  const dueDateStatus = getDueDateStatus();
  const completedItems = checklist.filter(item => item.completed).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col mx-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <h2 className="text-xl font-semibold text-gray-800">
              {card ? t('card.edit') : t('card.add')}
            </h2>
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Draft notice */}
        {showDraftNotice && (
          <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  You have unsaved changes from a previous session.
                </span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={loadDraftData}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Restore
                </button>
                <button
                  onClick={discardDraft}
                  className="px-3 py-1 text-blue-600 hover:text-blue-700 rounded text-sm transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Main content - 75% */}
            <div className="flex-1 p-6 space-y-6" style={{ width: '75%' }}>
              <div>
                <input
                  type="text"
                  placeholder={t('card.title.placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-lg font-medium border-none outline-none resize-none bg-gray-50 rounded-lg p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  autoFocus
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('card.description.placeholder')}
                </label>
                <MarkdownEditor
                  value={description}
                  onChange={setDescription}
                  placeholder={t('card.description.placeholder')}
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                  <CheckSquare className="w-4 h-4" />
                  <span className="font-medium">{t('card.checklist')}</span>
                  {checklist.length > 0 && (
                    <span className="text-sm text-gray-500">
                      ({completedItems}/{checklist.length})
                    </span>
                  )}
                </div>
                <Checklist items={checklist} onItemsChange={setChecklist} />
              </div>

              <Comments comments={comments} onCommentsChange={setComments} />
            </div>

            {/* Sidebar - 25% */}
            <div className="border-l border-gray-200 p-6 space-y-6" style={{ width: '25%' }}>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDatePicker(!showDatePicker);
                  }}
                  className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 w-full"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{t('card.due.date')}</span>
                </button>
                
                {dueDate && (
                  <div className="mt-2 space-y-2">
                    <div className="text-sm text-gray-600">
                      {formatJalaliDate(dueDate, language.code)}
                    </div>
                    <button
                      onClick={removeDueDate}
                      className="text-xs text-red-600 hover:text-red-700 transition-colors"
                    >
                      {t('card.due.remove')}
                    </button>
                  </div>
                )}
                
                {showDatePicker && (
                  <JalaliDatePickerWrapper
                    value={dueDate}
                    onChange={(date) => {
                      setDueDate(date);
                      setShowDatePicker(false);
                    }}
                    onClose={() => setShowDatePicker(false)}
                  />
                )}

                {dueDate && dueDateStatus && (
                  <div className={`flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-full text-sm mt-2 ${dueDateStatus.color}`}>
                    <Clock className="w-3 h-3" />
                    <span>{dueDateStatus.text}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium text-sm">{t('card.labels')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {labelColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleLabel(color)}
                      className={`h-6 rounded-md ${color} ${
                        labels.includes(color) 
                          ? 'ring-2 ring-offset-2 ring-blue-500' 
                          : 'opacity-70 hover:opacity-100'
                      } transition-all duration-200 w-full`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                  <Paperclip className="w-4 h-4" />
                  <span className="font-medium text-sm">{t('card.attachments')}</span>
                  {attachments.length > 0 && (
                    <span className="text-sm text-gray-500">
                      ({attachments.length})
                    </span>
                  )}
                </div>
                <FileUpload attachments={attachments} onAttachmentsChange={setAttachments} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with save button */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {hasUnsavedChanges && "Changes will be saved as draft when you close this modal"}
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {t('card.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Save className="w-4 h-4" />
              <span>{t('card.save')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}