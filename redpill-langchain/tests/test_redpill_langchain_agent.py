# test/test_verifiable_langchain_agent.py

import os
import pytest
from dotenv import load_dotenv
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

from verifiable_langchain_agent import ChatRedpill

# Load environment variables from .env file
load_dotenv()


@pytest.fixture
def setup_agent():
    # Access the environment variables
    tavily_api_key = os.getenv("TAVILY_API_KEY")
    redpill_api_key = os.getenv("REDPILL_API_KEY")

    # Ensure the environment variables are set for the test
    assert tavily_api_key is not None, "TAVILY_API_KEY environment variable is missing"
    assert redpill_api_key is not None, "REDPILL_API_KEY environment variable is missing"

    # Create the agent with memory and tools
    memory = MemorySaver()
    model = ChatRedpill(model="gpt-4o", redpill_api_key=redpill_api_key)
    search = TavilySearchResults(max_results=2)
    tools = [search]
    agent_executor = create_react_agent(model, tools, checkpointer=memory)

    return agent_executor


def test_agent_interaction(setup_agent):
    agent_executor = setup_agent
    config = {"configurable": {"thread_id": "abc123"}}

    # First interaction
    response_1 = list(agent_executor.stream(
        {"messages": [HumanMessage(content="hi im bob! and i live in sf")]}, config
    ))[-1]['agent']['messages']

    # Assertions for first interaction
    assert len(response_1) > 0, "Agent did not produce any output for first interaction"
    assert "bob" in response_1[-1].content.lower(), "Expected agent response to mention 'bob'"

    # Second interaction
    response_2 = list(agent_executor.stream(
        {"messages": [HumanMessage(content="whats the weather where I live? Mention weather explicitly.")]}, config
    ))[-1]['agent']['messages']


    # Assertions for second interaction
    assert len(response_2) > 0, "Agent did not produce any output for second interaction"
    assert "weather" in response_2[-1].content.lower(), "Expected agent response to mention 'weather'"

    # Optional print for debugging
    print("First response chunks:", response_1)
    print("Second response chunks:", response_2)
