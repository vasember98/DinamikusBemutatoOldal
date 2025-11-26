# DinamikusBemutatoOldal

Webes platform dinamikus programozás tanulásához.Lényegében  tananyag, kvízek, meg pár interaktív cucc.

## Mi van benne?

- Tananyag PDF-ekből (fejezetek, példák)
- Kvíz rendszer különböző kérdéstípusokkal
- Bejelentkezés (tanár/diák külön profilok)
- Drag & drop feladatok
- Algoritmus szekvencia építő

## Mik kellenek hozzá?

- **Frontend**: SvelteKit 2 + Svelte 5 (TypeScript-tel), TailwindCSS
- **Backend**: Node.js meg a SvelteKit szerver része, itt a Runes mód
- **Adatbázis**: MySQL + Drizzle ORM
- **Autentikáció**: Oslo library session-ökkel
- **Build tool**: Vite

## Hogyan indítsd el?

### Amik kellenek

- Node.js (legalább v18)
- MySQL (v8 vagy újabb)
- npm (vagy pnpm, ha az a preferált)

### 1. Töltsd le

```bash
git clone https://github.com/vasember98/DinamikusBemutatoOldal.git
cd DinamikusBemutatoOldal/DinamikusBemutato
```

### 2. Package-ek telepítése

```bash
npm install
```

(Ez eltart egy kicsit, kb 1-2 perc.)

### 3. Adatbázis összerakása

Csinálj egy új MySQL adatbázist:

```sql
CREATE DATABASE dinamikus_bemutato CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Aztán csinálj egy `.env` fájlt a `DinamikusBemutato` mappába és írd bele:

```env
DATABASE_URL="mysql://user:password@localhost:3306/dinamikus_bemutato"
```

Írd át:
- `user` - a MySQL felhasználóneved (pl. `root`)
- `password` - jelszó
- `localhost:3306` - ha lokálisan futtatod, ezt hagyd így
- `dinamikus_bemutato` - az adatbázis neve (amit az előbb csináltál)

### 4. Tábák és mintaadatok

Futtasd le ezt, ami összerakja a táblákat és feltölti mintaadatokkal:

```bash
npm run seed
```

Ez létrehozza a user táblákat, tananyag adatokat, kvízkérdéseket, meg egy teszt usert is:
- username: `testuser`
- password: `password123`

### 5. Indítsd el a dev szervert

```bash
npm run dev
```

Ezután megnyílik a böngészőben: `http://localhost:5173`


## Szerző

**Csikós András** 

Ez az oldal a szakdolgozati projektem! :D

**Repo**: [github.com/vasember98/DinamikusBemutatoOldal](https://github.com/vasember98/DinamikusBemutatoOldal)
