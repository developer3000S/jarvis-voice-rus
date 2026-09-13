import pytest

from tools import duckduckgo_search_url


def test_duckduckgo_search_url_encodes_query() -> None:
    assert (
        duckduckgo_search_url("  current weather in New York  ")
        == "https://duckduckgo.com/?q=current+weather+in+New+York"
    )


def test_duckduckgo_search_url_rejects_empty_query() -> None:
    with pytest.raises(ValueError, match="query cannot be empty"):
        duckduckgo_search_url("  ")
