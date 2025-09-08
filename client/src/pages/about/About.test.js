import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import About from "./About";

describe("About", () => {
  it("renders the about page content", () => {
    render(<About />);
    expect(screen.getByText(/About Me/i)).toBeInTheDocument();
    expect(screen.getByText(/Cooking, to me, is more than just recipes/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Exploring Recipes/i })).toBeInTheDocument();
  });

  it("scrolls or navigates on button click", () => {
    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { pathname: "/", href: "", assign: jest.fn() };
    document.body.innerHTML += '<div id="browse-all-recipes-section"></div>';
    render(<About />);
    const button = screen.getByRole("button", { name: /Start Exploring Recipes/i });
    const scrollIntoView = jest.fn();
    document.getElementById("browse-all-recipes-section").scrollIntoView = scrollIntoView;
    fireEvent.click(button);
    expect(scrollIntoView).toHaveBeenCalled();
    window.location = originalLocation;
  });
});
