# Browser Control Implementation

## Current Architecture

The Python LiveKit voice agent controls a dedicated Playwright Chromium browser.

```text
React voice frontend
        |
        | LiveKit room
        v
Gemini Live voice agent
        |
        | LiveKit function tools
        v
Playwright-managed Chromium browser
```

- The browser is separate from the user's existing Chrome tabs.
- Each LiveKit room owns an isolated Playwright browser context and page.
- Chromium runs visibly during local development with `headless=False`.
- The browser is created lazily: starting a voice call does not open Chromium.
- Chromium starts on the first browser tool call and closes when the room ends.

## Dependencies

- `playwright` is installed in `pyproject.toml`.
- Chromium is installed with:

```powershell
uv run playwright install chromium
```

## Gemini Live Configuration

The agent uses Gemini Live with explicit tool-compatible configuration:

```python
google.beta.realtime.RealtimeModel(
    model="gemini-3.1-flash-live-preview",
    voice="Enceladus",
    tool_response_scheduling=genai_types.FunctionResponseScheduling.WHEN_IDLE,
)
```

The explicit model and tool-response scheduling avoid the Gemini audio-content error that occurred with the older implicit model configuration after a tool response.

## Browser Manager

`src/browser.py` contains `BrowserManager`, which provides:

- URL validation that permits only complete `http` and `https` URLs.
- Rejection of URLs containing embedded credentials.
- Navigation timeouts and user-facing `BrowserError` messages.
- Serialized browser operations with an async lock.
- Cleanup of the page, context, browser, and Playwright runtime.

## Registered Agent Tools

The following LiveKit function tools are registered in `src/agent.py`:

| Tool | Purpose |
| --- | --- |
| `open_url(url)` | Opens a public URL and returns title and final URL. |
| `read_page()` | Returns normalized visible text from the current page. |
| `inspect_page()` | Returns readable text plus visible interactive elements and their names, roles, tags, and input types. |
| `go_back()` | Goes to the previous browser page. |
| `take_screenshot()` | Captures an in-memory PNG and returns capture status. |
| `click(target)` | Clicks a visible control by accessible name or visible text. |
| `type_text(target, text)` | Fills a text field by accessible name, label, or placeholder. |
| `scroll(direction)` | Scrolls up or down. |
| `press_key(key)` | Sends a restricted navigation key such as Enter, Escape, Tab, arrow keys, or Backspace. |
| `confirm_browser_action(target)` | Authorizes one consequential click after explicit user confirmation. |

## Page Inspection And Interaction

Before clicking or typing, Anfisa is instructed to call `inspect_page` unless the target was returned by an earlier inspection.

`inspect_page` exposes up to eighty visible interactive elements, including:

- Buttons and links
- Inputs, textareas, and selects
- ARIA roles
- Accessible labels, element labels, titles, placeholders, and visible text

Target matching supports exact and partial accessible-name matching. Text fields also have fallbacks for common search fields and visible input controls.

## Safety Controls

- Read-only browser actions do not require confirmation.
- Click targets containing words such as `send`, `submit`, `buy`, `purchase`, `delete`, `remove`, or `confirm` require explicit voice confirmation.
- Confirmation is stored in agent state and applies to one exact target click.
- The agent must not automate CAPTCHA solving or bypass login/security controls.

## Validation

The browser test suite verifies:

- Safe URL validation
- Unsafe URL rejection
- Confirmation-word detection
- Page inspection
- Labeled search-field discovery
- Text entry
- Button clicking on a local test page

Run validation with:

```powershell
uv run ruff format --check src tests
uv run ruff check src tests
uv run pytest tests/test_browser.py
```

## Run Locally

```powershell
cd "C:\Users\Thanh-y\Documents\Python_Project_S\anfisa_updated_test\anfisa_new"
uv run python src/agent.py dev
```

Example voice requests:

- "Open example.com."
- "Read this page."
- "Go back."
- "Open Google and search for LiveKit Agents."

## Future Work

- Send the current URL, title, status, and screenshots to the React frontend through LiveKit data messages.
- Render browser screenshots in the frontend.
- Add support for complex flows involving iframes, consent dialogs, dynamic menus, and multiple tabs.
- Add pixel streaming and direct frontend browser collaboration only if remote deployment requires it.
