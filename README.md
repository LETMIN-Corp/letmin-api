<p align="center">
    <img src="https://user-images.githubusercontent.com/69210720/185982833-789fde66-a3d4-401b-a9c3-efdbcbdfba2c.png" width="120" alt="Letmin">
</p>

# Letmin API

API rodando em Node com o framework Express e o Mongoose para interação com o MongoDB

Para iniciar o desenvolvimento do projeto em sua máquina é necessário rodar os seguintes comandos para instalar as dependências e iniciar a API:

```
    npm install
    npm run dev
```

- Agora acesse `http://localhost:5000/api/healthcheck` para verificar se a API está funcionando


HTTP Response Codes

- 200 - OK
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error
- 501 - Not Implemented
- 503 - Service Unavailable

# Response format example

GET 'api/company/get-all-vacancies'
HTTP STATUS CODE 200 OK
```
    {
        "success": true,
        "message": "Vagas encontradas com sucesso";
        "vacancies": [
            0: {
                "_id": "63277366f2105c0201cd74cf",
                "otherfields": "and Values"
            }
        ]
    }
```
