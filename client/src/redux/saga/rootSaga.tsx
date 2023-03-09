import { all } from "redux-saga/effects";
import * as userSaga from "./UserSaga";

export function* rootSaga() {
  yield all([
    userSaga.theoDoiRegisterUserSaga(),


  ]);
}


