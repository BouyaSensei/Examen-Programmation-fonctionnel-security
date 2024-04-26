const csrfErrorMiddleware = (err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        res.status(403); // Forbidden
        res.send("La session a expiré ou le formulaire a été altéré");
    } else {
        next(err);
    }
};

module.exports = csrfErrorMiddleware;