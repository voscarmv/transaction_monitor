import { take, all, call, delay, put, takeEvery } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
// import dotenv from 'dotenv';

// import { Web3 } from 'web3';

const sampleTransactions = () => {
  return eventChannel(emit => {
    require('dotenv').config();
    console.log(process.env);
    const Web3 = require('web3');
    const smartContractAddress = '0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3'; // Safemoon
    const provider = process.env.QUIKNODE_API;
    const web3 = new Web3(provider);
    const subscription = web3.eth.subscribe('logs', {
      address: smartContractAddress,
    }, (error, result) => {
      if (error) {
        emit({ type: 'ERROR', payload: error });
        console.log(error)
        emit(END);
      }
    })
    .on('connected', (subscriptionId) => {
      console.log('connected');
    })
    .on('data', (log) => {
      console.log(log);
      emit({type: 'FETCH_TRANSACTION', payload: log});
    })
    .on("changed", (log) => {
      console.log('changed');
    })

    const unsubscribe = () => {
      subscription.off();
    }

    return unsubscribe;

    }
  );
}

function* callCreateBlockChannel() {
  const blockChannel = yield call(sampleTransactions);
  try {
    while (true) {
      var event = yield take(blockChannel)
      yield put(event)
    }
  } finally {
    blockChannel.close()
  }
}


export function* incrementAsync() {
  yield delay(1000)
  yield put({type: 'INCREMENT'})
}

export function* watchIncrementAsync() {
  yield takeEvery('INCREMENT_ASYNC', incrementAsync)
}

// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
    call(watchIncrementAsync),
    call(callCreateBlockChannel),
  ])
}