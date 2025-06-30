import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Board as BoardType, List, Card } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useProject } from '../contexts/ProjectContext';
import { ListComponent } from './ListComponent';

interface BoardProps {
  searchTerm: string;
}

export function Board({ searchTerm }: BoardProps) {
  const { t } = useLanguage();
  const { currentProject, updateProject, canUserAccess } = useProject();
  const [board, setBoard] = useState<BoardType | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; listId: string } | null>(null);
  const [dragOverCard, setDragOverCard] = useState<{ cardId: string; listId: string; position: 'before' | 'after' } | null>(null);

  useEffect(() => {
    if (currentProject) {
      if (currentProject.boards.length > 0) {
        setBoard(currentProject.boards[0]);
      } else {
        // Create default board
        const defaultBoard: BoardType = {
          id: uuidv4(),
          title: 'Main Board',
          lists: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        updateProject(currentProject.id, {
          boards: [defaultBoard]
        });
        setBoard(defaultBoard);
      }
    }
  }, [currentProject, updateProject]);

  const updateBoard = (updatedBoard: BoardType) => {
    if (!currentProject) return;
    
    const updatedBoards = currentProject.boards.map(b => 
      b.id === updatedBoard.id ? updatedBoard : b
    );
    
    updateProject(currentProject.id, { boards: updatedBoards });
    setBoard(updatedBoard);
  };

  const handleAddList = () => {
    if (!newListTitle.trim() || !board || !currentProject) return;
    if (!canUserAccess(currentProject, 'createTasks')) return;

    const newList: List = {
      id: uuidv4(),
      title: newListTitle.trim(),
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedBoard = {
      ...board,
      lists: [...board.lists, newList],
      updatedAt: new Date()
    };

    updateBoard(updatedBoard);
    setNewListTitle('');
    setIsAddingList(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddList();
    } else if (e.key === 'Escape') {
      setIsAddingList(false);
      setNewListTitle('');
    }
  };

  const handleInputBlur = () => {
    // Only close if there's no text
    if (!newListTitle.trim()) {
      setIsAddingList(false);
    }
  };

  const handleDeleteList = (listId: string) => {
    if (!board || !currentProject) return;
    if (!canUserAccess(currentProject, 'deleteTasks')) return;

    const updatedBoard = {
      ...board,
      lists: board.lists.filter(list => list.id !== listId),
      updatedAt: new Date()
    };

    updateBoard(updatedBoard);
  };

  const handleUpdateList = (listId: string, title: string) => {
    if (!board) return;

    const updatedBoard = {
      ...board,
      lists: board.lists.map(list =>
        list.id === listId
          ? { ...list, title, updatedAt: new Date() }
          : list
      ),
      updatedAt: new Date()
    };

    updateBoard(updatedBoard);
  };

  const handleAddCard = (listId: string, cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!board || !currentProject) return;
    if (!canUserAccess(currentProject, 'createTasks')) return;

    const newCard: Card = {
      ...cardData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedBoard = {
      ...board,
      lists: board.lists.map(list =>
        list.id === listId
          ? { ...list, cards: [...list.cards, newCard], updatedAt: new Date() }
          : list
      ),
      updatedAt: new Date()
    };

    updateBoard(updatedBoard);
  };

  const handleEditCard = (listId: string, cardId: string, cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!board) return;

    const updatedBoard = {
      ...board,
      lists: board.lists.map(list =>
        list.id === listId
          ? {
              ...list,
              cards: list.cards.map(card =>
                card.id === cardId
                  ? { ...card, ...cardData, updatedAt: new Date() }
                  : card
              ),
              updatedAt: new Date()
            }
          : list
      ),
      updatedAt: new Date()
    };

    updateBoard(updatedBoard);
  };

  const handleDeleteCard = (listId: string, cardId: string) => {
    if (!board || !currentProject) return;
    if (!canUserAccess(currentProject, 'deleteTasks')) return;

    const updatedBoard = {
      ...board,
      lists: board.lists.map(list =>
        list.id === listId
          ? { ...list, cards: list.cards.filter(card => card.id !== cardId), updatedAt: new Date() }
          : list
      ),
      updatedAt: new Date()
    };

    updateBoard(updatedBoard);
  };

  const handleDragStart = (cardId: string, listId: string) => {
    setDraggedCard({ cardId, listId });
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverCard(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCardDragOver = (e: React.DragEvent, targetCardId: string, targetListId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedCard || draggedCard.cardId === targetCardId) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'before' : 'after';
    
    setDragOverCard({ cardId: targetCardId, listId: targetListId, position });
  };

  const handleCardDrop = (e: React.DragEvent, targetCardId: string, targetListId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedCard || !board || !dragOverCard) return;

    const sourceList = board.lists.find(list => list.id === draggedCard.listId);
    const targetList = board.lists.find(list => list.id === targetListId);
    const draggedCardData = sourceList?.cards.find(card => card.id === draggedCard.cardId);

    if (!draggedCardData || !sourceList || !targetList) return;

    // If dropping on the same card, do nothing
    if (draggedCard.cardId === targetCardId && draggedCard.listId === targetListId) {
      setDraggedCard(null);
      setDragOverCard(null);
      return;
    }

    const targetCardIndex = targetList.cards.findIndex(card => card.id === targetCardId);
    const insertIndex = dragOverCard.position === 'before' ? targetCardIndex : targetCardIndex + 1;

    let updatedLists;

    if (draggedCard.listId === targetListId) {
      // Reordering within the same list
      const currentIndex = sourceList.cards.findIndex(card => card.id === draggedCard.cardId);
      const newCards = [...sourceList.cards];
      
      // Remove the card from its current position
      newCards.splice(currentIndex, 1);
      
      // Adjust insert index if we removed an item before it
      const adjustedInsertIndex = currentIndex < insertIndex ? insertIndex - 1 : insertIndex;
      
      // Insert the card at the new position
      newCards.splice(adjustedInsertIndex, 0, draggedCardData);

      updatedLists = board.lists.map(list =>
        list.id === targetListId
          ? { ...list, cards: newCards, updatedAt: new Date() }
          : list
      );
    } else {
      // Moving between different lists
      const sourceCards = sourceList.cards.filter(card => card.id !== draggedCard.cardId);
      const targetCards = [...targetList.cards];
      targetCards.splice(insertIndex, 0, draggedCardData);

      updatedLists = board.lists.map(list => {
        if (list.id === draggedCard.listId) {
          return { ...list, cards: sourceCards, updatedAt: new Date() };
        }
        if (list.id === targetListId) {
          return { ...list, cards: targetCards, updatedAt: new Date() };
        }
        return list;
      });
    }

    const updatedBoard = {
      ...board,
      lists: updatedLists,
      updatedAt: new Date()
    };

    updateBoard(updatedBoard);
    setDraggedCard(null);
    setDragOverCard(null);
  };

  const handleDrop = (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard.listId === targetListId || !board) {
      setDraggedCard(null);
      setDragOverCard(null);
      return;
    }

    const sourceList = board.lists.find(list => list.id === draggedCard.listId);
    const card = sourceList?.cards.find(card => card.id === draggedCard.cardId);

    if (!card) return;

    const updatedBoard = {
      ...board,
      lists: board.lists.map(list => {
        if (list.id === draggedCard.listId) {
          return {
            ...list,
            cards: list.cards.filter(c => c.id !== draggedCard.cardId),
            updatedAt: new Date()
          };
        }
        if (list.id === targetListId) {
          return {
            ...list,
            cards: [...list.cards, card],
            updatedAt: new Date()
          };
        }
        return list;
      }),
      updatedAt: new Date()
    };

    updateBoard(updatedBoard);
    setDraggedCard(null);
    setDragOverCard(null);
  };

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            {t('project.create')}
          </h2>
          <p className="text-gray-500">
            Create your first project to get started
          </p>
        </div>
      </div>
    );
  }

  if (!canUserAccess(currentProject, 'view')) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500">
            You don't have permission to view this project
          </p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-x-auto">
      <div className="flex space-x-6 rtl:space-x-reverse min-h-full">
        {board.lists.map((list) => (
          <ListComponent
            key={list.id}
            list={list}
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onDeleteList={handleDeleteList}
            onUpdateList={handleUpdateList}
            searchTerm={searchTerm}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onCardDragOver={handleCardDragOver}
            onCardDrop={handleCardDrop}
            draggedCard={draggedCard}
            dragOverCard={dragOverCard}
            canCreateTasks={canUserAccess(currentProject, 'createTasks')}
            canDeleteTasks={canUserAccess(currentProject, 'deleteTasks')}
          />
        ))}

        {canUserAccess(currentProject, 'createTasks') && (
          <div className="w-80 flex-shrink-0">
            {isAddingList ? (
              <div className="bg-gray-50 rounded-xl p-4">
                <input
                  type="text"
                  placeholder={t('list.title.placeholder')}
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleInputBlur}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  autoFocus
                />
                <div className="flex items-center space-x-2 rtl:space-x-reverse mt-3">
                  <button
                    onClick={handleAddList}
                    disabled={!newListTitle.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('list.add')}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingList(false);
                      setNewListTitle('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {t('card.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="w-full p-4 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <Plus className="w-5 h-5" />
                <span>{t('list.add')}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}