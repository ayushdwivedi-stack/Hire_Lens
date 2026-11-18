import asyncio
import json
import logging
from typing import Any

import httpx

from ..config import settings
from ..prompts.analysis_prompt import SYSTEM_PROMPT, build_analysis_prompt
from ..schemas.responses import AnalysisResult


logger = logging.getLogger(__name__)


class AIService:
    async def analyze(self, resume_text: str, job_description: str) -> dict:
        provider = settings.AI_PROVIDER.lower().strip()

        if provider == "ollama":
            return await self._analyze_with_ollama(
                resume_text,
                job_description,
            )

        if provider == "openai":
            return await self._analyze_with_openai(
                resume_text,
                job_description,
            )

        raise ValueError(
            f"Unsupported AI provider: {settings.AI_PROVIDER}"
        )

    async def _analyze_with_ollama(
        self,
        resume_text: str,
        job_description: str,
    ) -> dict:
        prompt = build_analysis_prompt(
            resume_text,
            job_description,
        )

        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            "stream": False,
            "think": False,
            "format": AnalysisResult.model_json_schema(),
            "options": {
                "temperature": 0.2,
            },
        }

        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat"

        max_attempts = 2

        for attempt in range(max_attempts):
            try:
                async with httpx.AsyncClient(
                    timeout=settings.OLLAMA_TIMEOUT_SECONDS
                ) as client:
                    response = await client.post(
                        url,
                        json=payload,
                    )

                response.raise_for_status()

                data: dict[str, Any] = response.json()

                message = data.get("message")

                if not isinstance(message, dict):
                    raise ValueError(
                        "Ollama returned an unexpected response."
                    )

                raw = message.get("content")

                if not isinstance(raw, str) or not raw.strip():
                    raise ValueError(
                        "Ollama returned an empty analysis."
                    )

                try:
                    result = json.loads(raw)
                except json.JSONDecodeError as exc:
                    logger.error(
                        "Ollama returned invalid JSON: %s",
                        exc,
                    )
                    raise ValueError(
                        "The local AI returned invalid JSON. Please try again."
                    ) from exc

                if not isinstance(result, dict):
                    raise ValueError(
                        "The local AI returned an unexpected response format."
                    )

                return result

            except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
                logger.warning(
                    "Unable to connect to Ollama (attempt %s/%s).",
                    attempt + 1,
                    max_attempts,
                )

                if attempt + 1 == max_attempts:
                    raise ValueError(
                        "Ollama is not running. Start Ollama and try again."
                    ) from exc

                await asyncio.sleep(1)

            except httpx.TimeoutException as exc:
                logger.warning(
                    "Ollama request timed out (attempt %s/%s).",
                    attempt + 1,
                    max_attempts,
                )

                if attempt + 1 == max_attempts:
                    raise ValueError(
                        "The local AI request timed out. Please try again."
                    ) from exc

                await asyncio.sleep(1)

            except httpx.HTTPStatusError as exc:
                logger.error(
                    "Ollama returned HTTP %s: %s",
                    exc.response.status_code,
                    exc.response.text,
                )
                raise ValueError(
                    "Ollama could not process the analysis request."
                ) from exc

        raise ValueError("Unable to complete the local AI analysis.")

    async def _analyze_with_openai(
        self,
        resume_text: str,
        job_description: str,
    ) -> dict:
        try:
            from openai import (
                APIError,
                APITimeoutError,
                AsyncOpenAI,
                RateLimitError,
            )
        except ImportError as exc:
            raise ValueError(
                "The OpenAI package is not installed."
            ) from exc

        if not settings.OPENAI_API_KEY:
            raise ValueError(
                "OpenAI API key is not configured."
            )

        client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.OPENAI_TIMEOUT_SECONDS,
        )

        prompt = build_analysis_prompt(
            resume_text,
            job_description,
        )

        try:
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                response_format={"type": "json_object"},
                temperature=0.2,
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
            )

            if not response.choices:
                raise ValueError(
                    "OpenAI returned an empty response."
                )

            raw = response.choices[0].message.content

            if not raw:
                raise ValueError(
                    "OpenAI returned an empty analysis."
                )

            try:
                result = json.loads(raw)
            except json.JSONDecodeError as exc:
                logger.error(
                    "OpenAI returned invalid JSON: %s",
                    exc,
                )
                raise ValueError(
                    "The AI returned invalid JSON. Please try again."
                ) from exc

            if not isinstance(result, dict):
                raise ValueError(
                    "The AI returned an unexpected response format."
                )

            return result

        except RateLimitError as exc:
            raise ValueError(
                "OpenAI rate limit reached. Please try again later."
            ) from exc

        except APITimeoutError as exc:
            raise ValueError(
                "OpenAI request timed out. Please try again."
            ) from exc

        except APIError as exc:
            logger.error("OpenAI API error: %s", exc)
            raise ValueError(
                "The AI service is temporarily unavailable."
            ) from exc

        finally:
            await client.close()


_ai_service = AIService()
