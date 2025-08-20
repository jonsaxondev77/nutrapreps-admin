import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./services/authApi";
import { pagesApi } from "./services/pagesApi";
import { routesApi } from "./services/routesApi";
import { mealsApi } from "./services/mealsApi";
import { mealOptionsApi } from "./services/mealOptions";


export const makeStore = () => {
  return configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [pagesApi.reducerPath]: pagesApi.reducer,
      [routesApi.reducerPath]: routesApi.reducer,
      [mealsApi.reducerPath]: mealsApi.reducer,
      [mealOptionsApi.reducerPath]: mealOptionsApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware, pagesApi.middleware, routesApi.middleware, mealsApi.middleware, mealOptionsApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];