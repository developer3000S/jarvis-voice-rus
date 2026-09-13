# QWEN.md — Project Context for Qwen Code

## Project Overview

**Anfisa Voice AI Assistant** — A LiveKit Agents project featuring a sarcastic, Russian-speaking voice assistant named "Anfisa" with browser automation capabilities via Playwright.

**Primary Stack:**
- **Runtime**: Python 3.10–3.14
- **Package Manager**: `uv` (lockfile committed)
- **Voice Platform**: LiveKit Cloud + LiveKit Agents SDK
- **LLM**: Google Gemini 3.1 Flash Live Preview (Realtime API)
- **Browser**: Playwright-managed Chromium (visible in dev, headless in prod)
- **Testing**: LiveKit Agents eval framework with pytest + LLM-as-judge

**Architecture:**
```
Frontend (React/Telephony) ── LiveKit Room ──► Agent (Gemini Realtime)
                                                      │
                                                      ▼
                                            BrowserTools (Playwright)
                                                      │
                                                      ▼
                                            Isolated Chromium per room
```

## Key Files

| File | Purpose |
|------|---------|
| `src/agent.py` | Main entrypoint: `Assistant` class, `AgentServer`, `my_agent` RTC session handler |
| `src/browser.py` | `BrowserManager`: Playwright lifecycle, navigation, inspection, interaction |
| `src/tools.py` | `BrowserTools`: 10 LiveKit function tools (`open_url`, `click`, `type_text`, etc.) |
| `src/prompts.py` | Loads Russian system prompt (`AGENT_INSTRUCTIONS`) from `prompts-agent-rus.md` |
| `tests/test_agent.py` | Evals: friendliness, grounding, harmful-request refusal |
| `tests/test_browser.py` | Unit + integration tests for browser manager and tools |
| `pyproject.toml` | Dependencies, ruff/pytest config, build metadata |
| `Dockerfile` | Production image for LiveKit Cloud deployment |

## Commands

| Task | Command |
|------|---------|
| Install deps | `uv sync` |
| Run console (voice in terminal) | `uv run python src/agent.py console` |
| Run dev (with frontend) | `uv run python src/agent.py dev` |
| Run production | `uv run python src/agent.py start` |
| Lint + format | `uv run ruff check src tests && uv run ruff format src tests` |
| Run tests (evals) | `uv run pytest` |
| Install Chromium | `uv run playwright install chromium` |

## Development Conventions

### Code Style
- **Formatter/Linter**: Ruff (line-length 88, double quotes, py39 target)
- **Imports**: Grouped (stdlib -> third-party -> local), Ruff `I` rules enforce order
- **Typing**: Type hints required; `from __future__ import annotations` in `browser.py`
- **Async**: All I/O is `async`/`await`; `asyncio.Lock` serializes browser ops

### Agent Behavior (from `prompts-agent-rus.md`)
- **Language**: Russian by default; English only if user requests
- **Format**: Plain text only — no Markdown, JSON, lists, emojis, code
- **Length**: 1-3 sentences; one question at a time
- **Persona**: Sarcastic, obliging ("мой дорогой/моя дорогая"), uses "К вашим услугам", "Рада помочь"
- **Strict Triggers** (must match exactly):
  - "Разве не так, Анфиса?" → "Да, действительно, хотя должна заметить, что Ваши вступления становятся несколько однообразными"
  - "Анфиса, ты видишь, как я снимаю это вступление?" → "Да, я вижу вашу камеру и стойку с освещением. Выглядит весьма профессионально... для списанного со счетов ютубера"
  - "Анфиса, ты здесь?" → "К вашим услугам, я слушаю Вас!"

### Browser Tools Rules
- **Direct navigation preferred**: If user names a site/domain → `open_url`, not `search_the_web`
- **Inspect first**: Call `inspect_page` before `click`/`type_text` unless target from prior inspection
- **Confirmation required**: Clicks on targets containing `buy|confirm|delete|purchase|remove|send|submit` require explicit user confirmation + `confirm_browser_action`
- **Safe URLs only**: `http(s)://` with host; rejects `file:`, `javascript:`, embedded creds

### Testing
- **Framework**: pytest + `pytest-asyncio` (function-scoped loop)
- **Eval pattern**: `AgentSession` + judge LLM (`inference.LLM(model="openai/gpt-4.1-mini")`)
- **Test types**:
  - `test_agent.py`: Behavioral evals (friendliness, grounding, safety)
  - `test_browser.py`: Unit + integration (URL validation, inspection, click/type on local HTTP server)
  - `test_prompts.py`: Prompt content assertions
  - `test_web_search.py`: DuckDuckGo URL encoding

## Environment

Required in `.env.local` (copied from `.env.example`):
```bash
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```
Loaded via `load_dotenv(".env.local")` in `agent.py`.

## LiveKit-Specific Notes

- **Realtime Model**: `google.beta.realtime.RealtimeModel` with `tool_response_scheduling=WHEN_IDLE` to avoid audio-content errors after tool calls
- **Turn Handling**: `TurnDetector` + adaptive interruptions + preemptive generation
- **Noise Cancellation**: `ai_coustics.audio_enhancement(model=QUAIL_VF_S)` (LiveKit Cloud only)
- **Video Input**: Enabled via `RoomOptions(video_input=True)` for browser screenshots
- **Deployment**: `AgentServer` + `@server.rtc_session(agent_name="assistant")` + `cli.run_app(server)`

## Project-Specific Guidance for Qwen Code

1. **Always use `uv`** for running commands — never bare `python`/`pip`
2. **Write tests first** for any agent behavior change (TDD per AGENTS.md)
3. **Keep responses in Russian** when interacting with the agent's prompt logic
4. **Run `ruff` + `pytest`** before committing
5. **Browser changes**: Test with `uv run pytest tests/test_browser.py -v`
6. **Prompt changes**: Update both `prompts-agent-rus.md` and `prompts.py` (or just the `.md` — `prompts.py` loads it at runtime)
7. **Strict trigger phrases** in the Russian prompt are contractual — do not modify wording

## Useful References

- LiveKit Agents docs: `lk docs` (CLI) or MCP server at `https://docs.livekit.io/mcp`
- AGENTS.md in this directory — primary reference for agent development
- plan.md — implementation notes for browser control feature