import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

export const useUserManagement = () => {
  const [loading, setLoading] = useState(false);

  const fetchAllUsers = useCallback(async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
    return data as Profile[];
  }, []);

  const createUser = async (email: string, password: string, fullName: string, role: 'user' | 'admin' = 'user') => {
    setLoading(true);
    try {
      // Use Supabase admin API via Edge Function or direct auth.signUp
      // Note: In production, this should go through a server-side Edge Function
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error('Create user failed:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: { full_name?: string; role?: string; is_active?: boolean }) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Update user failed:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (userId: string) => {
    // Soft delete: deactivate, don't delete data
    return updateUser(userId, { is_active: false });
  };

  const getUserLocations = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch user locations:', error);
      return [];
    }
    return data;
  }, []);

  const getUserCheckIns = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch user check-ins:', error);
      return [];
    }
    return data;
  }, []);

  const getUserUploadStatus = useCallback(async (periodMonths: number = 3) => {
    const users = await fetchAllUsers();
    const periodStart = new Date();
    periodStart.setMonth(periodStart.getMonth() - periodMonths);

    const statuses = await Promise.all(
      users.filter(u => u.role === 'user').map(async (user) => {
        const checkIns = await getUserCheckIns(user.id);
        const locations = await getUserLocations(user.id);
        const latestUpload = checkIns[0]?.created_at;
        const isOverdue = !latestUpload || new Date(latestUpload) < periodStart;

        return {
          user,
          total_locations: locations.length,
          total_check_ins: checkIns.length,
          last_upload_at: latestUpload || undefined,
          is_overdue: isOverdue,
          locations,
        };
      })
    );

    return statuses;
  }, [fetchAllUsers, getUserCheckIns, getUserLocations]);

  return {
    fetchAllUsers,
    createUser,
    updateUser,
    deactivateUser,
    getUserLocations,
    getUserCheckIns,
    getUserUploadStatus,
    loading,
  };
};
