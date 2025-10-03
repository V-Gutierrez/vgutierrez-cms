#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clean up browser flag on startup
const browserFlagFile = path.join(__dirname, '.browser-opened');
if (fs.existsSync(browserFlagFile)) {
    try {
        fs.unlinkSync(browserFlagFile);
    } catch (error) {
        // Ignore cleanup errors
    }
}

// Clean up browser flag on exit
function cleanup() {
    if (fs.existsSync(browserFlagFile)) {
        try {
            fs.unlinkSync(browserFlagFile);
        } catch (error) {
            // Ignore cleanup errors
        }
    }
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

console.log('🚀 Iniciando Victor Gutierrez CMS - Web App');
console.log('==========================================\n');

// Check if dependencies are installed
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Instalando dependências...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependências instaladas com sucesso!\n');
    } catch (error) {
        console.error('❌ Erro ao instalar dependências:', error.message);
        process.exit(1);
    }
}

// Check if server directory exists
const serverPath = path.join(__dirname, 'server');
if (!fs.existsSync(serverPath)) {
    console.error('❌ Diretório server/ não encontrado!');
    console.log('💡 Verifique se você está na raiz do projeto.');
    process.exit(1);
}

// Check if public directory exists
const publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
    console.error('❌ Diretório public/ não encontrado!');
    console.log('💡 Verifique se você está na raiz do projeto.');
    process.exit(1);
}

// Start the server with nodemon for hot reload
console.log('🌟 Iniciando servidor com hot reload...');
console.log('🔥 Hot reload ativado - Backend e Frontend');
console.log('🔗 URL: http://localhost:3001/admin');
console.log('🌐 Navegador abrirá automaticamente');
console.log('⌨️  Pressione Ctrl+C para parar o servidor');
console.log('💡 Dica: Digite "rs" para reiniciar manualmente\n');

try {
    execSync('npx nodemon server/app.js', { stdio: 'inherit' });
} catch (error) {
    if (error.signal !== 'SIGINT') {
        console.error('❌ Erro ao iniciar servidor:', error.message);
        if (error.stdout) {
            console.log('📄 Stdout:', error.stdout.toString());
        }
        if (error.stderr) {
            console.log('📄 Stderr:', error.stderr.toString());
        }
        console.log('📄 Código de saída:', error.status);
        process.exit(1);
    }
}

console.log('\n👋 Servidor parado. Até logo!');