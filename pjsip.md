📄 docs/pjsip.md
# 📡 pjsip.conf – Configuração SIP (PJSIP)


O arquivo `pjsip.conf` é responsável pela **sinalização SIP moderna** no Asterisk,
utilizando o stack **PJSIP**.


---


## 📌 Para que serve


- Definir **endpoints SIP**
- Configurar **usuários e autenticação**
- Criar **transportes SIP** (UDP, TCP, TLS)
- Registrar **softphones e gateways**
- Base para **WebRTC**


---


## 🔁 Fluxo simplificado


Softphone / Gateway  
→ SIP (PJSIP)  
→ Dialplan (`extensions.conf`)


---


## 📄 Exemplo simples


```ini
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0


[100]
type=endpoint
context=default
disallow=all
allow=ulaw
auth=100-auth
aors=100


[100-auth]
type=auth
auth_type=userpass
username=100
password=100


[100]
type=aor
max_contacts=1
🧪 Comandos úteis
pjsip show endpoints
pjsip show registrations
pjsip set logger on