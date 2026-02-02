---

## 📄 `docs/extensions.md`


# ☎️ extensions.conf – Dialplan

O `extensions.conf` contém o **dialplan**, que define
**o que acontece quando uma chamada ocorre**.

---

## 📌 Para que serve

- Criar **ramais**
- Definir **fluxos de chamadas**
- Executar aplicações (Dial, Answer, Playback, etc.)

---

## 📄 Exemplo simples

```ini
[default]
exten => 100,1,Answer()
 same => n,Dial(PJSIP/200)
 same => n,Hangup()
 
``` 


##  Importante

📌 Este é o coração da lógica do Asterisk.
Sem dialplan, não há chamadas funcionais.