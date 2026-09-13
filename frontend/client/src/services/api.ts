const API_BASE = 'http://localhost:5000/api';

export const api = {
  async fetchUserProfile() {
    const res = await fetch(`${API_BASE}/user`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async fetchActiveQuests() {
    const res = await fetch(`${API_BASE}/quests`);
    if (!res.ok) throw new Error('Failed to fetch quests');
    return res.json();
  },

  async completeQuest(questId: string, damage: number = 40) {
    const res = await fetch(`${API_BASE}/quests/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questId, damage }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to complete quest');
    }
    return res.json();
  },

  async craftItem(recipeId: string) {
    const res = await fetch(`${API_BASE}/craft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipeId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to craft item');
    }
    return res.json();
  },

  async addQuest(questData: { title: string, category: string, stat: string, difficulty: string, scheduledDate?: string, isEveryday?: boolean }) {
    const res = await fetch(`${API_BASE}/quests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questData),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create quest');
    }
    return res.json();
  },

  async editQuest(id: string, updates: Partial<{ title: string, category: string, stat: string, difficulty: string, scheduledDate: string, isEveryday: boolean }>) {
    const res = await fetch(`${API_BASE}/quests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update quest');
    }
    return res.json();
  },
};
