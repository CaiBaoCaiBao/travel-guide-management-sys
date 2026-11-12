const path = require('path');
const fs = require('fs');
const gateway = require('express-gateway');

// 加载 .env 文件
require('dotenv').config();

const publicKeyPath = path.join(__dirname, 'public.pem');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
process.env.JWT_PUBLIC_KEY = publicKey;

console.log("HTTP_PORT:", process.env.HTTP_PORT);
console.log("ADMIN_PORT:", process.env.ADMIN_PORT);
console.log(process.cwd());

gateway()
  .load(path.join(__dirname, 'config'))
  .run();
