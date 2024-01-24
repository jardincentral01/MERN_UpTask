import nodemailer from 'nodemailer'

const emailRegistro = async (datos) =>{
    const { email, nombre, token } = datos;
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    // Info del Email
    const info = await transport.sendMail({
        from: '"UpTask - Administrador De Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "Confirma Tu Cuenta De UpTask",
        text: `Confirma tu cuenta para empezar a organizar tus Proyectos. ${process.env.FRONTEND_URL}/usuarios/confirmar/${token}`,
        html: `
        <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <title>Confirmar Cuenta</title>
                </head>
                <div class="bg-gray-100 h-screen flex flex-col items-center justify-center gap-10">

                    <h1 class="text-blue-600 capitalize text-4xl font-black">${"Hola " + nombre}</h1>

                    <div class="bg-white p-8 rounded shadow-md max-w-md w-full">
                        <h2 class="text-2xl font-semibold mb-6">¡Bienvenido! Confirma tu cuenta</h2>
                        
                        <p class="text-gray-600 mb-4">Gracias por registrarte. Solo necesitas confirmar tu cuenta para comenzar a disfrutar de nuestros servicios.</p>
                        
                        <a href="${process.env.FRONTEND_URL}/confirmar/${token}" class="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition duration-300">Confirmar Cuenta</a>
                        
                        <p class="mt-4 text-gray-600 text-sm">Si tienes problemas con el botón, copia y pega el siguiente enlace en tu navegador: <br>${process.env.FRONTEND_URL}/confirmar/${token}</p>
                    </div>

                </div>
            </html>

        `
    })
}

const emailPassword = async (datos) => {
    const { email, nombre, token } = datos;
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const info = await transport.sendMail({
        from: '"UpTask - Administrador De Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "Recupera Tu Cuenta De UpTask",
        text: `Reestablece Tu Contraseña De UpTask. ${process.env.FRONTEND_URL}/olvide-password/${token}`,
        html: `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <title>Recuperar Acceso</title>
            </head>
            <div class="bg-gray-100 h-screen flex flex-col items-center justify-center gap-10">

                <h1 class="text-blue-600 capitalize text-4xl font-black">${"Hola " + nombre}</h1>

                <div class="bg-white p-8 rounded shadow-md max-w-md w-full">
                    <h2 class="text-2xl font-semibold mb-6">Recupera Tu Acceso a UpTask</h2>
                    
                    <p class="text-gray-600 mb-4">Para recuperar tu cuenta, necesitas reestablecer tu contraseña y así seguir disfrutando de nuestros servicios.</p>
                    
                    <a href="${process.env.FRONTEND_URL}/olvide-password/${token}" class="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition duration-300">Confirmar Cuenta</a>
                    
                    <p class="mt-4 text-gray-600 text-sm">Si tienes problemas con el botón, copia y pega el siguiente enlace en tu navegador: <br>${process.env.FRONTEND_URL}/olvide-password/${token}</p>
                </div>

            </div>
        </html>
        `
    })
}

export {
    emailRegistro,
    emailPassword
}