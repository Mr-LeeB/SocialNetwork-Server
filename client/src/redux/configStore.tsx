import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./Slice/UserSlice";

import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./saga/rootSaga";

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware];

export default configureStore({
  reducer: {
    userReducer,
  },
  middleware,
});

// Hàm run nhận vào 1 generator function
sagaMiddleware.run(rootSaga);
