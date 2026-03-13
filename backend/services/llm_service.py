import os
import json
from google.generativeai import GenerativeModel
import google.generativeai as genai
from anthropic import Anthropic
from openai import OpenAI

class LLMService:
    def __init__(self, user_preferred: str = "gemini"):
        self.preferred = user_preferred
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.claude_key = os.getenv("ANTHROPIC_API_KEY")
        self.gpt_key = os.getenv("OPENAI_API_KEY")
    
    def set_keys(self, gemini=None, claude=None, gpt=None):
        if gemini: self.gemini_key = gemini
        if claude: self.claude_key = claude
        if gpt: self.gpt_key = gpt

    def extract_json_safely(self, text):
        import re, json
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try: return json.loads(match.group())
            except: pass
        return None

    async def generate(self, prompt: str, system: str = "") -> dict:
        providers = self._get_provider_order()
        last_error = "No API keys configured"
        for provider in providers:
            try:
                response_text = await self._call_provider(provider, prompt, system)
                parsed = self.extract_json_safely(response_text)
                if parsed:
                    parsed["provider"] = provider
                    return parsed
                else:
                    return {"text": response_text, "provider": provider}
            except Exception as e:
                last_error = str(e)
                continue
        return {"error": last_error, "provider": "none"}
    
    def _get_provider_order(self):
        all_providers = ['gemini', 'claude', 'gpt']
        return [self.preferred] + [p for p in all_providers if p != self.preferred]
    
    async def _call_provider(self, provider: str, prompt: str, system: str) -> str:
        if provider == 'gemini' and self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            model = genai.GenerativeModel('gemini-1.5-pro')
            combined_prompt = f"{system}\n\n{prompt}" if system else prompt
            # gemini natively supports generate_content but sync; we await mockingly or natively
            response = model.generate_content(combined_prompt)
            return response.text
        
        elif provider == 'claude' and self.claude_key:
            client = Anthropic(api_key=self.claude_key)
            # system prompt in Claude uses system parameter
            message = client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=500,
                system=system or "You are a compassionate mental health AI.",
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
        
        elif provider == 'gpt' and self.gpt_key:
            client = OpenAI(api_key=self.gpt_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system or "You are a compassionate mental health AI."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500
            )
            return response.choices[0].message.content
        
        raise Exception(f"Provider {provider} API key not found")

# Pre-defined Prompts
class Prompts:
    DAILY_INSIGHT_SYS = "You are MindPulse AI, a compassionate mental health monitoring assistant. Your tone is warm, supportive, and non-alarming. Never be clinical or scary. Max 3 sentences."
    DAILY_INSIGHT = """User: {name}
Today's mental health signals:
- Overall Risk Score: {score}/100 (Trend: {trend})
- Voice Health: {voice_score}/100
- Sleep Quality: {sleep_score}/100  
- Social Behavior: {behavior_score}/100
- Today's Check-in Mood: {checkin_mood}/5
- Dominant concern: {dominant_signal}

Generate a warm daily insight. If score > 70, gently suggest professional support. End with one actionable suggestion.
Must return pure JSON format with NO markdown wrapping: {{"insight": "...", "actions": ["...", "...", "..."]}}"""

    CHECKIN_SYS = """You are a supportive mental health companion. Respond warmly to user mood check-ins. Never give medical advice. Detect absolutist language (always/never/nothing/everything/everyone) and gently reframe it. Max 2 sentences."""
    CHECKIN = """User just checked in:
Mood: {mood}/5 ({mood_emoji})
Energy: {energy}/10
Anxiety: {anxiety}/10
Notes: "{notes}"
Their 7-day risk trend: {trend}

Respond warmly and personally to their check-in. If notes contain absolutist language, gently reframe.
Must return pure JSON format with NO markdown wrapping: {{"response": "...", "absolutist_detected": true/false}}"""

    VOICE_SYS = """You are a clinical voice biomarker analyst for MindPulse. Provide evidence-based but accessible insights. Never be alarming. Max 2 sentences."""
    VOICE = """Voice analysis results for {name}:
- Pitch variability: {pitch} (baseline: 50.0)
- Speech pace: {pace} WPM (baseline: 120.0)  
- Vocal jitter: {jitter}
- Monotonicity index: {monotonicity}%
- Pause frequency: {pauses}

Generate a brief, accessible insight about what these patterns may indicate. Be supportive, not alarming.
Must return pure JSON format with NO markdown wrapping: {{"insight": "...", "voice_score": {score}}}"""
    
    CLINICAL_SYS = """You are a clinical AI assistant generating professional mental health monitoring reports for licensed clinicians. Be precise, evidence-based, and clinically appropriate."""
    CLINICAL = """Generate a structured clinical report for:
Patient: {name}, Age: {age}
Monitoring period: {days} days

Risk Score History: {risk_history}
Voice Analysis Trend: {voice_trend}
Sleep Pattern Data: {sleep_data}
Behavioral Signals: {behavior_data}
Check-in Patterns: {checkin_summary}

Generate JSON with:
{{"executive_summary": "2 sentence overview", "signal_analysis": {{"voice": "...", "sleep": "...", "behavior": "...", "checkin": "..."}}, "risk_trajectory": "assessment paragraph", "clinical_observations": ["obs1", "obs2"], "recommended_actions": ["action1", "action2"], "urgency_level": "routine|priority|urgent"}}"""
