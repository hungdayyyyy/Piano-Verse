import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "@/features/auth/authSlice";
import playerReducer from "@/features/streaming/playerSlice";
import pianoReducer from "@/features/piano/pianoSlice";
import { authApi } from "@/features/auth/authApi";
import { usersApi } from "@/features/users/usersApi";
import { practiceApi } from "@/features/practice/practiceApi";
import { streamingApi } from "@/features/streaming/streamingApi";
import { pianoApi } from "@/features/piano/pianoApi";
import { adminApi } from "@/features/admin/adminApi";
import { aiApi } from "@/features/ai/aiApi";

export const store = configureStore({
  reducer: {
    // Feature slices
    auth: authReducer,
    player: playerReducer,
    piano: pianoReducer,

    // RTK Query API reducers
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [practiceApi.reducerPath]: practiceApi.reducer,
    [streamingApi.reducerPath]: streamingApi.reducer,
    [pianoApi.reducerPath]: pianoApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in player/piano slices
        ignoredActions: ["player/playTrack"],
      },
    }).concat(
      authApi.middleware,
      usersApi.middleware,
      practiceApi.middleware,
      streamingApi.middleware,
      pianoApi.middleware,
      adminApi.middleware,
      aiApi.middleware
    ),
  devTools: process.env.NODE_ENV !== "production",
});

// Required for RTK Query refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
