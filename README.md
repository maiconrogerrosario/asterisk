# 🧩 Asterisk com Docker Compose

Este projeto fornece um ambiente completo para executar o **Asterisk** em um contêiner Docker, utilizando o modo **host** para suporte total ao **SIP** e **RTP** (voz em tempo real).

---

## 📦 Estrutura do Projeto

```
.
├── docker-compose.yml          # Arquivo principal do Docker Compose
├── config/                     # Configurações do Asterisk (.conf)
├── logs/                       # Logs do Asterisk
├── recordings/                 # Gravações (MixMonitor, etc)
├── rest-api/                   # Scripts e dados de API (opcional)
└── README.md                   # Este manual
```

---

## 🚀 Instalação

### 1. Pré-requisitos

Antes de iniciar, verifique se possui:

* **Docker** instalado
* **Docker Compose** instalado
* Sistema baseado em **Linux** (modo `network_mode: host` não é suportado no Windows nativamente)

---

### 2. Clonar o repositório

```bash
git clone https://github.com/seuusuario/asterisk-docker.git
cd asterisk-docker
```

---

### 3. Configurar o Asterisk

Coloque suas configurações dentro da pasta `config/`.
Por exemplo:

```
config/
├── pjsip.conf
├── extensions.conf
├── sip.conf
├── voicemail.conf
└── ...
```

> 💡 Dica: Você pode começar copiando as configurações padrão do Asterisk local:
>
> ```bash
> sudo cp -r /etc/asterisk/* config/
> ```

---

### 4. Subir o contêiner

```bash
docker-compose up -d
```

Isso iniciará o Asterisk em modo daemon (background).
Para ver os logs em tempo real:

```bash
docker logs -f asterisk
```

---

### 5. Acessar o console do Asterisk

```bash
docker exec -it asterisk asterisk -rvvv
```

> Use `exit` para sair do console.

---

### 6. Parar e remover o contêiner

```bash
docker-compose down
```

---

## ⚙️ Volumes e Persistência

Os volumes definidos no `docker-compose.yml` garantem que:

| Pasta Local    | Caminho no Contêiner          | Descrição                    |
| -------------- | ----------------------------- | ---------------------------- |
| `./config`     | `/etc/asterisk`               | Arquivos de configuração     |
| `./logs`       | `/var/log/asterisk`           | Logs gerados pelo Asterisk   |
| `./recordings` | `/var/spool/asterisk/monitor` | Gravações e áudio MixMonitor |
| `./rest-api`   | `/var/lib/asterisk/rest-api`  | Documentação REST/ARI        |

---

## 🧰 Variáveis de Ambiente

| Variável       | Valor Exemplo      | Descrição                        |
| -------------- | ------------------ | -------------------------------- |
| `SYSLOG_LEVEL` | `4`                | Nível de log                     |
| `HOSTNAME`     | `asterisk20.local` | Nome do host usado pelo Asterisk |

---

## 🛰️ Rede e RTP

* O serviço usa `network_mode: host` para permitir que o Asterisk acesse diretamente as portas **SIP (5060)** e **RTP (10000–20000)**.
* Certifique-se de que não há outro serviço ocupando essas portas.
* Se preferir usar uma rede bridge, será necessário mapear manualmente as portas e ajustar `rtp.conf`.

---

## 🔍 Teste Rápido (Softphone)

1. Configure um softphone (ex: Zoiper, Linphone)
2. Aponte para o IP do host Docker (ex: `192.168.0.10`)
3. Use as credenciais definidas em `pjsip.conf`
4. Faça uma chamada de teste para o ramal de eco:

   ```
   exten => 600,1,Echo()
   ```

---

## 🧩 Integração com Outras Ferramentas

Este contêiner pode ser facilmente integrado a:

* **RTPengine** (para proxy de mídia)
* **SIPp** (para testes automatizados)
* **ARI / REST API** (para controle via HTTP)
* **WebRTC** (com configuração adicional em `pjsip.conf`)

---

## 🧹 Dicas e Solução de Problemas

* Se o contêiner não sobe, verifique se as portas 5060 e 10000–20000 estão livres:

  ```bash
  sudo netstat -tunlp | grep 5060
  ```
* Para verificar se o áudio RTP está fluindo:

  ```bash
  sudo tcpdump -i any udp port 10000
  ```
* Para resetar tudo e limpar volumes:

  ```bash
  docker-compose down -v
  ```

---



### 👤 Autor

**Maicon Roger**
💬 Projetos: SIP, Asterisk, WebRTC, e Transcrição de Voz em Tempo Real.
