import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { SimpleRootState, SimpleAppDispatch } from '../store/store-simple';

// Use throughout the app instead of plain useDispatch/useSelector.
export const useAppDispatch = () => useDispatch<SimpleAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<SimpleRootState> = useSelector;
