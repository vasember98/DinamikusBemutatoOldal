Kellenek hozzá
- Node.js 
- MySQL 
- npm

ZIP kicsomagolása
majd terminálba bemenni
   ```bash
   cd DinamikusBemutato
   ```

npm függőségeket beélesíteni
   ```bash
   npm install
   ```

MySQL adatbázis létrehozása, mert innen fogjuk megtudni a csatlakozáshoz való adatokat
neve pontosan : dinamikus_bemutato

.env fájl 
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/dinamikus_bemutato"
   ```
   
   Helyettesítsd be:
   - `user` - MySQL felhasználóneved (pl. `root`)
   - `password` - MySQL jelszavad
   - `localhost:3306` - szerver címe és portja
   - `dinamikus_bemutato` - adatbázis neve

Adatbázis feltöltése, kell egy seed
   ```bash
   npm run seed
   ```
és majd a bejelentkezésnél a base felhasználó admin-admin ahogy annak lennie kell mint alap
localhoston indítása
   ```bash
   npm run dev
   ```
   