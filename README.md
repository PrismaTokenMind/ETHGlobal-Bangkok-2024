# NotarIA and Polymind Monorepo: Verifiable AI Agents and the First Agent Managed Fund

### Short Description

**NotarIA** is a new efficient protocol for verifiable AI agents using TLS Notary, requiring minimal trusted parties and integrating seamlessly with LangChain. **Polymind** demonstrates this by launching the first verifiable Agent Managed Fund, where users invest via USDC and an AI agent trades autonomously using CoW Swap.

**Polymind Website**: https://eth-bangkok-mu.vercel.app/


### Repository Structure

1. **`cowapi`** - Contains the [front-end application](https://eth-bangkok-mu.vercel.app/) as well as the API integration with CoW Swap.

2. **`fund-manager-graph`** - The Graph subgraph that indexes and organizes data from the Fund Manager contract for front-end usage.

3. **`tlsn-langchain`** - A Rust library enabling RedPill integration in TLS Notary, serving as a bridge between Rust and Python environments.

4. **`verifiable_langchain_agent`** - An extension for LangChain, enabling easy integration of verifiable agent functionality for LangChain projects.

5. **`verifiable_trading_agent`** - Contains the AI trading agent client and the Polymind Fund Manager smart contract.




## NotarIA (Verifiable Agent Developer Library)

### Overview

Our submission introduces two interconnected components aimed at enhancing the trust and security of AI agents in decentralized environments:

NotarIA – An efficient protocol that unlocks verifiable AI agents by leveraging TLS Notary, designed for easy integration with existing development frameworks.
Polymind – The first implementation of NotarIA, providing a verifiable Agent Managed Fund where an AI agent autonomously manages investments.
NotarIA – Verifiable Agent Developer Library

### Motivation

Current AI agents lack the robustness required for trustless applications. They are vulnerable because:

1. **Host Dependence:** Agents run on hosts that can be tampered with, leading to altered or malicious behavior.
2. **Verification Challenges:** Verifying AI model execution is computationally intensive and impractical for state-of-the-art models like GPT-4.
3. **Closed-Source Limitations:** Top-performing models are often closed-source and accessible only via APIs, making full verification impossible.
4. **Security Risks:** Public models run independently can be easier hacked or manipulated using Adversarial Attacks compared to enterprise version.

### Solution

NotarIA addresses these issues by:

1. **Trusting the Model Provider:** Accepts that fact that we currently need to trust outputs of API-gated models (e.g., OpenAI's GPT-4).
2. **Utilizing TLS Notary:** Employs a TLS Notary to attest the authenticity of AI agent responses, ensuring they originate from the trusted model provider.
3. **Minimizing Trusted Parties:** Requires trust only in the model provider and the TLS Notary, which itself can be run in a TEE, not the agent host.
4. **Simplifying Integration:** Offers a library that integrate seamlessly with Python and LangChain, making adoption of Verifiable Agents effortless.

### Implementation

We developed:

`tlsn-langchain`: A Rust library based on Ethereum Foundation's PSE's TLS Notary project. It provides a bridge to the Python ecosystem using PyO3, allowing for attestation of messages from AI agents.
`verifiable_langchain_agent`: A Python library integrating with LangChain. It introduces the `ChatVerifiableRedpill` class, inheriting from the LangChain's BaseChat, enabling developers to enhance their agents with verifiability by simply replacing the model class:

```python

+++: model = ChatVerifiableRedpill(model="gpt-4")
---: model = ChatOpenAI(model="gpt-4") 

```

After operations, proofs of agent actions are accessible via `model.proof_registry` and can be verified on the TLSNotary Explorer.

### Advantages

- **Efficiency:** Compatible with any model size, including closed-source models, without the overhead of executing and verifying models on-chain.
- **Security:** Reduces the trusted computing base, enhancing security by limiting trust to the model provider and TLS Notary.
- **Developer-Friendly:** Facilitates easy integration for Python developers using LangChain, promoting widespread adoption.


## Polymind (Verifiable AI Agent Managed Fund)

Polymind leverages NotarIA to create a verifiable Agent Managed Fund, where an AI agent autonomously manages investments based on real-world data.

- **Autonomous Operation:** Retrieves data from Polymarket to inform investment decisions.
- **Trade Execution:** Executes trades by:
  1. Placing market orders.
  2. Creating limit orders.
- **Order Processing:** Sends API calls that construct CoW Swap orders, submitting them to CoW solvers.
- **Trade Integration:** Uses CoW Swap hooks to log trade information in the Fund Manager contract.

### User Interaction:

- **Investing:** Users deposit USDC into the Fund Manager contract to invest.
- **Stake Representation:** Users receive tokens representing their share of the fund.
- **Transparency:** Users can view trades and agent statistics via the frontend.

---

## How It Works

**NotarIA (Verifiable Agent Developer Library)** includes two main components:

### `tlsn-langchain`:

Built upon Ethereum Foundation's PSE's TLS Notary project, acts as a Rust library interfacing with TLS Notary for message attestation. This is designed specifically with RedPill integration in mind due to RedPill providing a set of over 200 models, as well as supporting `idenity` request encodings, required for TLS Notary.

**Python Integration:** For Python Integration of TLS Notary we use _PyO3_  to expose Python bindings, connecting Rust and Python.

### `verifiable_langchain_agent`:

Provides the `ChatVerifiableRedpill` and `ChatRedpill` classes, extending  [LangChain](https://www.langchain.com)'s `BaseChat` to make it easy for developers integrate verifiable agents by just swapping the previous model class with the new one.
```python

+++: model = ChatVerifiableRedpill(model="gpt-4")
---: model = ChatOpenAI(model="gpt-4") 
```

**Proof Registry:** Access proofs of agent actions via `model.proof_registry` for external verification.

---

**Polymind (Verifiable AI Agent Managed Fund)** depends on the following technologies:

1. **Coinbase AgentKit:**

	- **Purpose:** Deploys the autonomous AI agent on-chain.
	- **Custom Actions:** Added to:
		- Post market orders.
		- Post limit orders on CoW Swap.

2. **CoW Swap and CoW Hooks:**

	- **MEV Resistance:** Protects trades from front-running and sandwich attacks.
	- **Hooks Integration:**
		- **Pre-Hooks:** Notify the Fund Manager when a limit order is created.
		- **Post-Hooks:** Signal successful execution of orders.
	- **Benefits:**
		- Enables natural language trading strategies.
		- Enhances trade monitoring and management.

3. **The Graph Subgraph:**

	- **Deployment:** Subgraph of the Fund Manager contract on Arbitrum One.
	- **Access:** Available at The Graph Explorer.
	- **Functionality:**
		- Indexes contract events for frontend use.
		- Includes executed trades, open orders, and trading stats.
	- **Additional Data:** Queries CoW Swap subgraph for detailed trade information.

4. **Notable Implementations:**

	- **Verifiable Agent Actions:** By integrating TLS Notary, all agent decisions are verifiable and originate from trusted sources.
	- **Efficient Trust Model:** Minimizes trusted parties to the model provider and TLS Notary without sacrificing performance.
	- **Tech Stack Bridging:** Successfully connects Rust and Python, integrating with LangChain to encourage adoption.

--- 
This project demonstrates the feasibility of verifiable AI agents in decentralized finance, offering a practical solution that balances security, efficiency, and accessibility.