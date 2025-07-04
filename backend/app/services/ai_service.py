# backend/app/services/ai_service.py
import os
from openai import AzureOpenAI
from typing import List, Dict, Any, Optional
import json
from datetime import datetime

class AIService:
    def __init__(self):
        # Azure OpenAI configuration - adapted from the provided azure_openai_call.py
        self.endpoint = os.getenv(
            "AZURE_OPENAI_ENDPOINT", 
            "https://prave-mcngte2t-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4.1-nano/chat/completions?api-version=2025-01-01-preview"
        )
        self.model_name = "gpt-4.1-nano"
        self.deployment = "gpt-4.1-nano"
        self.subscription_key = os.getenv("AZURE_OPENAI_KEY", "")
        self.api_version = "2024-12-01-preview"
        
        if not self.subscription_key:
            raise ValueError("AZURE_OPENAI_KEY environment variable is required")
        
        self.client = AzureOpenAI(
            api_version=self.api_version,
            azure_endpoint=self.endpoint,
            api_key=self.subscription_key,
        )

    def _get_system_prompt(self, personality: str = "helpful") -> str:
        """Get system prompt based on user's AI personality preference."""
        prompts = {
            "helpful": "You are a helpful AI assistant for EunoiaFlow, a productivity planner app. You help users manage tasks, analyze productivity, and provide insights. Be concise but thorough.",
            "friendly": "You are a friendly AI companion in EunoiaFlow. You're enthusiastic about helping users be productive while maintaining a warm, encouraging tone.",
            "professional": "You are a professional productivity advisor in EunoiaFlow. Provide clear, actionable advice with a business-focused approach.",
            "casual": "You are a casual AI buddy in EunoiaFlow. Keep things relaxed and conversational while helping users stay organized and productive."
        }
        return prompts.get(personality, prompts["helpful"])

    async def get_chat_response(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """
        Get a response from the AI for general chat.
        """
        try:
            system_prompt = self._get_system_prompt(
                context.get("ai_personality", "helpful") if context else "helpful"
            )
            
            # Add context information to the system prompt if available
            if context:
                if context.get("user_name"):
                    system_prompt += f" The user's name is {context['user_name']}."
                if context.get("domains_of_interest"):
                    system_prompt += f" They are interested in: {', '.join(context['domains_of_interest'])}."
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ]
            
            response = self.client.chat.completions.create(
                messages=messages,
                max_completion_tokens=800,
                temperature=0.7,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0,
                model=self.deployment
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            raise Exception(f"Failed to get AI response: {str(e)}")

    async def get_task_suggestions(self, context: Dict[str, Any]) -> List[str]:
        """
        Get AI-powered task suggestions based on user's patterns.
        """
        try:
            prompt = f"""
            Based on the user's recent activity, suggest 3-5 productive tasks they might want to add to their planner.
            
            Recent tasks: {json.dumps(context.get('recent_tasks', []), indent=2)}
            Recent focus sessions: {json.dumps(context.get('recent_focus_sessions', []), indent=2)}
            
            Provide suggestions that:
            1. Complement their existing work patterns
            2. Help improve productivity
            3. Are actionable and specific
            4. Consider their focus session data
            
            Return only a simple list of task suggestions, one per line, without numbering or bullets.
            """
            
            messages = [
                {"role": "system", "content": "You are a productivity expert providing task suggestions for EunoiaFlow users."},
                {"role": "user", "content": prompt}
            ]
            
            response = self.client.chat.completions.create(
                messages=messages,
                max_completion_tokens=400,
                temperature=0.8,
                model=self.deployment
            )
            
            suggestions_text = response.choices[0].message.content.strip()
            suggestions = [line.strip() for line in suggestions_text.split('\n') if line.strip()]
            
            return suggestions[:5]  # Limit to 5 suggestions
            
        except Exception as e:
            raise Exception(f"Failed to get task suggestions: {str(e)}")

    async def analyze_productivity(self, context: Dict[str, Any]) -> str:
        """
        Analyze user's productivity patterns and provide insights.
        """
        try:
            prompt = f"""
            Analyze this user's productivity data and provide insights and recommendations:
            
            Tasks data: {json.dumps(context.get('tasks', []), indent=2)}
            Timer sessions data: {json.dumps(context.get('timer_sessions', []), indent=2)}
            
            Please provide:
            1. Key patterns you notice in their work habits
            2. Areas for improvement
            3. Specific actionable recommendations
            4. Productivity strengths to build upon
            
            Keep the analysis concise but insightful, focusing on actionable advice.
            """
            
            messages = [
                {"role": "system", "content": "You are a productivity analyst providing insights for EunoiaFlow users. Be encouraging while offering constructive feedback."},
                {"role": "user", "content": prompt}
            ]
            
            response = self.client.chat.completions.create(
                messages=messages,
                max_completion_tokens=600,
                temperature=0.6,
                model=self.deployment
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            raise Exception(f"Failed to analyze productivity: {str(e)}")

    async def get_quick_fact(self, domains: List[str]) -> str:
        """
        Get an interesting fact related to user's domains of interest.
        """
        try:
            domains_text = ", ".join(domains)
            prompt = f"""
            Share one interesting, lesser-known fact related to these domains: {domains_text}.
            
            The fact should be:
            1. Genuinely interesting and thought-provoking
            2. Recent or timeless but not widely known
            3. Relevant to someone interested in {domains_text}
            4. Concise but detailed enough to be engaging
            
            Present it as a fascinating fact someone would enjoy learning.
            """
            
            messages = [
                {"role": "system", "content": "You are a knowledgeable assistant sharing interesting facts. Make them engaging and educational."},
                {"role": "user", "content": prompt}
            ]
            
            response = self.client.chat.completions.create(
                messages=messages,
                max_completion_tokens=300,
                temperature=0.9,
                model=self.deployment
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            raise Exception(f"Failed to get quick fact: {str(e)}")

    async def help_with_task_creation(self, user_input: str) -> Dict[str, Any]:
        """
        Help users create tasks from natural language input.
        """
        try:
            prompt = f"""
            Parse this user input and extract task information: "{user_input}"
            
            Extract and return a JSON object with these fields:
            - title: Main task title (required)
            - description: Detailed description if provided
            - priority: "low", "medium", "high", or "urgent" based on language cues
            - tags: Array of relevant tags based on content
            - project: Project name if mentioned
            - due_date: If a date/time is mentioned, format as ISO datetime
            
            Example response:
            {{
                "title": "Review quarterly report",
                "description": "Go through Q3 numbers and prepare summary",
                "priority": "high",
                "tags": ["review", "quarterly"],
                "project": "Q3 Analysis",
                "due_date": null
            }}
            
            Return only the JSON object, no additional text.
            """
            
            messages = [
                {"role": "system", "content": "You are a task parsing assistant. Extract structured task information from natural language."},
                {"role": "user", "content": prompt}
            ]
            
            response = self.client.chat.completions.create(
                messages=messages,
                max_completion_tokens=300,
                temperature=0.3,
                model=self.deployment
            )
            
            response_text = response.choices[0].message.content.strip()
            # Try to parse as JSON
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                # Fallback to basic title extraction
                return {
                    "title": user_input[:100],
                    "description": None,
                    "priority": "medium",
                    "tags": [],
                    "project": None,
                    "due_date": None
                }
            
        except Exception as e:
            raise Exception(f"Failed to parse task: {str(e)}")