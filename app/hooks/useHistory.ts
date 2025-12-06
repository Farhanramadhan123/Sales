"use client";

import { useState, useEffect, useCallback } from 'react';
import { HistoryItem } from '@/app/types/history';

export const useHistory = () => {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/simulation');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Gagal load history", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/simulation/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setData((prev) => prev.map((item) => item.id === id ? { ...item, status: newStatus } : item));
      } else {
        alert("Gagal update status");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi");
    } finally {
      setUpdatingId(null);
    }
  };

  return {
    data,
    isLoading,
    updatingId,
    selectedItem,
    setSelectedItem,
    fetchData,
    handleStatusChange
  };
};