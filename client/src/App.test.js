import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders main app content", () => {
  render(<App />);
  expect(screen.getByText(/recipe|login|home/i)).toBeInTheDocument();
});
