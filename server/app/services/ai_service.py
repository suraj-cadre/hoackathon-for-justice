import json
import logging
from typing import Optional, List

import httpx
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.ollama_url = settings.OLLAMA_BASE_URL
        self.chat_model = settings.OLLAMA_CHAT_MODEL
        self.embed_model = settings.OLLAMA_EMBED_MODEL
        self._openai_client = None

    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
    ) -> str:
        model = model or self.chat_model

        # Try Ollama first
        try:
            return await self._ollama_generate(prompt, model, system_prompt, temperature)
        except Exception as e:
            logger.warning(f"Ollama generate failed: {e}")
            if settings.OPENAI_API_KEY:
                logger.info("Falling back to OpenAI")
                return await self._openai_generate(prompt, model, system_prompt, temperature)
            raise

    async def embed(self, text: str, model: Optional[str] = None) -> List[float]:
        model = model or self.embed_model

        # Try Ollama first
        try:
            return await self._ollama_embed(text, model)
        except Exception as e:
            logger.warning(f"Ollama embed failed: {e}")
            if settings.OPENAI_API_KEY:
                logger.info("Falling back to OpenAI embeddings")
                return self._openai_embed(text)
            raise

    async def _ollama_generate(
        self,
        prompt: str,
        model: str,
        system_prompt: Optional[str],
        temperature: float,
    ) -> str:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature},
        }
        if system_prompt:
            payload["system"] = system_prompt

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(f"{self.ollama_url}/api/generate", json=payload)
            resp.raise_for_status()
            return resp.json().get("response", "")

    async def _ollama_embed(self, text: str, model: str) -> List[float]:
        payload = {"model": model, "input": text}
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.ollama_url}/api/embed", json=payload)
            resp.raise_for_status()
            data = resp.json()
            embeddings = data.get("embeddings", [])
            if embeddings:
                return embeddings[0]
            return []

    async def _openai_generate(
        self,
        prompt: str,
        model: str,
        system_prompt: Optional[str],
        temperature: float,
    ) -> str:
        client = self._get_openai_client()
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=temperature,
        )
        return response.choices[0].message.content or ""

    def _openai_embed(self, text: str) -> List[float]:
        client = self._get_openai_client()
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        return response.data[0].embedding

    def _get_openai_client(self) -> OpenAI:
        if not self._openai_client:
            self._openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        return self._openai_client


ai_service = AIService()
