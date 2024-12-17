import { MAX_ATTEMPTS } from "../types/common";
import { Transcript, RecorderStatus } from "../utils/speech-to-text";
import { Actions, ActionType } from "./actions";

export const ErrorMsgs = {
  NOT_AUTHORIZED: 'Not authorized',
  GENERIC_ERROR: 'Something went wrong.'
};

export type ConnectionClosedType = {
  closed: boolean,
  code: number,
  reason: string,
  count: number
};

export type State = {
  transcript?: Transcript;
  isReady: boolean;
  sttConnected?: boolean;
  sttConnectionClosed?: ConnectionClosedType;
  error?: string;
  recorderStatus?: string;
  searchClicked?: boolean;
  isFetching?: boolean;
};

export const initialState: State = {
  isReady: false
};

export const reducer = (state: State, action: Actions) => {
  switch (action.type) {
    case ActionType.CONNECTED:
      return {
        ...state,
        sttConnected: action.payload,
        isReady: state.recorderStatus === RecorderStatus.RECORDING,
        sttConnectionClosed: undefined,
        error: undefined
      };
    case ActionType.DISCONNECTED:
      return {
        ...state, 
        sttConnectionClosed: {
          ...action.payload, 
          count: state.sttConnectionClosed.count + action.payload.count
        },
        sttConnected: false,
        isReady: false
      };
    case ActionType.RECORDER_STATE_CHANGE:
      return {
        ...state,
        recorderStatus: action.payload,
        isReady: action.payload === RecorderStatus.RECORDING && state.sttConnected
      };
    case ActionType.ERROR:
      if (action.payload?.['message'] === ErrorMsgs.NOT_AUTHORIZED && state.sttConnectionClosed.count < MAX_ATTEMPTS) {
        return state;
      }
      return {
        ...state,
        error: action.payload?.['message'] ?? ErrorMsgs.GENERIC_ERROR
      };
    case ActionType.SEARCH:
      return {
        ...state,
        searchClicked: action.payload
      };
    case ActionType.FETCHING: 
      return {
        ...state,
        isFetching: action.payload
      };
    default:
      return state;
  }
};