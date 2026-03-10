import type { SimpleRootState } from '../store-simple';

export const selectAuthState = (state: SimpleRootState) => state.auth;
export const selectAuthUser = (state: SimpleRootState) => state.auth.user;
export const selectAuthToken = (state: SimpleRootState) => state.auth.token;
export const selectIsAuthenticated = (state: SimpleRootState) =>
  state.auth.isAuthenticated;
export const selectAuthError = (state: SimpleRootState) => state.auth.error;
