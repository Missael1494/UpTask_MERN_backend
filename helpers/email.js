import nodemailer from "nodemailer";

export const emailRegistro =  async (datos) => {
    //console.log("DATOS", datos);
    const { nombre, token, email } = datos

    //configuramos el cliente para enviar el email
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      });

      // Informacion del email
      //envia el email una vez que verifica las credenciales de arriba
      const info = await transport.sendMail({
          from: 'UpTask - Administrado de Proyectos" <cuentas@uptask.com>',
          to: email,
          subject: "UpTask - Comprueba tu cuenta",
          text: "Comprueba tu cuenta en UpTask",
          html: `<p>Hola: ${nombre} Comprueba tu cuenta en upTask</p>
          <p>Tu cuenta ya esta casi lista, solo debes comprobarlas en el siquiente enlace:</p>

          <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>

          <p>Si tu no create esta cuenta, puedes ignorar el mensaje</p>
          
          `
      })
}

export const emailOlvidePassword =  async (datos) => {
  //console.log("DATOS", datos);
  const { nombre, token, email } = datos

  //configuramos el cliente para enviar el email
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
    }
    });

    // TODO: mover ahacia variables de entorno
    const info = await transport.sendMail({
        from: 'UpTask - Administrado de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Restablece tu Password",
        text: "Restablece tu Password en UpTask",
        html: `<p>Hola: ${nombre} has solicitado reestablecer tu password</p>
        <p>Sigue el siguiente enlace para generar un nuevo password:</p>

        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>

        <p>Si tu no solicitaste este email, puedes ignorar el mensaje</p>
        
        `
    })
}