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
```

## 📥 Clone o repositório

git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git

## 📁 Copie os arquivos para fora do repositório
cp -r asterisk ~/asterisk-docker
cd ~/asterisk-docker

## ▶️ Execute o container

docker compose up -d

## Acesse o shell do container:

docker compose exec -ti asterisk bash

## Dentro do container, inicie o Asterisk:

asterisk -rvvv

Se tudo estiver certo, verá algo como:

Asterisk Ready.

## 📄 Arquivos principais de configuração

| Arquivo           | Função                  |
| ----------------- | ----------------------- |
| `pjsip.conf`      | SIP / sinalização       |
| `rtp.conf`        | Áudio RTP               |
| `extensions.conf` | Lógica de chamadas      |
| `modules.conf`    | Carregamento de módulos |
| `http.conf`       | Servidor HTTP           |
| `https.conf`      | HTTPS / TLS             |
| `ari.conf`        | API REST (ARI)          |

## 📚 Documentação do Asterisk

A documentação detalha a função e estrutura de cada um dos arquivos de configuração utilizados.


## Arquivos documentados

- [pjsip.conf](pjsip.md)
- [rtp.conf](rtp.md)
- [extensions.conf](extensions.md)
- [modules.conf](modules.md)
- [http.conf](http.md)
- [https.conf](https.md)
- [ari.conf](ari.md)
