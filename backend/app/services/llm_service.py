import json
from typing import AsyncGenerator
from openai import AsyncOpenAI
from app.config.settings import settings
from app.services.prompt_templates import get_system_prompt


class LLMService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    async def stream_response(
        self,
        messages: list[dict],
        mode: str = "general",
        user_context: dict | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream AI response tokens one by one."""
        system_prompt = get_system_prompt(mode, user_context)

        openai_messages = [
            {"role": "system", "content": system_prompt},
            *[
                {"role": m["role"], "content": m["content"]}
                for m in messages
                if m["role"] in ("user", "assistant")
            ],
        ]

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=openai_messages,
                max_tokens=settings.OPENAI_MAX_TOKENS,
                temperature=settings.OPENAI_TEMPERATURE,
                stream=True,
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            yield f"\n\n> **Error**: Unable to generate response. Please check your API key and try again.\n> Details: {str(e)}"

    async def generate_text(
        self,
        messages: list[dict],
        mode: str = "general",
        user_context: dict | None = None,
    ) -> str:
        """Generate complete text response (non-streaming)."""
        system_prompt = get_system_prompt(mode, user_context)

        openai_messages = [
            {"role": "system", "content": system_prompt},
            *[
                {"role": m["role"], "content": m["content"]}
                for m in messages
                if m["role"] in ("user", "assistant")
            ],
        ]

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=openai_messages,
                max_tokens=settings.OPENAI_MAX_TOKENS,
                temperature=settings.OPENAI_TEMPERATURE,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            return f"Error generating response: {str(e)}"


llm_service = LLMService()