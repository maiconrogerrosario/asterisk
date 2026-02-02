# 📞 Asterisk em Docker – Guia Rápido

Este diretório contém um ambiente Docker para executar o Asterisk.

👉 Não é necessário instalar Asterisk no sistema.

---

## ✅ Pré-requisitos

- Git  
- Docker  
- Docker Compose  
- Linux (usa network_mode: host)

Verifique:

```bash
docker --version
docker compose version

git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git


cp -r asterisk ~/asterisk-docker
cd ~/asterisk-docker


docker compose up -d


docker compose exec -ti asterisk bash

asterisk -rvvv

Asterisk Ready.



| Arquivo         | Função            |
| --------------- | ----------------- |
| pjsip.conf      | SIP / sinalização |
| rtp.conf        | Áudio RTP         |
| extensions.conf | Dialplan          |
| modules.conf    | Módulos           |
| http.conf       | HTTP              |
| https.conf      | HTTPS             |
| ari.conf        | API REST (ARI)    |


# 📚 Documentação do Asterisk

Esta pasta contém a documentação dos principais arquivos de configuração do Asterisk
utilizados neste projeto.

## Arquivos documentados

- [pjsip.conf](pjsip.md)
- [rtp.conf](rtp.md)
- [extensions.conf](extensions.md)
- [modules.conf](modules.md)
- [http.conf](http.md)
- [https.conf](https.md)
- [ari.conf](ari.md)

⬅️ [Voltar para o README principal](../README.md)
