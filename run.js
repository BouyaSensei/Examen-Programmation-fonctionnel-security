const readline = require('readline');
const { spawn } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function mainMenu() {
    rl.question('Choisissez une option : \n 1. Installer les dépendances \n 2. Exécuter les serveurs \n 3. Quitter \n', (answer) => {
        switch (answer) {
            case '1':
                installDependencies();
                break;
            case '2':
                startServers();
                break;
            case '3':
                console.log('Au revoir !');
                rl.close();
                break;
            default:
                console.log('Option non reconnue, veuillez réessayer.');
                mainMenu();
                break;
        }
    });
}

function installDependencies() {
    console.log('Installation des packages du backend...');
    const installBackend = spawn('cmd', ['/c', 'npm', 'install'], { cwd: './backend', stdio: 'inherit' });

    installBackend.on('close', (code) => {
        if (code !== 0) {
            console.log(`Erreur lors de l'installation des packages du backend.`);
            mainMenu();
            return;
        }

        console.log('Installation des packages du frontend...');
        const installFrontend = spawn('cmd', ['/c', 'npm', 'install'], { cwd: './frontend', stdio: 'inherit' });

        installFrontend.on('close', (code) => {
            if (code !== 0) {
                console.log(`Erreur lors de l'installation des packages du frontend.`);
            } else {
                console.log('Installation terminée avec succès.');
            }
            mainMenu();
        });
    });
}

function startServers() {
    console.log('Démarrage du serveur backend...');
    const startBackend = spawn('cmd', ['/c', 'npm', 'start'], { cwd: './backend', stdio: 'inherit' });

    console.log('Démarrage du serveur frontend...');
    const startFrontend = spawn('cmd', ['/c', 'npm', 'start'], { cwd: './frontend', stdio: 'inherit' });

    startBackend.on('close', (code) => {
        if (code !== 0) {
            console.log(`Erreur lors du démarrage du serveur backend.`);
        } else {
            console.log('Serveur backend démarré avec succès.');
        }
        mainMenu();
    });

    startFrontend.on('close', (code) => {
        if (code !== 0) {
            console.log(`Erreur lors du démarrage du serveur frontend.`);
        } else {
            console.log('Serveur frontend démarré avec succès.');
        }
        mainMenu();
    });
}

mainMenu();