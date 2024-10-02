### Passos para publicar sua página

- Clone o repositório `git clone https://github.com/ruanosena/ruanosena.github.io.git`,
- Mude de branch `git checkout development`, e `git pull`

1. Add seu nome do github como `author` em `package.json`

```
  "author": "myusername",
```

2. Add `homepage` em `package.json`

```
  "homepage": "https://myusername.github.io",
```

3. Deploy o site rodando npm run deploy

```
npm run deploy
```
