require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
app.use(express.json()); // Middleware para parsear JSON
app.use(express.urlencoded({ extended: true })); // Middleware para manejar formularios


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urls = {};

app.post('/api/shorturl', (req, res) => {

  const originalUrl = req.body.url;
  
  console.log(originalUrl);
  // Verifica si la URL está bien formada
  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);  // Usa URL para validar la URL
  } catch (e) {
    return res.json({ error: 'Invalid URL' });
  }

  // Extraer solo el hostname para la validación DNS (sin el protocolo)
  const { hostname } = parsedUrl;

  // Verifica si el dominio existe usando dns.lookup
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'Invalid URL' });
    }

    // Genera un shortUrl único
    const shortUrl = Math.floor(Math.random() * 10000);
    urls[shortUrl] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl,
    });
  });
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortUrl = req.params.shorturl;
  const originalUrl = urls[shortUrl];

  if (!originalUrl) {
    return res.json({ error: 'No URL found' });
  }

  res.redirect(originalUrl); // Redirige a la URL original
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
