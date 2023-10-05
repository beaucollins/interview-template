/**
 * Considering the App component:
 *
 * Task 1) Press the sign in button to get a failure notice.
 *     - Make it display an error `Notice` in the `is-error` style with the failure reason.
 *
 * Task 2) Disable the Sign In button when:
 *    - The input is blank
 *    - The application is in the process of authenticating
 *
 * Task 3) Start authentication if the initialPassword prop is supplied
 *
 * Task 4) Focus the input field on initial render
 */

import React, { useState } from "react";
import useAuthenticate from "./useAuthenticate";

import styled, { createGlobalStyle } from "styled-components";

import "./styles.css";

const Styles = createGlobalStyle`
  body {
    font-family: 'Helvetica Neue', Helvetica, arial, sans-serif;
    margin: 0;
  }
`;

export const Form = styled.form`
  margin: 20px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid hsla(0, 0%, 0%, 0.5);
  display: inline-flex;
`;

export const Notice = styled.div`
  padding: 10px;
  border-radius: 2px;

  &.is-error {
    background: hsla(0, 50%, 50%, 0.1);
    border-color: hsla(0, 50%, 25%, 1);
  }
`;

type Props = {
  initialPassword?: string;
};

export default function App({ initialPassword }: Props) {
  const [password, updatePassword] = useState("");

  const [auth, submitPassword, logout] = useAuthenticate();

  const handleAuthenticate = () => submitPassword(password);

  const handleUpdatePassword = (e: React.ChangeEvent<HTMLInputElement>) =>
    updatePassword(e.target.value);

  return (
    <>
      <Styles />
      <div className="App">
        {auth.state === "authenticating" && <Notice>Signing In ...</Notice>}
        <Form onSubmit={(e) => e.preventDefault()}>
          <input type="text" value={password} onChange={handleUpdatePassword} />
          <button onClick={handleAuthenticate}>Sign In</button>
          {auth.state === "authenticated" && (
            <button onClick={logout}>Sign Out</button>
          )}
        </Form>
        <p>State: {auth.state}</p>
      </div>
    </>
  );
}
