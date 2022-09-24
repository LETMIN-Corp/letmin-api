<p align="center">
    <img src="https://user-images.githubusercontent.com/69210720/185982833-789fde66-a3d4-401b-a9c3-efdbcbdfba2c.png" width="120" alt="Letmin">
</p>

# Letmin API

Para iniciar o desenvolvimento do projeto em sua máquina é necessário rodar os seguintes comandos:

```
    kool run setup
```

- Esse comando instalará as dependências necessárias para o funcionamento da API.

```
    kool run start
```

- Acesse `localhost:3000` para verificar se a API está funcionando

Other useful commands:
    
```
    docker ps | kool status
    kool logs app -f
    kool stop

    kool run npm [command]
```

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

# Response format

GET 'api/users/get-all-vacancies'
HTTP STATUS CODE 200 OK
```
    {
        "success": true,
        "vacancies": [
            {
                "_id": "63277366f2105c0201cd74cf",
                "otherfields": "and Values"
            }
        ]
    }
```