import App from "./App";
import { ComponentType } from "react";

/**
 * Given a type T how can we infer that it's a ComponentType<P> and
 * then return the type of P.
 */
type PropTypes<T> = unknown;

/**
 * App does not export its Prop type interface. How can we
 * create a concret type that reperents App's prop shape assuming
 * it is an implementation of React.ComponentType
 */
type AppProps = PropTypes<typeof App>;

const _initalPassword: AppProps["initialPassword"] = "hello";
