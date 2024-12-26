import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import alertReducer from "./reducers/alertReducer";
import friendsReducer from "./reducers/friendsReducer";
import chatReducer from "./reducers/chatReducer";
import roomReducer from "./reducers/roomReducer";
import storage from "redux-persist/lib/storage";
import postReducer from "./slices/postSlice";
import jobReducer from "./slices/JobSlices";
import profileReducer from "./slices/profileSlices";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import { customStorage } from "./customStorage";
import skillsReducer from "./slices/skillSlices";
const persistConfig = {
  key: "root",
  storage: customStorage, // Use the custom storage with expiration logic
  whitelist: ["auth"], // Specify reducers that need to be persisted
};

const rootReducer = combineReducers({
  auth: authReducer,
  alert: alertReducer,
  friends: friendsReducer,
  chat: chatReducer,
  room: roomReducer,
  posts: postReducer,
  jobs: jobReducer,
  profile: profileReducer,
  skills: skillsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
});
export const persistor = persistStore(store);
