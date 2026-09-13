from prompts import AGENT_ISNTRUCTIONS


def test_named_websites_are_opened_directly() -> None:
    assert "If the user names a website, service, or domain" in AGENT_ISNTRUCTIONS
    assert "Only use search_the_web when no website" in AGENT_ISNTRUCTIONS
