---

## 📄 `docs/rtp.md`


# 🔊 rtp.conf – Configuração de Áudio RTP

O arquivo `rtp.conf` define como o **áudio (RTP)** é transmitido nas chamadas.

---

## 📌 Para que serve

- Definir **intervalo de portas RTP**
- Controlar **NAT e QoS**
- Ajustar comportamento de mídia

---

## 📄 Exemplo

```ini
rtpstart=10000
rtpend=20000
```
## 🧪 Debug de áudio

### Ativa Debug RTP
```
rtp set debug on
```
### Desativa Debug RTP
```
rtp set debug off
```


📌 Essencial quando há chamada conecta mas não tem áudio.

