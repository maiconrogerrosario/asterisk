# LiveKit Full Stack local

Repositório único com Redis, LiveKit SFU, LiveKit SIP, agente OpenAI Realtime e página web.

## Executar

```powershell
Copy-Item .env.example .env
notepad .env
docker compose up --build -d
docker compose ps
```

Abra `http://localhost:8080` para testar pelo microfone.

## Logs

```powershell
docker compose logs -f
docker compose logs -f sip
docker compose logs -f agent
```

## Portas

- 8080/TCP: página web
- 7880/TCP: LiveKit WebSocket/API
- 7881/TCP: WebRTC por TCP
- 50000-50100/UDP: mídia WebRTC
- 5060/UDP e TCP: SIP
- 10000-10100/UDP: RTP SIP

## Asterisk

Use os exemplos em `sip/pjsip-example.conf` e `sip/extensions-example.conf`. Troque os IPs pelos endereços reais. Antes de aceitar chamadas, cadastre o trunk e a dispatch rule usando os arquivos JSON em `sip/`.

## Parar

```powershell
docker compose down
```

Para produção, configure domínio, TLS, `wss://`, IP público, firewall, TURN/TLS e credenciais fortes.
