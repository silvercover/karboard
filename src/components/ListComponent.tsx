import React, { useState } from 'react';
import { Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { List, Card } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { CardComponent } from './CardComponent';
import { CardModal } from './CardModal';
import { ConfirmDialog } from './ConfirmDialog';

interface ListComponentProps {
  list: List;
  onAddCard: (listId: string, card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditCard: (listId: string, cardId: string, card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
  onDeleteList: (listId: string) => void;
  onUpdateList: (listId: string, title: string) => void;
  searchTerm: string;
  onDragStart: (cardId: string, listId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetListId: string) => void;
  onCardDragOver: (e: React.DragEvent, targetCardId: string, targetListId: string) => void;
  onCardDrop: (e: React.DragEvent, targetCardId: string, targetListId: string) => void;
  draggedCard: { cardId: string; listId: string } | null;
  dragOverCard: { cardId: string; listId: string; position: 'before' | 'after' } | null;
  canCreateTasks: boolean;
  canDeleteTasks: boolean;
}

export function ListComponent({
  list,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onDeleteList,
  onUpdateList,
  searchTerm,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onCardDragOver,
  onCardDrop,
  draggedCard,
  dragOverCard,
  canCreateTasks,
  canDeleteTasks
}: ListComponentProps) {
  const { t } = useLanguage();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const filteredCards = list.cards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleTitleSubmit = () => {
    if (title.trim() && title.trim() !== list.title) {
      onUpdateList(list.id, title.trim());
    } else {
      setTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  const handleAddCard = () => {
    if (!canCreateTasks) return;
    setEditingCard(null);
    setShowCardModal(true);
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setShowCardModal(true);
  };

  const handleCardClick = (card: Card) => {
    setEditingCard(card);
    setShowCardModal(true);
  };

  const handleDeleteCard = (cardId: string) => {
    if (!canDeleteTasks) return;
    setCardToDelete(cardId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCard = () => {
    if (cardToDelete) {
      onDeleteCard(list.id, cardToDelete);
      setCardToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const handleSaveCard = (cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCard) {
      // Editing existing card
      onEditCard(list.id, editingCard.id, cardData);
    } else {
      // Creating new card
      onAddCard(list.id, cardData);
    }
    setShowCardModal(false);
    setEditingCard(null);
  };

  const handleCloseModal = () => {
    setShowCardModal(false);
    setEditingCard(null);
  };

  return (
    <div
      className="bg-gray-50 rounded-xl p-4 w-80 flex-shrink-0 h-fit max-h-[calc(100vh-12rem)] flex flex-col"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, list.id)}
    >
      <div className="flex items-center justify-between mb-4">
        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') {
                setTitle(list.title);
                setIsEditingTitle(false);
              }
            }}
            className="font-semibold text-gray-800 bg-transparent border-none outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded-md transition-all duration-200"
            autoFocus
          />
        ) : (
          <h3
            className="font-semibold text-gray-800 cursor-pointer hover:bg-white hover:px-2 hover:py-1 hover:rounded-md transition-all duration-200"
            onClick={() => setIsEditingTitle(true)}
          >
            {list.title}
          </h3>
        )}
        
        {canDeleteTasks && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
              title={t('list.options')}
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute top-full right-0 rtl:left-0 rtl:right-auto mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]">
                <button
                  onClick={() => {
                    setIsEditingTitle(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left rtl:text-right text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Edit className="w-4 h-4" />
                  <span>{t('list.edit')}</span>
                </button>
                <button
                  onClick={() => {
                    onDeleteList(list.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left rtl:text-right text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('list.delete')}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto mb-4">
        {filteredCards.map((card, index) => {
          const isDragging = draggedCard?.cardId === card.id;
          const isDropTarget = dragOverCard?.cardId === card.id && dragOverCard?.listId === list.id;
          const showDropIndicator = isDropTarget && draggedCard?.cardId !== card.id;

          return (
            <div key={card.id} className="relative">
              {/* Drop indicator before card */}
              {showDropIndicator && dragOverCard?.position === 'before' && (
                <div className="h-0.5 bg-blue-500 rounded-full mb-2 mx-2" />
              )}
              
              <div
                onDragStart={() => onDragStart(card.id, list.id)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => onCardDragOver(e, card.id, list.id)}
                onDrop={(e) => onCardDrop(e, card.id, list.id)}
                className={`transition-all duration-200 ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}`}
              >
                <CardComponent
                  card={card}
                  onEdit={() => handleEditCard(card)}
                  onDelete={() => handleDeleteCard(card.id)}
                  onClick={() => handleCardClick(card)}
                  isDragging={isDragging}
                  searchTerm={searchTerm}
                />
              </div>

              {/* Drop indicator after card */}
              {showDropIndicator && dragOverCard?.position === 'after' && (
                <div className="h-0.5 bg-blue-500 rounded-full mt-2 mx-2" />
              )}
            </div>
          );
        })}
      </div>

      {canCreateTasks && (
        <button
          onClick={handleAddCard}
          className="flex items-center space-x-2 rtl:space-x-reverse w-full p-3 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400"
        >
          <Plus className="w-4 h-4" />
          <span>{t('card.add')}</span>
        </button>
      )}

      <CardModal
        card={editingCard || undefined}
        isOpen={showCardModal}
        onClose={handleCloseModal}
        onSave={handleSaveCard}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={t('card.delete.confirm.title')}
        message={t('card.delete.confirm.message')}
        confirmText={t('card.delete.confirm.yes')}
        cancelText={t('card.delete.confirm.no')}
        onConfirm={confirmDeleteCard}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setCardToDelete(null);
        }}
        type="danger"
      />
    </div>
  );
}