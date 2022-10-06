// return options of the email
const email = (user) => {
	const options = {
		email: user.email,
		subject: 'Bem vindo a Letmin!',
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
                button, a {
                    background-color: #9C37EB;
                    color: #fff;
                    border: none;
                    padding: 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    text-decoration: none;
                    font-weigth: 500;
                }
            </style>
        </head>
        <body>
            <div class="email-content">
                <div class="top-bar">
                    <h1>Letmin</h1>
                </div>
                <div style="padding: 0 12px;">
                    <h2>Olá ${ user.name },</h2>
                    <p>Seja bem vindo a Letmin.</p>
                    <p>Esperamos que você aproveite ao máximo o nosso sistema de matching de empregos.</p>
                    <p>Qualquer dúvida, entre em contato conosco.</p>
                    <p>Atenciosamente,</p>
                    <p>
                        <b>Equipe Letmin</b>
                    </p>
                </div>
                <div class="footer">
                    <p>Letmin - 2022</p>
                </div>
            </div>
        </body>
        `,
	};
	return options;
};


module.exports = email;