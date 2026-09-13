import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

import browser as browser_module
from browser import BrowserError, BrowserManager
from tools import BrowserTools


def test_validate_url_accepts_http_urls() -> None:
    BrowserManager._validate_url("https://example.com/path")
    BrowserManager._validate_url("http://localhost:3000")


@pytest.mark.parametrize(
    "url",
    [
        "example.com",
        "file:///tmp/page.html",
        "javascript:alert(1)",
        "https://user:password@example.com",
    ],
)
def test_validate_url_rejects_unsafe_urls(url: str) -> None:
    with pytest.raises(BrowserError):
        BrowserManager._validate_url(url)


def test_consequential_controls_require_confirmation() -> None:
    assert BrowserTools._requires_confirmation("Submit order")
    assert BrowserTools._requires_confirmation("Delete account")
    assert not BrowserTools._requires_confirmation("Search")


def test_direct_navigation_is_prioritized_over_fallback_search() -> None:
    tools = BrowserTools(BrowserManager(headless=True)).tools

    assert [tool.id for tool in tools[:2]] == ["open_url", "search_the_web"]


@pytest.mark.asyncio
async def test_visible_browser_window_is_brought_to_front(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FakePage:
        def __init__(self) -> None:
            self.titles: list[str] = []
            self.was_brought_to_front = False

        async def title(self) -> str:
            return "Original title"

        async def evaluate(self, expression: str, title: str) -> None:
            self.titles.append(title)

        async def bring_to_front(self) -> None:
            self.was_brought_to_front = True

    focused_titles: list[str] = []
    monkeypatch.setattr(
        browser_module,
        "_focus_window_with_title",
        lambda title: focused_titles.append(title) or True,
    )
    page = FakePage()

    await browser_module._bring_page_window_to_front(page)

    assert page.was_brought_to_front
    assert len(focused_titles) == 1
    assert focused_titles[0].startswith("Anfisa Browser ")
    assert page.titles == [focused_titles[0], "Original title"]


class _TestPageHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        body = b"""
        <html>
          <body>
            <label for="search">Search</label>
            <input id="search" type="search" placeholder="Search the site">
            <button>Go</button>
          </body>
        </html>
        """
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, message_format: str, *args: object) -> None:
        return


@pytest.mark.asyncio
async def test_inspect_and_interact_with_local_page() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", 0), _TestPageHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    manager = BrowserManager(headless=True)

    try:
        await manager.open_url(f"http://127.0.0.1:{server.server_port}")
        inspected = await manager.inspect_page()
        elements = inspected["elements"]

        assert isinstance(elements, list)
        assert any(element["name"] == "Search" for element in elements)
        assert any(element["name"] == "Go" for element in elements)

        await manager.type_text("Search", "LiveKit")
        await manager.click("Go")
    finally:
        await manager.close()
        server.shutdown()
        thread.join(timeout=2)
