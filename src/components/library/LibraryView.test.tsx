import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LibraryView } from "../../views/LibraryView";
import { useLibraryStore } from "../../store/library";
import { setupMockApp, mockApi } from "../../test/harness";

describe("LibraryView grid", () => {
  it("renders the game grid without hero metadata", async () => {
    await setupMockApp();
    render(<LibraryView />);

    // No hero title, no stats, no Recents — just the grid.
    expect(screen.queryByRole("heading", { name: "Your library" })).toBeNull();
    expect(screen.queryByText("Your games, in one place.")).toBeNull();
    expect(screen.queryByText("titles")).toBeNull();
    expect(screen.queryByText("played")).toBeNull();
    expect(screen.queryByText("this week")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Recently played" })).toBeNull();

    // Games are still on screen.
    const hollowKnight = await screen.findAllByText("Hollow Knight");
    expect(hollowKnight.length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'Playing now' on a card whose session is active", async () => {
    await setupMockApp();
    // Launching a game creates a session with no `endedAt` yet.
    await mockApi().launchGame(1);

    render(<LibraryView />);

    expect(await screen.findByText("Playing now")).toBeInTheDocument();
  });
});

describe("LibraryView empty states", () => {
  it("shows the empty library state with no games", async () => {
    await setupMockApp();
    useLibraryStore.setState({ games: [], sessions: [] });

    render(<LibraryView />);

    expect(
      await screen.findByRole("heading", { name: "Your library is empty" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Go to Sources & Import/)).toBeInTheDocument();
  });
});
