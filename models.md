# Text generation models

Models for **AI sentence generation** in this app. Lists were fetched from each provider’s public API. Availability and pricing change often — use the refresh commands at the bottom.

**Project env vars**

| Provider | API key | Model override |
| --- | --- | --- |
| Gemini (direct) | `VITE_GEMINI_API_KEY` | `VITE_GEMINI_MODEL` — default `gemini-flash-latest` |
| OpenRouter | `VITE_OPENROUTER_API_KEY` | `VITE_OPENROUTER_MODEL` — default `google/gemini-2.0-flash-001` |

OpenRouter model IDs use the form `provider/model` (e.g. `openai/gpt-4o-mini`). Browse all models at [openrouter.ai/models](https://openrouter.ai/models).

---

## Google AI Studio (Gemini)

Endpoint: `POST …/v1beta/models/{model}:generateContent`  
Keys: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

| Model ID | Display name | Notes |
| --- | --- | --- |
| `gemini-flash-latest` | Gemini Flash Latest | **App default (direct Gemini)** — alias to current Flash |
| `gemini-flash-lite-latest` | Gemini Flash-Lite Latest | Alias to current Flash-Lite; faster / cheaper |
| `gemini-pro-latest` | Gemini Pro Latest | Alias to current Pro |
| `gemini-2.5-flash` | Gemini 2.5 Flash | Stable; up to ~1M token context |
| `gemini-2.5-flash-lite` | Gemini 2.5 Flash-Lite | Stable lite tier |
| `gemini-2.5-pro` | Gemini 2.5 Pro | Stronger reasoning |
| `gemini-2.0-flash` | Gemini 2.0 Flash | Previous-gen Flash |
| `gemini-2.0-flash-001` | Gemini 2.0 Flash 001 | Pinned 2.0 Flash build |
| `gemini-2.0-flash-lite` | Gemini 2.0 Flash-Lite | Previous-gen lite |
| `gemini-2.0-flash-lite-001` | Gemini 2.0 Flash-Lite 001 | Pinned 2.0 Flash-Lite build |
| `gemini-3-flash-preview` | Gemini 3 Flash Preview | Preview |
| `gemini-3-pro-preview` | Gemini 3 Pro Preview | Preview |
| `gemini-3.1-flash-lite` | Gemini 3.1 Flash Lite | 3.1 lite |
| `gemini-3.1-flash-lite-preview` | Gemini 3.1 Flash Lite Preview | Preview |
| `gemini-3.1-pro-preview` | Gemini 3.1 Pro Preview | Preview |
| `gemini-3.1-pro-preview-customtools` | Gemini 3.1 Pro Preview Custom Tools | Preview; tool-oriented |
| `gemma-4-26b-a4b-it` | Gemma 4 26B A4B IT | Open Gemma (instruction-tuned) |
| `gemma-4-31b-it` | Gemma 4 31B IT | Open Gemma (instruction-tuned) |
| `deep-research-preview-04-2026` | Deep Research Preview | Research agent; not typical worksheets |
| `deep-research-max-preview-04-2026` | Deep Research Max Preview | Research agent |
| `deep-research-pro-preview-12-2025` | Deep Research Pro Preview | Research agent |
| `gemini-2.5-computer-use-preview-10-2025` | Gemini 2.5 Computer Use Preview | UI/automation agent |

*Excluded:* image (`imagen-*`, `*-image*`), video (`veo-*`), audio/TTS/live, embeddings, robotics.

---

## OpenRouter

Endpoint: `POST https://openrouter.ai/api/v1/chat/completions` (OpenAI-compatible)  
Keys: [openrouter.ai/keys](https://openrouter.ai/keys)

OpenRouter hosts **350+** text-capable models from many providers. The tables below are a curated subset for handwriting worksheets (JSON-friendly chat models). Not every model supports `response_format: { type: "json_object" }` — if generation fails, try another model.

### Recommended

Good balance of quality, speed, and cost for short children’s sentences.

| Model ID | Name | Context | Notes |
| --- | --- | --- | --- |
| `anthropic/claude-3.5-haiku` | Anthropic: Claude 3.5 Haiku | 200,000 | ~$0.80/M input |
| `anthropic/claude-haiku-4.5` | Anthropic: Claude Haiku 4.5 | 200,000 | ~$1.00/M input |
| `anthropic/claude-sonnet-4.6` | Anthropic: Claude Sonnet 4.6 | 1,000,000 | ~$3.00/M input |
| `deepseek/deepseek-chat-v3.1` | DeepSeek: DeepSeek V3.1 | 163,840 | ~$0.21/M input |
| `deepseek/deepseek-r1-0528` | DeepSeek: R1 0528 | 163,840 | ~$0.50/M input |
| `google/gemini-2.0-flash-001` | Google: Gemini 2.0 Flash | 1,048,576 | **App default (OpenRouter)** — ~$0.10/M input |
| `google/gemini-2.0-flash-lite-001` | Google: Gemini 2.0 Flash Lite | 1,048,576 | ~$0.07/M input |
| `google/gemini-2.5-flash` | Google: Gemini 2.5 Flash | 1,048,576 | ~$0.30/M input |
| `google/gemini-2.5-flash-lite` | Google: Gemini 2.5 Flash Lite | 1,048,576 | ~$0.10/M input |
| `google/gemini-2.5-pro` | Google: Gemini 2.5 Pro | 1,048,576 | ~$1.25/M input |
| `google/gemini-3-flash-preview` | Google: Gemini 3 Flash Preview | 1,048,576 | ~$0.50/M input |
| `google/gemini-3.1-flash-lite` | Google: Gemini 3.1 Flash Lite | 1,048,576 | ~$0.25/M input |
| `google/gemini-3.1-pro-preview` | Google: Gemini 3.1 Pro Preview | 1,048,576 | ~$2.00/M input |
| `meta-llama/llama-3.3-70b-instruct` | Meta: Llama 3.3 70B Instruct | 131,072 | ~$0.10/M input |
| `meta-llama/llama-4-maverick` | Meta: Llama 4 Maverick | 1,048,576 | ~$0.15/M input |
| `meta-llama/llama-4-scout` | Meta: Llama 4 Scout | 10,000,000 | ~$0.08/M input |
| `mistralai/ministral-8b-2512` | Mistral: Ministral 3 8B 2512 | 262,144 | ~$0.15/M input |
| `mistralai/mistral-small-3.2-24b-instruct` | Mistral: Mistral Small 3.2 24B | 128,000 | ~$0.07/M input |
| `openai/gpt-4.1-mini` | OpenAI: GPT-4.1 Mini | 1,047,576 | ~$0.40/M input |
| `openai/gpt-4.1-nano` | OpenAI: GPT-4.1 Nano | 1,047,576 | ~$0.10/M input |
| `openai/gpt-4o-mini` | OpenAI: GPT-4o-mini | 128,000 | ~$0.15/M input |
| `openai/gpt-5-mini` | OpenAI: GPT-5 Mini | 400,000 | ~$0.25/M input |
| `openai/gpt-5-nano` | OpenAI: GPT-5 Nano | 400,000 | ~$0.05/M input |
| `openai/gpt-5.4-mini` | OpenAI: GPT-5.4 Mini | 400,000 | ~$0.75/M input |
| `openai/gpt-5.5` | OpenAI: GPT-5.5 | 1,050,000 | ~$5.00/M input |
| `qwen/qwen3-32b` | Qwen: Qwen3 32B | 131,072 | ~$0.08/M input |
| `qwen/qwen3.5-flash-02-23` | Qwen: Qwen3.5-Flash | 1,000,000 | ~$0.07/M input |
| `qwen/qwen3.6-flash` | Qwen: Qwen3.6 Flash | 1,000,000 | ~$0.19/M input |

### Free tier (`:free`)

No per-token charge on OpenRouter’s free tier (rate limits apply).

| Model ID | Name | Context | Notes |
| --- | --- | --- | --- |
| `arcee-ai/trinity-large-thinking:free` | Arcee AI: Trinity Large Thinking (free) | 262,144 | Free tier |
| `baidu/cobuddy:free` | Baidu Qianfan: CoBuddy (free) | 131,072 | Free tier |
| `cognitivecomputations/dolphin-mistral-24b-venice-edition:free` | Venice: Uncensored (free) | 32,768 | Free tier |
| `deepseek/deepseek-v4-flash:free` | DeepSeek: DeepSeek V4 Flash (free) | 1,048,576 | Free tier |
| `google/gemma-4-26b-a4b-it:free` | Google: Gemma 4 26B A4B  (free) | 262,144 | Free tier |
| `google/gemma-4-31b-it:free` | Google: Gemma 4 31B (free) | 262,144 | Free tier |
| `liquid/lfm-2.5-1.2b-instruct:free` | LiquidAI: LFM2.5-1.2B-Instruct (free) | 32,768 | Free tier |
| `liquid/lfm-2.5-1.2b-thinking:free` | LiquidAI: LFM2.5-1.2B-Thinking (free) | 32,768 | Free tier |
| `meta-llama/llama-3.2-3b-instruct:free` | Meta: Llama 3.2 3B Instruct (free) | 131,072 | Free tier |
| `meta-llama/llama-3.3-70b-instruct:free` | Meta: Llama 3.3 70B Instruct (free) | 131,072 | Free tier |
| `minimax/minimax-m2.5:free` | MiniMax: MiniMax M2.5 (free) | 204,800 | Free tier |
| `nousresearch/hermes-3-llama-3.1-405b:free` | Nous: Hermes 3 405B Instruct (free) | 131,072 | Free tier |
| `nvidia/nemotron-3-nano-30b-a3b:free` | NVIDIA: Nemotron 3 Nano 30B A3B (free) | 256,000 | Free tier |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | NVIDIA: Nemotron 3 Nano Omni (free) | 256,000 | Free tier |
| `nvidia/nemotron-3-super-120b-a12b:free` | NVIDIA: Nemotron 3 Super (free) | 1,000,000 | Free tier |
| `nvidia/nemotron-nano-12b-v2-vl:free` | NVIDIA: Nemotron Nano 12B 2 VL (free) | 128,000 | Free tier |
| `nvidia/nemotron-nano-9b-v2:free` | NVIDIA: Nemotron Nano 9B V2 (free) | 128,000 | Free tier |
| `openai/gpt-oss-120b:free` | OpenAI: gpt-oss-120b (free) | 131,072 | Free tier |
| `openai/gpt-oss-20b:free` | OpenAI: gpt-oss-20b (free) | 131,072 | Free tier |
| `poolside/laguna-m.1:free` | Poolside: Laguna M.1 (free) | 131,072 | Free tier |
| `poolside/laguna-xs.2:free` | Poolside: Laguna XS.2 (free) | 131,072 | Free tier |
| `qwen/qwen3-coder:free` | Qwen: Qwen3 Coder 480B A35B (free) | 1,048,576 | Free tier |
| `qwen/qwen3-next-80b-a3b-instruct:free` | Qwen: Qwen3 Next 80B A3B Instruct (free) | 262,144 | Free tier |
| `z-ai/glm-4.5-air:free` | Z.ai: GLM 4.5 Air (free) | 131,072 | Free tier |

*Excluded from OpenRouter tables:* embeddings, speech (Whisper), TTS, and image-only models. Full catalog: [openrouter.ai/models](https://openrouter.ai/models).

---

## Refresh these lists

```bash
# Gemini — models with generateContent (text)
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$VITE_GEMINI_API_KEY" \
  | jq -r '.models[] | select(.supportedGenerationMethods[]? == "generateContent") | .name | sub("models/";"")'

# OpenRouter — all model IDs (filter in jq as needed)
curl -s "https://openrouter.ai/api/v1/models" \
  | jq -r '.data[] | .id' | sort

# OpenRouter — free text models only
curl -s "https://openrouter.ai/api/v1/models" \
  | jq -r '.data[] | select(.id | endswith(":free")) | .id' | sort
```
