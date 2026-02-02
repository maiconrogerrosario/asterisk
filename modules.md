
---

## 📄 `docs/modules.md`


# 🧩 modules.conf – Módulos do Asterisk

O arquivo `modules.conf` define **quais módulos do Asterisk são carregados**.

---

## 📌 Para que serve

- Ativar PJSIP
- Ativar ARI
- Reduzir consumo de recursos
- Evitar conflitos de módulos antigos

---

## 📄 Exemplo

```ini
load = res_pjsip.so
load = res_ari.so
load = app_dial.so

noload = chan_sip.so
```