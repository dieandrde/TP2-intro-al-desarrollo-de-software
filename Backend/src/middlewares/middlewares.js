import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET; // o donde lo hayas definido

// Middleware: verifyToken
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // 1. Verificar formato del header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado o formato incorrecto." });
    }
    
    const token = authHeader.split(' ')[1]; // Obtiene solo la parte del token

    try {
        // 2. Verificar, decodificar y validar tiempo de expiración
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Inyectar los datos del usuario en el request para uso posterior
        req.user = decoded; // { id, es_admin, iat, exp }
        
        next(); // ¡Token válido! Pasa al siguiente middleware o a la ruta final.

    } catch (err) {
        // 4. Token inválido (expirado, modificado, firma incorrecta)
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};



// Middleware: requireAdmin
export const requireAdmin = (req, res, next) => {
    // Verificar si el middleware verifyToken se ejecutó y si el usuario tiene el rol
    if (req.user && req.user.es_admin === true) {
        next(); // Es administrador, permite el acceso.
    } else {
        // 403 Forbidden: Se sabe quién es, pero no tiene el permiso.
        return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
    }
};