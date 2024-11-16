# Verifiable Langchain Agent

A project that integrates Redpill.ai with LangChain, enabling Redpill API interaction via LangChain's agent interface. This package currently offers a `ChatRedpill` class that supports standard interactions without verifiable wrappers. 

## Installation

### Using Poetry
To install with [Poetry](https://python-poetry.org/):
===
poetry add verifiable-langchain-agent
===

### From GitHub
Alternatively, you can install directly from GitHub:
===
pip install git+https://github.com/yourusername/verifiable-langchain-agent.git@v0.1.0
===

## Setup

The `ChatRedpill` model requires an API key for the Redpill API. Set the environment variable `REDPILL_API_KEY` with your API key:

===
export REDPILL_API_KEY="your-api-key"
===

## Usage

The `ChatRedpill` class provides a straightforward interface to interact with Redpill's language model through LangChain. Below are the main ways to use it.

### Instantiation

Create an instance of the `ChatRedpill` model:

===
from langchain_community.chat_models import ChatRedpill

chat = ChatRedpill(
    api_key="your-api-key",
    model="Redpill4",
    temperature=0.5,
    top_p=0.9
)
===

### Basic Invocation

Send a series of messages to the model using `invoke`:

===
messages = [
    ("system", "You are a professional translator who can translate Chinese to English."),
    ("human", "我喜欢编程。")
]
chat.invoke(messages)
===

### Streaming Responses

To handle streaming responses, use the `stream` method:

===
for chunk in chat.stream(messages):
    print(chunk)
===

### Asynchronous Invocation

The `ChatRedpill` model also supports asynchronous invocation. Here’s how to call the model asynchronously:

===
await chat.ainvoke(messages)

# Or for streaming
async for chunk in chat.astream(messages):
    print(chunk)
===

### Tool Integration

The `ChatRedpill` model supports tool integration for complex tasks. You can bind tools to the model using the `bind_tools` method:

===
from pydantic import BaseModel, Field

class GetCurrentWeather(BaseModel):
    '''Get current weather.'''
    location: str = Field("City or province, such as Shanghai")

llm_with_tools = ChatRedpill(model="Redpill3-Turbo").bind_tools([GetCurrentWeather])
llm_with_tools.invoke("How is the weather today?")
===

## Test Suite

The package includes a basic test suite located in `test/test_redpill_langchain_agent.py`. This test suite verifies the functionality of `ChatRedpill` and ensures that its responses meet expected formats and behaviors.

## Environment Variables

Make sure to set the following environment variable:
- `REDPILL_API_KEY`: Your API key for accessing the Redpill API.

## Example Code

Below is a full example of using `ChatRedpill` to invoke a message and process the response:

===
from langchain_community.chat_models import ChatRedpill

# Setup
chat = ChatRedpill(api_key="your-api-key", model="Redpill4", temperature=0.5)

# Invocation
messages = [
    ("system", "You are a professional translator."),
    ("human", "我喜欢编程。")
]
response = chat.invoke(messages)
print(response)
===

## License

This project is licensed under the MIT License.

## Contact

For more information, visit the [project homepage](https://github.com/yourusername/verifiable-langchain-agent).