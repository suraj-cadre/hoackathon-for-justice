import logging
from typing import Optional, List

from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.chat_model = settings.OPENAI_CHAT_MODEL
        self.embed_model = settings.OPENAI_EMBED_MODEL
        self._client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
    ) -> str:
        model = model or self.chat_model
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = self._client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
        )
        return response.choices[0].message.content or ""

    async def embed(self, text: str, model: Optional[str] = None) -> List[float]:
        model = model or self.embed_model
        response = self._client.embeddings.create(
            model=model,
            input=text,
        )
        return response.data[0].embedding


ai_service = AIService()
