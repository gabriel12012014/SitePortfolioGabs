import fs from 'fs';
const file = 'src/App.jsx';
let text = fs.readFileSync(file, 'utf8');

// Find the literal \n\n sequence at the end of the file
const marker = "\\n\\n        const crosshairRoot";
const idx = text.indexOf(marker);

if (idx !== -1) {
    const newText = `
        const crosshairRoot = document.getElementById('crosshair-root');
        if (crosshairRoot) {
            ReactDOM.createRoot(crosshairRoot).render(<App />);
        }
`;
    text = text.substring(0, idx) + newText;
    fs.writeFileSync(file, text);
    console.log("Fixed syntax error");
} else {
    console.log("Marker not found", idx);
}
