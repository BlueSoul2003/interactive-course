const fs = require('fs');
const window = { AudioContext: class {}, webkitAudioContext: class {}, addEventListener: (event, cb) => { setTimeout(cb, 0); } };
const document = { getElementById: (id) => { 
  if (id === 'game-container') return global.container;
  return { id: id, style: {}, classList: { add: ()=>{}, remove: ()=>{} }, innerHTML: "", innerText: "" };
} };
global.container = { innerHTML: "" };

let ProgressTracker = {
  init: function(cb) { cb(this); },
  load: async function() { return null; },
  autoSave: function() {}
};

try {
  eval(fs.readFileSync('script_1.js', 'utf8'));
  eval(fs.readFileSync('script_2.js', 'utf8'));
} catch (e) {
  console.error("Eval Error:", e);
}

setTimeout(() => {
    try {
        console.log('SUCCESS, rendered slide HTML:', global.container.innerHTML !== "");
    } catch (e) {
        console.error("Timeout Error:", e);
    }
}, 100);
