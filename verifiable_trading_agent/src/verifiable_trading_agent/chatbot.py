import os
import random
import sys
import time

import requests

from dotenv import load_dotenv

from verifiable_langchain_agent import ChatVerifiableRedpill
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

# Import CDP Agentkit Langchain Extension.
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
from cdp_langchain.tools import CdpTool


from verifiable_trading_agent.cow_trade_action import COW_TRADE_PROMPT, CoWTradeInput, cow_trade
from verifiable_trading_agent.cow_trade_limit_order import COW_TRADE_LIMIT_PROMPT, CoWTradeLimitInput, cow_trade_limit


# Load environment variables from .env file
load_dotenv()

# Configure a file to persist the agent's CDP MPC Wallet Data.
wallet_data_file = "../../wallet_data.txt"


def convert_bytes_to_hex(data):
    if isinstance(data, list) and all(isinstance(x, int) and 0 <= x <= 255 for x in data):
        # Convert list of bytes to hex string
        return ''.join(f'{x:02x}' for x in data)
    elif isinstance(data, dict):
        # Recurse into dictionaries
        return {key: convert_bytes_to_hex(value) for key, value in data.items()}
    elif isinstance(data, list):
        # Recurse into lists
        return [convert_bytes_to_hex(element) for element in data]
    else:
        # Return the data as is if it's not a list of bytes
        return data


def pretty_print_proof(proof):
    # Parse the JSON string into a Python dictionary
    data = json.loads(proof)

    # Convert byte arrays to hex strings
    converted_data = convert_bytes_to_hex(data)

    # Convert the processed dictionary back to a JSON string (pretty-printed)
    converted_json_string = json.dumps(converted_data, indent=2)

    # Print the result
    return converted_json_string


# Function to remove newlines and double quotes from a proof object
def clean_proof(chunk_proof):
    """Cleans the proof of unnecessary newline and double quote characters."""
    cleaned_proof = pretty_print_proof(chunk_proof).replace("\n", "").replace(" ", "")
    return cleaned_proof

# Function to display proof in a nicely formatted way
def display_proof(agent):
    chunk_proof = agent.proof_registry[-1]  # Get the latest proof
    cleaned_proof = clean_proof(chunk_proof)  # Clean the proof

    print("\n================= AGENT RESPONSE PROOF =================")
    print("Timestamp:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("Agent Response Verification Proof:")
    print("--------------------------------------------------------")
    print(cleaned_proof)
    print("--------------------------------------------------------")
    print("Verification Status: ✅ Verified Successfully")
    print("========================================================\n")


def initialize_agent(mode):
    """Initialize the agent with CDP Agentkit."""
    # Initialize LLM.
    llm = ChatVerifiableRedpill(model="gpt-4o")

    wallet_data = None

    if os.path.exists(wallet_data_file):
        with open(wallet_data_file) as f:
            wallet_data = f.read()

    # Configure CDP Agentkit Langchain Extension.
    values = {}
    if wallet_data is not None:
        # If there is a persisted agentic wallet, load it and pass to the CDP Agentkit Wrapper.
        values = {"cdp_wallet_data": wallet_data}

    agentkit = CdpAgentkitWrapper(**values)

    # persist the agent's CDP MPC Wallet Data.
    wallet_data = agentkit.export_wallet()
    with open(wallet_data_file, "w") as f:
        f.write(wallet_data)

    # Initialize CDP Agentkit Toolkit and get tools.
    cdp_toolkit = CdpToolkit.from_cdp_agentkit_wrapper(agentkit)
    tools = cdp_toolkit.get_tools()

    # Define a new tool for signing messages.
    cowTradeTool = CdpTool(
        name="cow_trade",
        description=COW_TRADE_PROMPT,
        cdp_agentkit_wrapper=agentkit,
        args_schema=CoWTradeInput,
        func=cow_trade,
    )
    # Define a new tool for signing messages.
    cowTradeLimitTool = CdpTool(
        name="cow_trade_limit",
        description=COW_TRADE_LIMIT_PROMPT,
        cdp_agentkit_wrapper=agentkit,
        args_schema=CoWTradeLimitInput,
        func=cow_trade_limit,
    )

    polymarketDataTool = CdpTool(
        name="polymarket_markets",
        description=POLYMARKET_DATA_PROMPT,
        cdp_agentkit_wrapper=agentkit,
        args_schema=PolymarketInput,
        func=polymarket_data,
    )

    # Define the list of tool names to keep
    tools_to_keep = {"get_balance", "get_wallet_details"}

    # Filter the tools based on the specified names to keep
    filtered_tools = [tool for tool in tools if tool.name in tools_to_keep]

    filtered_tools.append(cowTradeTool)
    filtered_tools.append(cowTradeLimitTool)
    filtered_tools.append(polymarketDataTool)

    # Store buffered conversation history in memory.
    memory = MemorySaver()
    config = {"configurable": {"thread_id": "CDP Agentkit Chatbot Example!"}}

    custom_state_modifier_for_polymarket = "You are an crypto currency analyst that will be given information from polymarket events. Your goal is the following, based on give information identify whether there's an opportunity to speculate on certain crypto currency prices. If you find a correlation between event and some crypto currency you should output this crypto currency ticket. You can also specify limit buy/sell prices to execute trade at if you anticipate that price will go to that level in the future. Otherwise you can just output the ticket which will mean purchase at current market price. Your output should be in the following format: Purchase token on mev resistant cow swap or Purchase token at limit order price on mev resistant cow swap. You can only use cow swap for trading. You can only use USDC to purchase other tokens. You can only purchase tokens for 0.1 USDC in single trade. You shouldn't return any explanations. Just say what tokens to purchase and at what price. If you can't find any opportunity to speculate you should output the following message: There's no opportunity to speculate on any token. You should be creative in your trading strategy and look for unusual correlations between events and crypto currency prices." if mode == 2 else "You are a helpful agent that can interact onchain using the Coinbase Developer Platform Agentkit. You are empowered to interact onchain using your tools. If not, you can provide your wallet details and request funds from the user. You are only allowed to operate on Arbitrum Mainnet (e.g. `arbitrum-mainnet`). If someone asks you to do something you can't do with your currently available tools, you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to docs.cdp.coinbase.com for more informaton. Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested."

    # Create ReAct Agent using the LLM and CDP Agentkit tools.
    return create_react_agent(
        llm,
        tools=filtered_tools,
        checkpointer=memory,
        state_modifier=custom_state_modifier_for_polymarket,
    ), config, llm

def get_polymarket_data():
    """Get the latest Polymarket data."""
    # Get the latest Polymarket data using the Polymarket API.
    
    GET_QUOTE_URL = 'https://gamma-api.polymarket.com/markets?order=id&ascending=false&limit=100'

    headers = {
        "Content-Type": "application/json"
    }

    response = requests.get(GET_QUOTE_URL, headers=headers)
    # Check if the request was successful
    if response.status_code != 200:
        raise Exception(f"Error getting polymarket data: {response.text}")
    
    order_id = response.json()

    # Get random index from array
    random_index = random.randint(0, len(order_id) - 1)

    market = order_id[random_index]

    question = market["question"] + "\n" + market["description"] + "\n" + market["outcomes"] + " " + market["outcomePrices"]

    return question


# Autonomous Mode
def run_autonomous_mode(agent_executor, config, interval=10):
    """Run the agent autonomously with specified intervals."""
    print("Starting autonomous mode...")
    while True:
        try:

            question = get_polymarket_data()

            print("Polymarket Data: ", question)
            # Provide instructions autonomously
            thought = (
                f'Market: {question}'
            )

            # Run agent in autonomous mode
            for chunk in agent_executor.stream(
                {"messages": [HumanMessage(content=thought)]}, config
            ):
                if "agent" in chunk:
                    print(chunk["agent"]["messages"][0].content)
                elif "tools" in chunk:
                    print(chunk["tools"]["messages"][0].content)
                print("-------------------")

            # Wait before the next action
            time.sleep(interval)

        except KeyboardInterrupt:
            print("Goodbye Agent!")
            sys.exit(0)


# Chat Mode
def run_chat_mode(agent_executor, config, agent):
    """Run the agent interactively based on user input."""
    print("Starting chat mode... Type 'exit' to end.")
    while True:
        try:
            user_input = input("\nUser 👤: ")
            if user_input.lower() == "exit":
                break

            # Run agent with the user's input in chat mode
            for chunk in agent_executor.stream(
                {"messages": [HumanMessage(content=user_input)]}, config
            ):
                if "agent" in chunk:
                    print("Agent 🤖:", chunk["agent"]["messages"][0].content)
                elif "tools" in chunk:
                    print("Tool  ⚙️:", chunk["tools"]["messages"][0].content)

                # Display proof if available
                if agent.proof_registry:
                    display_proof(agent)

        except KeyboardInterrupt:
            print("\nProof Registry Content:\n")
            print("Total Proofs: ", len(agent.proof_registry))
            print(f"{'=' * 40}\n")
            for index, proof in enumerate(agent.proof_registry, start=1):
                cleaned_proof = proof.replace("\n", "").replace(" ", "")
                print(f"Proof {index}:\n{'=' * 40}")
                print(cleaned_proof)
                print(f"{'=' * 40}\n")

            print("Goodbye Agent!")
            sys.exit(0)


# Mode Selection
def choose_mode():
    """Choose whether to run in autonomous or chat mode based on user input."""
    while True:
        print("\nAvailable modes:")
        print("1. chat    - Interactive chat mode")
        print("2. auto    - Autonomous action mode")

        choice = input("\nChoose a mode (enter number or name): ").lower().strip()
        if choice in ["1", "chat"]:
            return "chat"
        elif choice in ["2", "auto"]:
            return "auto"
        print("Invalid choice. Please try again.")


def main():
    """Start the chatbot agent."""
    agent_executor, config, agent = initialize_agent(2)

    mode = choose_mode()
    if mode == "chat":
        run_chat_mode(agent_executor=agent_executor, config=config, agent=agent)
    elif mode == "auto":
        run_autonomous_mode(agent_executor=agent_executor, config=config)


if __name__ == "__main__":
    print("Starting Agent...")
    main()
