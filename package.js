const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let logic = fs.readFileSync('logic.js', 'utf8');

// The original build generated index.html with:
// <script src="logic.js"></script>
// <script>
// // We'll concatenate the script here
// </script>

html = html.replace('<script src="logic.js"></script>', '');
html = html.replace("// We'll concatenate the script here", logic);

fs.writeFileSync('index.html', html);
