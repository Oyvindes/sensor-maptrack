/**
 * State Context
 * A centralized state management solution with persistence
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ErrorService } from '@/services/error/errorService';

/**
 * State interface
 * Defines the shape of the application state
 */
export interface AppState {
  // User state
  user: {
    id: string | null;
    email: string | null;
    name: string | null;
    role: string | null;
    isAuthenticated: boolean;
    companyId: string | null;
    lastLogin: string | null;
  };
  
  // UI state
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
    currentView: string;
    notifications: Array<{
      id: string;
      type: 'info' | 'success' | 'warning' | 'error';
      message: string;
      read: boolean;
      timestamp: string;
    }>;
  };
  
  // Sensor state
  sensors: {
    selectedSensorId: string | null;
    selectedSensorType: string | null;
    filters: {
      companyId: string | null;
      sensorType: string | null;
      status: string | null;
      search: string | null;
    };
    lastRefresh: string | null;
  };
  
  // Settings
  settings: {
    language: string;
    dateFormat: string;
    timeFormat: string;
    timezone: string;
    mapDefaultLocation: {
      lat: number;
      lng: number;
      zoom: number;
    };
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  
  // Cache
  cache: {
    [key: string]: {
      data: any;
      timestamp: string;
      ttl: number; // Time to live in milliseconds
    };
  };
}

/**
 * Action types
 */
export enum ActionType {
  // User actions
  SET_USER = 'SET_USER',
  CLEAR_USER = 'CLEAR_USER',
  UPDATE_USER = 'UPDATE_USER',
  
  // UI actions
  SET_THEME = 'SET_THEME',
  TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
  SET_CURRENT_VIEW = 'SET_CURRENT_VIEW',
  ADD_NOTIFICATION = 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ = 'MARK_NOTIFICATION_READ',
  CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS',
  
  // Sensor actions
  SELECT_SENSOR = 'SELECT_SENSOR',
  SET_SENSOR_FILTERS = 'SET_SENSOR_FILTERS',
  REFRESH_SENSORS = 'REFRESH_SENSORS',
  
  // Settings actions
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  RESET_SETTINGS = 'RESET_SETTINGS',
  
  // Cache actions
  SET_CACHE_ITEM = 'SET_CACHE_ITEM',
  CLEAR_CACHE_ITEM = 'CLEAR_CACHE_ITEM',
  CLEAR_CACHE = 'CLEAR_CACHE',
  
  // App actions
  RESET_STATE = 'RESET_STATE',
  IMPORT_STATE = 'IMPORT_STATE',
}

/**
 * Action interface
 */
export interface Action {
  type: ActionType;
  payload?: any;
}

/**
 * Initial state
 */
export const initialState: AppState = {
  user: {
    id: null,
    email: null,
    name: null,
    role: null,
    isAuthenticated: false,
    companyId: null,
    lastLogin: null,
  },
  ui: {
    theme: 'system',
    sidebarOpen: true,
    currentView: 'dashboard',
    notifications: [],
  },
  sensors: {
    selectedSensorId: null,
    selectedSensorType: null,
    filters: {
      companyId: null,
      sensorType: null,
      status: null,
      search: null,
    },
    lastRefresh: null,
  },
  settings: {
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    timezone: 'UTC',
    mapDefaultLocation: {
      lat: 59.9139,
      lng: 10.7522,
      zoom: 13,
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  },
  cache: {},
};

/**
 * Reducer function
 * @param state Current state
 * @param action Action to perform
 * @returns New state
 */
function reducer(state: AppState, action: Action): AppState {
  try {
    switch (action.type) {
      // User actions
      case ActionType.SET_USER:
        return {
          ...state,
          user: {
            ...action.payload,
            isAuthenticated: true,
          },
        };
        
      case ActionType.CLEAR_USER:
        return {
          ...state,
          user: {
            ...initialState.user,
          },
        };
        
      case ActionType.UPDATE_USER:
        return {
          ...state,
          user: {
            ...state.user,
            ...action.payload,
          },
        };
        
      // UI actions
      case ActionType.SET_THEME:
        return {
          ...state,
          ui: {
            ...state.ui,
            theme: action.payload,
          },
        };
        
      case ActionType.TOGGLE_SIDEBAR:
        return {
          ...state,
          ui: {
            ...state.ui,
            sidebarOpen: action.payload !== undefined ? action.payload : !state.ui.sidebarOpen,
          },
        };
        
      case ActionType.SET_CURRENT_VIEW:
        return {
          ...state,
          ui: {
            ...state.ui,
            currentView: action.payload,
          },
        };
        
      case ActionType.ADD_NOTIFICATION:
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [
              ...state.ui.notifications,
              {
                ...action.payload,
                read: false,
                timestamp: new Date().toISOString(),
              },
            ],
          },
        };
        
      case ActionType.MARK_NOTIFICATION_READ:
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.map(notification =>
              notification.id === action.payload
                ? { ...notification, read: true }
                : notification
            ),
          },
        };
        
      case ActionType.CLEAR_NOTIFICATIONS:
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [],
          },
        };
        
      // Sensor actions
      case ActionType.SELECT_SENSOR:
        return {
          ...state,
          sensors: {
            ...state.sensors,
            selectedSensorId: action.payload.id,
            selectedSensorType: action.payload.type,
          },
        };
        
      case ActionType.SET_SENSOR_FILTERS:
        return {
          ...state,
          sensors: {
            ...state.sensors,
            filters: {
              ...state.sensors.filters,
              ...action.payload,
            },
          },
        };
        
      case ActionType.REFRESH_SENSORS:
        return {
          ...state,
          sensors: {
            ...state.sensors,
            lastRefresh: new Date().toISOString(),
          },
        };
        
      // Settings actions
      case ActionType.UPDATE_SETTINGS:
        return {
          ...state,
          settings: {
            ...state.settings,
            ...action.payload,
          },
        };
        
      case ActionType.RESET_SETTINGS:
        return {
          ...state,
          settings: {
            ...initialState.settings,
          },
        };
        
      // Cache actions
      case ActionType.SET_CACHE_ITEM:
        return {
          ...state,
          cache: {
            ...state.cache,
            [action.payload.key]: {
              data: action.payload.data,
              timestamp: new Date().toISOString(),
              ttl: action.payload.ttl || 300000, // Default 5 minutes
            },
          },
        };
        
      case ActionType.CLEAR_CACHE_ITEM:
        const newCache = { ...state.cache };
        delete newCache[action.payload];
        return {
          ...state,
          cache: newCache,
        };
        
      case ActionType.CLEAR_CACHE:
        return {
          ...state,
          cache: {},
        };
        
      // App actions
      case ActionType.RESET_STATE:
        return {
          ...initialState,
          settings: state.settings, // Preserve settings
        };
        
      case ActionType.IMPORT_STATE:
        return {
          ...action.payload,
        };
        
      default:
        return state;
    }
  } catch (error) {
    // Log the error
    ErrorService.handleError(
      error instanceof Error ? error : new Error('Error in state reducer'),
      {
        context: 'StateReducer',
        severity: 'error',
        action: action.type,
      }
    );
    
    // Return the current state to prevent app crashes
    return state;
  }
}

/**
 * State context
 */
export const StateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

/**
 * State provider props
 */
interface StateProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AppState>;
  storageKey?: string;
}

/**
 * State provider component
 * @param props Component props
 * @returns Provider component
 */
export const StateProvider: React.FC<StateProviderProps> = ({
  children,
  initialState: customInitialState,
  storageKey = 'app_state',
}) => {
  // Load state from localStorage if available
  const loadState = (): AppState => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        return {
          ...initialState,
          ...parsedState,
          ...customInitialState,
        };
      }
    } catch (error) {
      ErrorService.handleError(
        error instanceof Error ? error : new Error('Error loading state from localStorage'),
        {
          context: 'StateProvider.loadState',
          severity: 'warning',
        }
      );
    }
    
    return {
      ...initialState,
      ...customInitialState,
    };
  };
  
  // Initialize state
  const [state, dispatch] = useReducer(reducer, loadState());
  
  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      // Clean up the cache before saving
      const stateToSave = {
        ...state,
        cache: {}, // Don't persist cache
      };
      
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      ErrorService.handleError(
        error instanceof Error ? error : new Error('Error saving state to localStorage'),
        {
          context: 'StateProvider.saveState',
          severity: 'warning',
        }
      );
    }
  }, [state, storageKey]);
  
  // Clean up expired cache items
  useEffect(() => {
    const cleanupCache = () => {
      const now = new Date().getTime();
      const expiredKeys: string[] = [];
      
      // Find expired cache items
      Object.entries(state.cache).forEach(([key, item]) => {
        const timestamp = new Date(item.timestamp).getTime();
        if (now - timestamp > item.ttl) {
          expiredKeys.push(key);
        }
      });
      
      // Remove expired items
      expiredKeys.forEach(key => {
        dispatch({
          type: ActionType.CLEAR_CACHE_ITEM,
          payload: key,
        });
      });
    };
    
    // Run cleanup every minute
    const interval = setInterval(cleanupCache, 60000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, [state.cache]);
  
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

/**
 * Use state hook
 * @returns State context
 */
export const useAppState = () => useContext(StateContext);

/**
 * Use selector hook
 * @param selector Selector function
 * @returns Selected state
 */
export function useSelector<T>(selector: (state: AppState) => T): T {
  const { state } = useAppState();
  return selector(state);
}

/**
 * Use dispatch hook
 * @returns Dispatch function
 */
export const useDispatch = () => {
  const { dispatch } = useAppState();
  return dispatch;
};

/**
 * Use cached data hook
 * @param key Cache key
 * @param fetchFn Function to fetch data if not in cache
 * @param ttl Time to live in milliseconds
 * @returns Cached data and loading state
 */
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = 300000 // Default 5 minutes
): { data: T | null; loading: boolean; refresh: () => Promise<T> } {
  const { state, dispatch } = useAppState();
  const [loading, setLoading] = React.useState(false);
  
  // Function to fetch and cache data
  const fetchAndCacheData = async (): Promise<T> => {
    setLoading(true);
    
    try {
      const data = await fetchFn();
      
      dispatch({
        type: ActionType.SET_CACHE_ITEM,
        payload: {
          key,
          data,
          ttl,
        },
      });
      
      return data;
    } catch (error) {
      ErrorService.handleError(
        error instanceof Error ? error : new Error(`Error fetching data for cache key: ${key}`),
        {
          context: 'useCachedData.fetchAndCacheData',
          severity: 'error',
          cacheKey: key,
        }
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Check if data is in cache and not expired
  const cachedItem = state.cache[key];
  const isExpired = cachedItem
    ? new Date().getTime() - new Date(cachedItem.timestamp).getTime() > cachedItem.ttl
    : true;
  
  // Fetch data if not in cache or expired
  React.useEffect(() => {
    if (!cachedItem || isExpired) {
      fetchAndCacheData().catch(() => {
        // Error already handled in fetchAndCacheData
      });
    }
  }, [key]);
  
  return {
    data: cachedItem?.data || null,
    loading,
    refresh: fetchAndCacheData,
  };
}