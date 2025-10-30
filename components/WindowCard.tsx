import React, { useState, useEffect } from 'react';
import { Window } from '../types';
import { useCalculator } from '../contexts/CalculatorContext';
import { WINDOW_DIRECTIONS, WINDOW_AZIMUTHS, CompassArrow } from '../constants';
import Button from './ui/Button';
import { PencilIcon, DocumentDuplicateIcon, TrashIcon } from './Icons';

interface WindowCardProps {
  window: Window;
}

const WindowCard: React.FC<WindowCardProps> = ({ window }) => {
  const { dispatch, state } = useCalculator();
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if(state.windows.length > 0 && window.id === Math.max(...state.windows.map(w => w.id))) {
      setIsNew(true);
      const timer = setTimeout(() => setIsNew(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [window.id, state.windows]);

  const area = (window.width * window.height).toFixed(2);
  const dirLabel = WINDOW_DIRECTIONS.find(d => d.value === window.direction)?.label || window.direction;

  const handleEdit = () => dispatch({ type: 'SET_MODAL', payload: { isOpen: true, type: 'editWindow', data: window.id } });
  const handleDuplicate = () => dispatch({ type: 'DUPLICATE_WINDOW', payload: window.id });
  const handleDelete = () => dispatch({ type: 'DELETE_WINDOW', payload: window.id });
  
  const rotation = WINDOW_AZIMUTHS[window.direction] || 0;
  
  const isEditing = state.modal.isOpen && state.modal.type === 'editWindow' && state.modal.data === window.id;

  return (
    <div className={`relative bg-slate-100 dark:bg-slate-700 p-4 rounded-lg shadow-sm flex flex-col h-40 transition-all duration-300 ${isNew ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-800' : ''} ${isEditing ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-800' : ''}`}>
       <CompassArrow rotation={rotation} />
      <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">Okno {window.id}</h3>
      <div className="flex-grow text-sm space-y-1 text-slate-600 dark:text-slate-300">
        <p>Kierunek: <strong className="text-slate-800 dark:text-slate-100">{dirLabel}</strong></p>
        <p>Powierzchnia: <strong className="text-slate-800 dark:text-slate-100">{area} m²</strong></p>
      </div>
      <div className="flex gap-2 mt-auto">
        <Button onClick={handleEdit} className="flex-1 py-1 text-xs"><PencilIcon className="w-4 h-4 inline-block mr-1"/>Edytuj</Button>
        <Button onClick={handleDuplicate} variant="secondary" className="flex-1 py-1 text-xs"><DocumentDuplicateIcon className="w-4 h-4 inline-block mr-1"/>Duplikuj</Button>
        <Button onClick={handleDelete} variant="danger" className="flex-1 py-1 text-xs"><TrashIcon className="w-4 h-4 inline-block mr-1"/>Usuń</Button>
      </div>
    </div>
  );
};

export default WindowCard;