import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./services/authApi";
import { pagesApi } from "./services/pagesApi";
import { routesApi } from "./services/routesApi";
import { mealsApi } from "./services/mealsApi";
import { mealOptionsApi } from "./services/mealOptions";
import { schedulerApi } from "./services/schedulerApi";
import { packagesApi } from "./services/packagesApi";
import { extrasApi } from "./services/extrasApi";
import { customersApi } from "./services/customersApi";
import { addressApi } from "./services/addressApi";
import { dashboardApi } from "./services/dashboardApi";
import { ordersApi } from "./services/ordersApi";
import { settingsApi } from "./services/settingsApi";
import { telemetryApi } from "./services/telemetryApi";
import { crmApi } from "./services/crnApi";
import { driversApi } from "./services/driversApi";


export const makeStore = () => {
  return configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [packagesApi.reducerPath]: packagesApi.reducer,
      [pagesApi.reducerPath]: pagesApi.reducer,
      [routesApi.reducerPath]: routesApi.reducer,
      [mealsApi.reducerPath]: mealsApi.reducer,
      [mealOptionsApi.reducerPath]: mealOptionsApi.reducer,
      [schedulerApi.reducerPath]: schedulerApi.reducer,
      [extrasApi.reducerPath] : extrasApi.reducer,
      [customersApi.reducerPath] : customersApi.reducer,
      [addressApi.reducerPath]: addressApi.reducer,
      [dashboardApi.reducerPath]: dashboardApi.reducer,
      [ordersApi.reducerPath]: ordersApi.reducer,
      [settingsApi.reducerPath]: settingsApi.reducer,
      [telemetryApi.reducerPath]: telemetryApi.reducer,
      [crmApi.reducerPath]: crmApi.reducer,
      [driversApi.reducerPath]: driversApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware,
         pagesApi.middleware, routesApi.middleware, mealsApi.middleware,
         mealOptionsApi.middleware, schedulerApi.middleware,
         packagesApi.middleware, extrasApi.middleware,
         customersApi.middleware, addressApi.middleware,
         dashboardApi.middleware, ordersApi.middleware,
         settingsApi.middleware, telemetryApi.middleware, crmApi.middleware, driversApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];