import { configureStore } from '@reduxjs/toolkit';
import userReducer from './redux/userSlice';
import searchReducer from './redux/searchSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    search: searchReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
