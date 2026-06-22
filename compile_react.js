const fs = require('fs');
const babel = require('@babel/core');
const content = fs.readFileSync('c:/Users/hong0/Desktop/interactive-course-main/content/IGCSE_Syllabus/Year8/Science/Chapter7_Diet_and_Growth_MCQ/index.html', 'utf8');
const regex = /<script type="text\/babel">([\s\S]*?)<\/script>/;
const match = content.match(regex);
if (match) {
    const jsxCode = match[1];
    const jsCode = babel.transformSync(jsxCode, { presets: ['@babel/preset-react'] }).code;
    const newContent = content.replace(regex, '<script>\n' + jsCode + '\n</script>');
    fs.writeFileSync('c:/Users/hong0/Desktop/interactive-course-main/content/IGCSE_Syllabus/Year8/Science/Chapter7_Diet_and_Growth_MCQ/index.html', newContent);
    console.log('Compilation complete!');
} else {
    console.log('No Babel script found!');
}
