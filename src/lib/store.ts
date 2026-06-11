import { createSeedState, type CRMState } from "../data/seed";

const STORAGE_KEY = "syook-crm-v3";
const VERSION = 2;

type StoredState = CRMState & { version: number };

const withVersion = (state: CRMState): StoredState => ({ ...state, version: VERSION });

export function loadState(): CRMState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createSeedState();
      saveState(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw) as StoredState;
    if (parsed.version !== VERSION || !Array.isArray(parsed.deals)) {
      const seeded = createSeedState();
      saveState(seeded);
      return seeded;
    }

    return {
      deals: parsed.deals,
      activities: parsed.activities ?? [],
      docs: parsed.docs ?? [],
      offline: Boolean(parsed.offline),
    };
  } catch {
    const seeded = createSeedState();
    saveState(seeded);
    return seeded;
  }
}

export function saveState(state: CRMState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withVersion(state)));
}

export function resetState() {
  window.localStorage.removeItem(STORAGE_KEY);
  const seeded = createSeedState();
  saveState(seeded);
  return seeded;
}

export function queuedCount(state: CRMState) {
  return state.activities.filter((activity) => activity.pendingSync).length;
}

export function clearPendingSync(state: CRMState): CRMState {
  return {
    ...state,
    activities: state.activities.map((activity) => ({ ...activity, pendingSync: false })),
    docs: state.docs.map((doc) => ({ ...doc, pendingSync: false })),
  };
}
