"""LLM Service using Google Gemini via the google-genai SDK.

Replaces the previous OpenAI client. Keeps the exact same interface
(stream_response / generate_text) so no API routes or business logic change.
"""
from typing import AsyncGenerator
from google import genai
from app.config.settings import settings
from app.services.prompt_templates import get_system_prompt


class LLMService:
    def __init__(self):
        self._client = None
        self.model = settings.GEMINI_MODEL

    @property
    def client(self) -> genai.Client:
        if self._client is None:
            if not settings.GEMINI_API_KEY:
                raise ValueError(
                    "Gemini API key not configured. "
                    "Set GEMINI_API_KEY in your .env file or environment variables."
                )
            self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
        return self._client

    @property
    def async_client(self):
        return self.client.aio

    def _build_contents(
        self, messages: list[dict], mode: str, user_context: dict | None
    ) -> tuple[str, list[dict]]:
        """Build Gemini contents array from messages list.

        Returns (system_prompt, contents) where contents is a list of
        {"role": "user"|"model", "parts": [{"text": ...}]} dicts.
        """
        system_prompt = get_system_prompt(mode, user_context)

        contents = []
        for m in messages:
            if m["role"] in ("user", "assistant"):
                contents.append({
                    "role": "user" if m["role"] == "user" else "model",
                    "parts": [{"text": m["content"]}],
                })
        return system_prompt, contents

    async def stream_response(
        self,
        messages: list[dict],
        mode: str = "general",
        user_context: dict | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream AI response tokens one by one using Gemini."""
        system_prompt, contents = self._build_contents(messages, mode, user_context)

        if not contents:
            contents = [{"role": "user", "parts": [{"text": "Hello"}]}]

        try:
            response = await self.async_client.models.generate_content_stream(
                model=self.model,
                contents=contents,
                config={
                    "system_instruction": system_prompt,
                    "max_output_tokens": settings.GEMINI_MAX_TOKENS,
                    "temperature": settings.GEMINI_TEMPERATURE,
                },
            )

            async for chunk in response:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            yield f"\n\n> **Error**: Unable to generate response. Please check your API key and try again.\n> Details: {str(e)}"

    async def generate_text(
        self,
        messages: list[dict],
        mode: str = "general",
        user_context: dict | None = None,
    ) -> str:
        """Generate complete text response (non-streaming) using Gemini."""
        system_prompt, contents = self._build_contents(messages, mode, user_context)

        if not contents:
            contents = [{"role": "user", "parts": [{"text": "Hello"}]}]

        try:
            response = await self.async_client.models.generate_content(
                model=self.model,
                contents=contents,
                config={
                    "system_instruction": system_prompt,
                    "max_output_tokens": settings.GEMINI_MAX_TOKENS,
                    "temperature": settings.GEMINI_TEMPERATURE,
                },
            )
            return response.text or ""
        except Exception as e:
            return f"Error generating response: {str(e)}"


llm_service = LLMService()