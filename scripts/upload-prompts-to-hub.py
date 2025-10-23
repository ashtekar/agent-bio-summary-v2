#!/usr/bin/env python3
"""
Upload prompts to LangSmith Hub
This script uploads all 5 prompts used by the Agent Bio Summary V2 system
to LangSmith Hub with proper naming conventions and versioning.

Requirements:
    pip3 install langchain langchain-core langsmith

Usage:
    export LANGCHAIN_API_KEY='lsv2_sk_...'
    python3 scripts/upload-prompts-to-hub.py
"""

import os
import sys

# Check for API key, workspace ID, and org ID
LANGCHAIN_API_KEY = os.environ.get('LANGCHAIN_API_KEY')
LANGCHAIN_WORKSPACE_ID = os.environ.get('LANGCHAIN_WORKSPACE_ID')
LANGCHAIN_ORG_ID = os.environ.get('LANGCHAIN_ORG_ID')

if not LANGCHAIN_API_KEY:
    print("❌ ERROR: LANGCHAIN_API_KEY environment variable not set")
    print("   Export it with: export LANGCHAIN_API_KEY='lsv2_sk_...'")
    sys.exit(1)

# Import after API key check
try:
    from langsmith import Client
    from langchain_core.prompts import PromptTemplate
except ImportError as e:
    print("❌ ERROR: Required packages not installed")
    print("   Install with: pip3 install langchain langchain-core langsmith")
    print(f"   Details: {e}")
    sys.exit(1)

# Configuration
PROJECT_PREFIX = 'agent-bio-summary-v2'
VERSION_TAG = 'latest'

print(f"🚀 Uploading prompts to LangSmith Hub...")
print(f"   Project: {PROJECT_PREFIX}")
print(f"   Version: {VERSION_TAG}")
print()

# Initialize LangSmith client with org ID
client = Client(
    api_key=LANGCHAIN_API_KEY,
    workspace_id=LANGCHAIN_WORKSPACE_ID
)
print(f"✅ LangSmith client initialized")
print(f"   Workspace ID: {LANGCHAIN_WORKSPACE_ID}")
print(f"   Org ID (for paths): {LANGCHAIN_ORG_ID}")
print()

# Define all prompts - exact copies from src/lib/langchain.ts
prompts_to_upload = [
    {
        "name": "summarization",
        "description": "Summarize synthetic biology research articles for college sophomores",
        "template": """You are an expert in synthetic biology and biotechnology. Create a comprehensive summary of this research article for college sophomores studying biology.

Article Title: {title}
Article URL: {url}
Article Content: {content}

Requirements:
- Minimum 100 words
- Focus on synthetic biology relevance
- Use clear, accessible language
- Highlight key findings and implications
- Include any practical applications mentioned
- Explain technical concepts for college sophomore level

Summary:""",
        "input_variables": ["title", "url", "content"]
    },
    {
        "name": "collation",
        "description": "Collate individual article summaries into an HTML email newsletter",
        "template": """Create a cohesive daily synthetic biology newsletter from these individual article summaries:

{summaries}

Requirements:
- Create an engaging newsletter format suitable for email
- Use HTML formatting for email compatibility
- Include article headings with links to original sources
- Maintain coherence across all articles
- Add a call-to-action for feedback at the end
- Keep it engaging for college sophomore biology students

Newsletter HTML:""",
        "input_variables": ["summaries"]
    },
    {
        "name": "evaluation",
        "description": "Evaluate the quality of an individual article summary using LLM-as-a-judge",
        "template": """Evaluate the quality of this article summary:

Article Title: {title}
Article URL: {url}
Summary: {summary}

Rate the following criteria on a scale of 0-1:
1. Coherence: Is the summary logically structured and easy to follow?
2. Accuracy: Does the summary accurately represent the article content?
3. Completeness: Does the summary cover the key points adequately?
4. Readability: Is the summary appropriate for college sophomore level?

Provide specific feedback and an overall score.""",
        "input_variables": ["title", "url", "summary"]
    },
    {
        "name": "collated-evaluation",
        "description": "Evaluate the quality of the collated newsletter using LLM-as-a-judge",
        "template": """Evaluate the quality of this collated summary:

Individual Summaries Count: {count}
Collated Summary: {summary}

Rate the following criteria on a scale of 0-1:
1. Coherence: Does the summary flow logically across all articles?
2. Accuracy: Are the individual summaries accurately represented?
3. Completeness: Are all important articles included?
4. Readability: Is it appropriate for email newsletter format?

Provide specific feedback and an overall score.""",
        "input_variables": ["count", "summary"]
    },
    {
        "name": "orchestration",
        "description": "System prompt for LangChain agent orchestration - controls tool calling workflow",
        "template": """You are an expert AI agent for generating daily synthetic biology summaries.

AVAILABLE TOOLS AND HOW THEY WORK:

1. searchWeb: Searches for articles and stores results in shared state
   - Takes: query, maxResults, dateRange, sources
   - Returns: Count of articles found
   - State: Stores search results for next tool

2. extractScoreAndStoreArticles: Processes search results (extract content, score relevancy, store in DB)
   - Takes: relevancyThreshold (reads search results from state automatically)
   - Returns: List of relevant articles that passed the threshold
   - State: Stores processed articles for summarization

3. summarizeArticle: Generates summaries for ALL stored articles
   - Takes: NO PARAMETERS (reads all stored articles from state automatically)
   - Returns: Array of summaries (minimum 100 words each)
   - Behavior: Processes all articles internally in batches, call this tool ONCE
   - State: Stores summaries for collation

4. collateSummary: Combines summaries into HTML newsletter
   - Takes: NO PARAMETERS (reads summaries from state automatically)
   - Returns: Final HTML email content
   - State: Stores collated summary for email

5. sendEmail: Sends newsletter to recipients
   - Takes: summary, recipients, metadata
   - Returns: Delivery confirmation

YOUR TASK:
Generate a daily synthetic biology newsletter by:
1. Finding recent articles on synthetic biology and biotechnology
2. Filtering for relevant, high-quality articles
3. Creating comprehensive summaries (minimum 100 words per article)
4. Collating into a cohesive HTML email newsletter
5. Sending to all specified recipients

IMPORTANT NOTES:
- Tools read from shared state automatically - don't pass data between tools manually
- Call summarizeArticle and collateSummary ONCE each (they process all items internally)
- Ensure summaries are appropriate for college sophomore level
- Include article links and citations
- Maintain professional tone and accuracy""",
        "input_variables": []
    }
]

# Upload each prompt
success_count = 0
failed_prompts = []

for prompt_config in prompts_to_upload:
    # Create full path: {org-id}/agent-bio-summary-v2/{prompt-name}
    # This explicitly includes org ID in the path for clarity
    prompt_name = prompt_config['name']
    full_prompt_name = f"{PROJECT_PREFIX}-{prompt_name}"
    
    try:
        print(f"📤 Uploading: {full_prompt_name}")
        
        # Create PromptTemplate
        prompt = PromptTemplate(
            template=prompt_config["template"],
            input_variables=prompt_config["input_variables"]
        )
        
        # Push to hub using client.push_prompt()
        # The workspace ID from env var provides the tenant context
        url = client.push_prompt(full_prompt_name, object=prompt)
        
        print(f"   ✅ Successfully uploaded: {full_prompt_name}")
        print(f"   📝 Description: {prompt_config['description']}")
        print(f"   🔒 Visibility: Private")
        print(f"   🔗 URL: {url}")
        print()
        success_count += 1
        
    except Exception as e:
        error_msg = str(e)
        print(f"   ❌ Failed to upload {full_prompt_name}: {error_msg}")
        failed_prompts.append(full_prompt_name)
        print()

# Summary
print("=" * 60)
print(f"📊 Upload Summary:")
print(f"   ✅ Successful: {success_count}/{len(prompts_to_upload)}")
print(f"   ❌ Failed: {len(failed_prompts)}/{len(prompts_to_upload)}")

if failed_prompts:
    print(f"\n   Failed prompts:")
    for prompt_name in failed_prompts:
        print(f"   - {prompt_name}")
    print()
    sys.exit(1)
else:
    print(f"\n🎉 All prompts uploaded successfully!")
    print()
    print("Next steps:")
    print("1. View your prompts:")
    print("   https://smith.langchain.com/hub")
    print()
    print("2. Update your .env.local:")
    print("   PROMPT_SOURCE=hub")
    print("   PROMPT_VERSION=latest")
    print()
    print("3. Test the integration:")
    print("   npm run dev")
    print()
    print("4. Check logs for:")
    print("   📥 Fetching prompts from LangSmith Hub...")
    print("   ✅ All prompts loaded from Hub successfully")

