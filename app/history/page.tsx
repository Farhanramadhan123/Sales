// app/history/page.tsx
"use client";

import React from 'react';
import { useHistory } from '../hooks/useHistory';
import { useAuth } from '../hooks/useAuth';
import HistoryHeader from '../components/history/HistoryHeader';
import HistoryTable from '../components/history/HistoryTable';
import HistoryDetailModal from '../components/history/HistoryDetailModal';

export default function HistoryPage() {
  const { user } = useAuth(); // Ambil data user login
  
  const { 
    data, 
    isLoading, 
    updatingId, 
    selectedItem, 
    setSelectedItem, 
    fetchData, 
    handleStatusChange 
  } = useHistory();

  // Fungsi Hapus (Hanya akan berhasil jika user PROSESOR)
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    try {
      const res = await fetch(`/api/simulation/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchData();
      } else {
        const json = await res.json();
        alert(json.error || "Gagal menghapus data.");
      }
    } catch (e) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <HistoryHeader onRefresh={fetchData} />

      <HistoryTable 
        data={data}
        isLoading={isLoading}
        updatingId={updatingId}
        handleStatusChange={handleStatusChange}
        handleDelete={handleDelete}
        setSelectedItem={setSelectedItem}
        currentUser={user} // Pass data user
      />

      <HistoryDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}