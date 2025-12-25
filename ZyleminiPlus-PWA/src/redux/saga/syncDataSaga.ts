import { call, delay, fork, put, select, takeLatest } from 'redux-saga/effects';

export function* userDataSaga(): any  {}

export function* watcherSaga() {
    yield takeLatest('HIT_SAGA', userDataSaga);
}

