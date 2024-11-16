from collections.abc import Callable

from cdp import Wallet, Asset
from pydantic import BaseModel, Field
from web3 import Web3
import requests
import random

bot_address = "0x8180822B1B58D72369f6aa191F7EFf39d60d20d0"

POLYMARKET_DATA_PROMPT = """
This tool will get data about Polymarket markets and extract the information about one of them."""

RELAYER_ADDRESS = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110'
GET_QUOTE_URL = 'http://localhost:3000/api/createLimitOrder'

class PolymarketInput(BaseModel):
    """Input argument schema for trade action."""


def polymarket_data(wallet: Wallet) -> str:
    """Trade a specified amount of a from asset to a to asset for the wallet. Trades are only supported on Mainnets.

    Args:
        wallet (Wallet): The wallet to trade the asset from.
    Returns:
        str: A message that will direct agent to further actions (trade specific asset using mev resistant cow swap)

    """
    try:

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

        question = market["question"] + "\n" + market["description"] + "\n" + market["outcomes"][0]["name"] + " " + str(market["outcomes"][0]["price"]) + "\n" + market["outcomes"][1]["name"] + " " + str(market["outcomes"][1]["price"])



    except Exception as e:
        return f"Error trading assets {e!s}"

    return f"You are an crypto currency analyst that will be given information from polymarket events. Your goal is the following, based on give information identify whether there's an opportunity to speculate on certain crypto currency prices. If you find a correlation between event and some crypto currency you should output this crypto currency ticket. You can also specify limit buy/sell prices to execute trade at if you anticipate that price will go to that level in the future. Otherwise you can just output the ticket which will mean purchase at current market price. Your output should be in the following format: Purchase token on mev resistant cow swap or Purchase token at limit order price on mev resistant cow swap. You shouldn't return any explanations. Just say what tokens to purchase and at what price. You can also say that there's no opportunity to speculate on any token. If you can't find any opportunity to speculate you should output the following message: There's no opportunity to speculate on any token. \n Market: {question}"
