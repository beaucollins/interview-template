import { useReducer, Reducer, Dispatch, ReducerAction, useMemo } from "react";

const PASSWORD = "hunter7";

export type Identity = {
  username: string;
};

export type AuthState =
  | { state: "unauthenticated" }
  | { state: "authenticating" }
  | { state: "failed"; reason: string }
  | { state: "authenticated"; identity: Identity };

const initialState: AuthState = { state: "unauthenticated" };

export type Token = string;

type SubmitAction = { type: "submit"; token: Token };
type FailureAction = { type: "failure"; reason: string };
type SuccessAction = { type: "success"; identity: Identity };
type LogoutAction = { type: "logout" };

type Action = SubmitAction | FailureAction | SuccessAction | LogoutAction;

class AuthStateError extends Error {
  constructor(private actionType: never) {
    super(`Unexpected action type ${JSON.stringify(actionType)}`);
  }
}

const authenticating = { state: "authenticating" } as const;

const reducer: Reducer<AuthState, Action> = (state, action) => {
  switch (action.type) {
    case "submit": {
      return authenticating;
    }
    case "failure": {
      return { state: "failed", reason: action.reason };
    }
    case "success": {
      return { state: "authenticated", identity: action.identity };
    }
    case "logout": {
      return { state: "unauthenticated" };
    }
    default: {
      throw new AuthStateError(action);
    }
  }
};

type SideEffect<A> = (
  dispatch: Dispatch<A>
) => (next: Dispatch<A>, action: A) => void;

function withSideEffects<R extends Reducer<any, any>>(
  dispatch: Dispatch<ReducerAction<R>>,
  sideEffects: SideEffect<ReducerAction<R>>[] = []
): Dispatch<ReducerAction<R>> {
  if (sideEffects.length === 0) {
    return dispatch;
  }

  if (sideEffects.length === 1) {
    const [sideEffect] = sideEffects;
    const initialized = sideEffect(dispatch);
    return (action: ReducerAction<R>) => {
      return initialized(dispatch, action);
    };
  }
  return sideEffects
    .map((effect) => effect(dispatch))
    .reduce<(action: ReducerAction<R>) => void>(
      (next, sideEffect) => (action) => {
        sideEffect(next, action);
      },
      (action) => {
        dispatch(action);
      }
    );
}

type Maybe<T> = null | T;

type Detect<A, T> = (action: A) => Maybe<T>;

function before<A, T>(
  detect: Detect<A, T>
): (effect: (action: T, dispatch: Dispatch<A>) => void) => SideEffect<A> {
  return (effect) => (dispatch) => (next, action) => {
    const detected = detect(action);
    if (detected != null) {
      effect(detected, dispatch);
    }
    next(action);
  };
}

const detectSubmit = (action: Action) =>
  action.type === "submit" ? action : null;

const beforeSubmit = before(detectSubmit);

export type SubmitToken = (token: Token) => void;
export type Logout = () => void;

const sideEffects = [
  beforeSubmit((action, dispatch) => {
    const login =
      action.token === PASSWORD
        ? () => dispatch({ type: "success", identity: { username: "root" } })
        : () =>
            dispatch({
              type: "failure",
              reason: `Password submitted ('${action.token}') is not '${PASSWORD}'`
            });
    setTimeout(login, 2000);
  })
];

/**
 * A statefull hook that uses a reducer to track the authentication status of the current user.
 *
 * Example:
 *
 *    const [auth, login, logout] = useAuthenticate();
 *    return auth.state === 'authenticated' ? <button onClick={logout}>Log Out</button>
 *
 * The `login` and `logout` function dispatches are stable and do not change between calls to `useAuthenticate()`.
 *
 * @returns [AuthState, SubmitToken, Logout] - the current state of authentication (`AuthState`), a function to submit a token to be authenticated (`SubmitToken`),
 *  and a function to remove return ta an unauthenticated state (`Logout`)
 */
export default function useAuthenticate(): [AuthState, SubmitToken, Logout] {
  const [state, dispatch] = useReducer(reducer, initialState);
  const effectDispatch = useMemo(
    () => withSideEffects<typeof reducer>(dispatch, sideEffects),
    [dispatch]
  );

  const methods = useMemo(
    () =>
      [
        (token: Token) => effectDispatch({ type: "submit", token }),
        () => effectDispatch({ type: "logout" })
      ] as const,
    [effectDispatch]
  );

  return [state, ...methods];
}
