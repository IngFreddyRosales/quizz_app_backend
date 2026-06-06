const { verifyToken } = require('../utils/auth.utils');

const requiresUser = (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "No se encuentra token en header" });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ message: "Formato de token inválido" });
        }

        const token = parts[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ message: "Token inválido" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expirado" });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Token inválido" });
        }
        return res.status(401).json({ message: "Error al verificar el token" });
    }
};

const requiresAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Acceso denegado: se requieren privilegios de administrador" });
    }
};

module.exports = {
    requiresUser,
    requiresAdmin
};