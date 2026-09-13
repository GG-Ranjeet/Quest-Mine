const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Module-level token getter — set once from the auth provider, persists for the session
let getToken: () => Promise<string | null> = async () => null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
  getToken = getter;
};

const authHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  async fetchUserProfile() {
    const res = await fetch(`${API_BASE}/user`, { headers: await authHeaders() });
    if (res.status === 404) return null; // User not registered yet
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async fetchActiveQuests() {
    const res = await fetch(`${API_BASE}/quests`, { headers: await authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch quests');
    return res.json();
  },

  async completeQuest(questId: string, damage: number = 40) {
    const res = await fetch(`${API_BASE}/quests/complete`, {
      method: 'POST',
      headers: await authHeaders(),
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
      headers: await authHeaders(),
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
      headers: await authHeaders(),
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
      headers: await authHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update quest');
    }
    return res.json();
  },
};
