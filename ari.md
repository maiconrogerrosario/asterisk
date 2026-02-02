
---

## 📄 `docs/ari.md`


#  ari.conf – Asterisk REST Interface (ARI)

O arquivo `ari.conf` configura a **API REST do Asterisk**.

---

## 📌 Para que serve

- Controle de chamadas por aplicações externas
- Integração com Node.js, Python, IA
- Automação avançada

---

## 📄 Exemplo

```ini
[admin]
type=user
read_only=no
password=senha

```

##🔁 Fluxo típico

Aplicação externa
→ ARI
→ Asterisk
→ SIP / RTP