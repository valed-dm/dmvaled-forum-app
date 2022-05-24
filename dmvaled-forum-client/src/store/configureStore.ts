import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { UserProfileReducer } from "./user/Reducer";
import { ThreadCategoriesReducer } from "./categories/Reducer";

const rootReducer = combineReducers({
  user: UserProfileReducer,
  categories: ThreadCategoriesReducer
});

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
});

export type AppState = ReturnType<typeof rootReducer>;
export default store;
