const dashboardController = {
    getDashboard: (req, res) => {
        if (req.cookies.jwt) {
            if (!req.cookies.toast) {
                res.cookie("toast", {type: "", message: ""}, {httpOnly: true});
            }
            req.cookies.toast.message = "Connexion réussi ! Bienvenue sur votre dashboard ! ";
            req.cookies.toast.type = "success";

            const info = {
                jwt: req.cookies.jwt,
                toast: req.cookies.toast,
                nonce: req.nonce
            }
            res.render("dashboard.ejs", {info});
            req.cookies.toast = null;
        } else {
            req.session.toast = "Erreur d'authentification ! ";
            req.session.toast.type = "error";
            res.redirect("/login");
        }
    }
};

module.exports = dashboardController;