const fs = require('fs');

const html = fs.readFileSync('content/SPM_Syllabus/Form5/English/Social_Media_Masterclass/index.html', 'utf8');

const getVar = (name) => {
    const match = html.match(new RegExp('const ' + name + ' = ([\\s\\S]*?);\\n'));
    if (!match) {
        console.error("Could not find var: ", name);
        return 'null';
    }
    return match[1];
};

try {
    const vocabData = eval(getVar('vocabData'));
    const gameQ = eval(getVar('gameQ'));
    const peelSets = eval(getVar('peelSets'));

    const payload = JSON.stringify({ vocabData, gameQ, peelSets }, null, 2);

    const sql = `
INSERT INTO modules_content (module_id, title, required_tier, content_payload)
VALUES (
    'english-spm-social-media',
    'Social Media Masterclass / English Mastery',
    'premium',
    '${payload.replace(/'/g, "''")}'::jsonb
) ON CONFLICT (module_id) DO UPDATE SET content_payload = EXCLUDED.content_payload, required_tier = EXCLUDED.required_tier;
`;

    fs.writeFileSync('seed.sql', sql);
    console.log('Successfully created seed.sql');
} catch (e) {
    console.error(e);
}
