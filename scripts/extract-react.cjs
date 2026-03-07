const fs = require('fs');

const index = fs.readFileSync('index.html', 'utf8');
const startIndex = index.indexOf('<script type="text/babel">');
const endIndex = index.indexOf('</script>', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    let reactCode = index.substring(startIndex + 26, endIndex);

    // Replace ReactDOM.createRoot calls
    reactCode = reactCode.replace(
        `ReactDOM.createRoot(document.getElementById('crosshair-root')).render(<App />);`,
        ``
    );
    // There are multiple createRoot calls.

    // We will just export the components and render them in main.jsx.
    // Actually, maybe it's easier to just keep them as they are for a quick migration, but add imports for React.

    const imports = `import React, { useRef, useEffect, useState, useId, Children, cloneElement, useMemo, useCallback, Fragment } from 'react';\nimport ReactDOM from 'react-dom/client';\nimport gsap from 'gsap';\nimport * as THREE from 'three';\nimport { motion, useSpring, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';\nimport './projects.js';\n`;

    // Wait, the window.projectsData might not be ready if we import it normally. 
    // We will move projects.js and script.js into src/ later.

    // Remove the standalone React destructurings
    reactCode = reactCode.replace(/const { useRef.*} = React;/g, '');
    reactCode = reactCode.replace(/const { motion.*} = window.Motion;/g, '');

    fs.writeFileSync('src/App.jsx', imports + reactCode);
    console.log("Extracted src/App.jsx");

    let newIndex = index.substring(0, startIndex) + `<script type="module" src="/src/main.jsx"></script>` + index.substring(endIndex + 9);

    // Remove CDNs
    newIndex = newIndex.replace(/<script src="https:\/\/unpkg.com\/react@18.*><\/script>/g, '');
    newIndex = newIndex.replace(/<script src="https:\/\/unpkg.com\/react-dom@18.*><\/script>/g, '');
    newIndex = newIndex.replace(/<script src="https:\/\/unpkg.com\/@babel\/standalone.*><\/script>/g, '');
    newIndex = newIndex.replace(/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/gsap.*><\/script>/g, '');
    newIndex = newIndex.replace(/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/three.js.*><\/script>/g, '');
    newIndex = newIndex.replace(/<script src="https:\/\/unpkg.com\/framer-motion.*><\/script>/g, '');

    // Fix asset paths
    newIndex = newIndex.replace(/src="gabs.jpg"/g, 'src="/gabs.webp"');
    newIndex = newIndex.replace(/rodasambasp-01.webp/g, '/rodasambasp-01.webp');
    newIndex = newIndex.replace(/project_\d.webp/g, '/$&');
    newIndex = newIndex.replace(/styles.css/g, '/src/styles.css');
    newIndex = newIndex.replace(/<script src="projects.js"><\/script>/g, '');
    newIndex = newIndex.replace(/<script src="script.js"><\/script>/g, '');

    fs.writeFileSync('index.html', newIndex);
    console.log("Updated index.html");
} else {
    console.log("Could not find babel script");
}
