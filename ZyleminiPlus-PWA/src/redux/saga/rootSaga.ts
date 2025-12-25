import { all, fork } from 'redux-saga/effects';
import { userDataSaga } from './syncDataSaga';
export function* RootSaga() {
    yield all([
        //fork(
        userDataSaga
        //)
    ]);
}
