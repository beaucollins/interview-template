import "@testing-library/jest-dom";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import React from "react";

import App from "../App";

describe("App", () => {
  beforeEach(() => {
    cleanup();
  });

  function findStateMessage(status: string) {
    return screen.findByText(`State: ${status}`, undefined, { timeout: 5000 });
  }

  test("incorrect password", async () => {
    render(<App />);
    expect(await findStateMessage("unauthenticated")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(await findStateMessage("failed")).toBeInTheDocument();
  });

  test("valid password", async () => {
    render(<App />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "hunter7" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(await findStateMessage("authenticated")).toBeInTheDocument();
  });

  // test("logout");

  // test("blank password");

  // test("initial password");

  // test("disable button on login");
});
