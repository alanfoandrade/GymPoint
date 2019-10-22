// Compara se o email do usuario logado corresponde a role passada como parametro
export default role => {
  const module = {
    authorization(req, res, next) {
      if (role !== req.email)
        return res.status(403).json({
          message: 'Acesso não autorizado, apenas Admin tem permissão'
        });

      return next();
    }
  };
  return module;
};
