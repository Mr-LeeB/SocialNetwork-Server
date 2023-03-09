import { createAction } from "@reduxjs/toolkit";

export const REGIS_USER_SAGA = createAction("REGIS_USER_SAGA", (data) => ({payload: data}));
