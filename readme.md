# How to Setup 
currently doesn't work on company network/laptop

## N8N
- open terminal
- run 'docker compose up'
- in terminal, visit link under under 'Editor is now accessible via:'
- click '...' in top right
- import file
- choose 'my_workflow.json'

## Elevenlabs
- create an agent
- follow instructions [here]https://www.youtube.com/watch?v=x5q02lmUhVM

## Ollama
- goto [ollama.com](https://ollama.com/download)
- install with your OS
- run 'ollama pull brnpistone/Qwen3-4B-AgentCoder-q6-k:latest' <!-- local model for now -->

## AI Agent Node (in N8N workflow)
- create credential
- set Base URL to http://host.docker.internal:11434
- no API Key needed

## Ngrok
- go to [ngrok.com](https://ngrok.com/)
- install ngrok
- open ngrok terminal
- type 'ngrok http 6789'