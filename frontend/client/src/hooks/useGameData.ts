import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Quest } from '../lib/gameData';

export function useUserData() {
  return useQuery({
    queryKey: ['user'],
    queryFn: api.fetchUserProfile,
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
  });
}

export function useQuestsData() {
  return useQuery({
    queryKey: ['quests'],
    queryFn: api.fetchActiveQuests,
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
  });
}

export function useCompleteQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questId, damage, questXp, questCoins }: { questId: string, damage: number, questXp: number, questCoins: number }) => {
      return api.completeQuest(questId, damage);
    },
    // When mutate is called:
    onMutate: async ({ questId, damage, questXp, questCoins }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user'] });
      await queryClient.cancelQueries({ queryKey: ['quests'] });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(['user']);
      const previousQuests = queryClient.getQueryData(['quests']);

      // Optimistically update the user data
      queryClient.setQueryData(['user'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          xp: old.xp + questXp,
          coins: old.coins + questCoins,
          energy: Math.max(0, old.energy - 7),
          boss_hp: Math.max(0, old.boss_hp - damage),
        };
      });

      // Optimistically remove the quest
      queryClient.setQueryData(['quests'], (old: any) => {
        if (!old) return old;
        return old.filter((q: Quest) => q.id !== questId);
      });

      // Return a context object with the snapshotted value
      return { previousUser, previousQuests };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['user'], context.previousUser);
      }
      if (context?.previousQuests) {
        queryClient.setQueryData(['quests'], context.previousQuests);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });
}

export function useCraftItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: string) => {
      return api.craftItem(recipeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
}

export function useAddQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questData: { title: string, category: string, stat: string, difficulty: string, scheduledDate?: string, isEveryday?: boolean }) => {
      return api.addQuest(questData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['user'] }); // In case they got the daily bonus
    }
  });
}

export function useEditQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<{ title: string, category: string, stat: string, difficulty: string, scheduledDate: string, isEveryday: boolean }> }) => {
      return api.editQuest(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    }
  });
}
