import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Location } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

export const useLocations = () => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchMyLocations = useCallback(async (): Promise<Location[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch locations:', error);
      return [];
    }
    return data as Location[];
  }, [user]);

  const fetchAllLocations = useCallback(async (): Promise<Location[]> => {
    if (role !== 'admin') return [];
    const { data, error } = await supabase
      .from('locations')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch all locations:', error);
      return [];
    }
    return data as Location[];
  }, [role]);

  const createLocation = async (loc: {
    name: string;
    lat: number;
    lng: number;
    method: 'manual' | 'gps';
    description?: string;
    tree_count?: number;
  }) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({
          user_id: user.id,
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          method: loc.method,
          description: loc.description || '',
          tree_count: loc.tree_count || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error('Create location failed:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('locations')
        .update({
          name: updates.name,
          description: updates.description,
          tree_count: updates.tree_count,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Update location failed:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getLocationCheckIns = useCallback(async (locationId: string) => {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch location check-ins:', error);
      return [];
    }
    return data;
  }, []);

  return {
    fetchMyLocations,
    fetchAllLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    getLocationCheckIns,
    loading,
  };
};
