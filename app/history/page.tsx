"use client";

import React from 'react';
import { useHistory } from '../hooks/useHistory';
import HistoryHeader from '../components/history/HistoryHeader';
import HistoryTable from '../components/history/HistoryTable';
import HistoryDetailModal from '../components/history/HistoryDetailModal';

export default function HistoryPage() {
  const { 
    data, 
    isLoading, 
    updatingId, 
    selectedItem, 
    setSelectedItem, 
    fetchData, 
    handleStatusChange 
  } = useHistory();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <HistoryHeader onRefresh={fetchData} />

      {/* Table */}
      <HistoryTable 
        data={data}
        isLoading={isLoading}
        updatingId={updatingId}
        handleStatusChange={handleStatusChange}
        setSelectedItem={setSelectedItem}
      />

      {/* Modal Popup (Conditional Rendering handled inside component) */}
      <HistoryDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}