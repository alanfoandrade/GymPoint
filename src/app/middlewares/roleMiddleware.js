// Compara se o authLevel do usuario logado corresponde a role passada como parametro
export default role => {
  const module = {
    authorization(req, res, next) {
      if (role !== req.auth_level)
        return res.status(403).json({
          error: 'Acesso não autorizado',
        });

      return next();
    },
  };
  return module;
};
