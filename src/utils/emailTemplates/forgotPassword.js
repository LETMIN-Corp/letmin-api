
// return options of the email
const email = (company, url) => {
	const options = {
		email: company.company.email,
		subject: 'Letmin - Recuperação de Senha!',
		html: `<html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width">
            <title>HTML Email</title>
            <style>
                body {
                    background-color: #f4f4f4;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 16px;
                }
                .email-content {
                    max-width: 600px;
                    margin: auto;
                    background-color: #fff;
                    padding: 20px;
                }
                .top-bar {
                    background-color: #9C37EB;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                }
                .top-bar h1 {
                    margin: 0;
                }
                .footer {
                    background-color: #7A2AB8;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                }
                button {
                    background-color: #9C37EB;
                    color: #fff;
                    border: none;
                    padding: 10px;
                    border-radius: 5px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
        
            <div class="email-content">
                <div class="top-bar">
                    <h1>Letmin - Recuperação de Senha</h1>
                </div>
                <h2>Olá administrador da ${company.company.name},</h2>
                <p>Se você solicitou a recuperação de senha, clique no link abaixo que estará valido pela próxima 1 hora para escolher sua nova senha.</p>
                <button><a href="${url}">Recuperar Senha</a></button>
                <p>Se você não solicitou a recuperação de senha, apenas ignore este email.</p>
                <p>Atenciosamente,</p>
                <p>Equipe Letmin</p>
                <div class="footer">
                    <p>Letmin - 2022</p>
                </div>
            </div>
        
        </body>
        </html>`,
	};
	return options;
};


module.exports = email;