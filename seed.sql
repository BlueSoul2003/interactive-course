-- SQL Script to seed the Premium Module into Supabase

INSERT INTO modules_content (module_id, title, required_tier, secure_data)
VALUES (
    'english-spm-social-media',
    'Social Media Masterclass',
    2,
    '{
        "vocabData": [
            { "title": "Set 1: Basic Actions (动作)", "words": [{ "w": "Connect", "a": "Talk to friends online" }, { "w": "Upload", "a": "Post a photo/video" }, { "w": "Share", "a": "Send to others" }, { "w": "Create", "a": "Make something new" }, { "w": "Search", "a": "Look for information" }], "options": ["Talk to friends online", "Post a photo/video", "Send to others", "Make something new", "Look for information"] },
            { "title": "Set 2: Good Things (Pros)", "words": [{ "w": "Beneficial", "a": "Good / Helpful" }, { "w": "Convenient", "a": "Easy to use" }, { "w": "Useful", "a": "Helps you do things" }, { "w": "Effective", "a": "Works well" }, { "w": "Global", "a": "Whole world" }], "options": ["Good / Helpful", "Easy to use", "Helps you do things", "Works well", "Whole world"] },
            { "title": "Set 3: Bad Things (Cons)", "words": [{ "w": "Harmful", "a": "Bad / Dangerous" }, { "w": "Fake", "a": "Not real" }, { "w": "Addictive", "a": "Hard to stop using" }, { "w": "Dangerous", "a": "Not safe" }, { "w": "Rude", "a": "Not polite" }], "options": ["Bad / Dangerous", "Not real", "Hard to stop using", "Not safe", "Not polite"] },
            { "title": "Set 4: Tech Nouns (名词)", "words": [{ "w": "Device", "a": "Phone / Computer" }, { "w": "Platform", "a": "App or Website" }, { "w": "Content", "a": "Videos / Photos / Text" }, { "w": "Privacy", "a": "Keeping secrets safe" }, { "w": "Cyberbullying", "a": "Online bullying" }], "options": ["Phone / Computer", "App or Website", "Videos / Photos / Text", "Keeping secrets safe", "Online bullying"] },
            { "title": "Set 5: Connectors (连接词)", "words": [{ "w": "However", "a": "But" }, { "w": "Furthermore", "a": "Also / And" }, { "w": "Therefore", "a": "So" }, { "w": "For example", "a": "Like..." }, { "w": "In conclusion", "a": "To end the essay" }], "options": ["But", "Also / And", "So", "Like...", "To end the essay"] }
        ],
        "gameQ": [
            { "t": "跟远方的朋友保持联系", "a": "Good", "level": "L1: Chinese" },
            { "t": "容易看到假新闻 (Fake News)", "a": "Bad", "level": "L1: Chinese" },
            { "t": "沉迷手机，不想做功课", "a": "Bad", "level": "L1: Chinese" },
            { "t": "学习新技能 (比如看视频学做饭)", "a": "Good", "level": "L1: Chinese" },
            { "t": "网络霸凌 (被人骂)", "a": "Bad", "level": "L1: Chinese" },
            { "t": "Connect with friends easily", "a": "Good", "level": "L2: English" },
            { "t": "Spread of Fake News", "a": "Bad", "level": "L2: English" },
            { "t": "Addiction / Wasting time", "a": "Bad", "level": "L2: English" },
            { "t": "Learn new skills (Educational)", "a": "Good", "level": "L2: English" },
            { "t": "Cyberbullying (Hurting people)", "a": "Bad", "level": "L2: English" }
        ],
        "peelSets": [
            { "level": "Level 1: Chinese Logic (Good)", "desc": "Topic: Keeping in Touch (保持联系)", "sentences": { "A": "A: 例如：我们可以用WhatsApp打视频电话给在国外的亲戚。 (Example)", "B": "B: 因此，我们的关系会变得更亲密。 (Link)", "C": "C: 首先，社交媒体可以帮助我们保持联系。 (Point)", "D": "D: 这是因为无论朋友住得多远，我们都可以随时发信息给他们。 (Explanation)" }, "ans": { "P": "C", "E": "D", "Ex": "A", "L": "B" } },
            { "level": "Level 2: English (Simple)", "desc": "Topic: Learning New Skills", "sentences": { "A": "A: For instance, students can watch YouTube videos to learn how to cook.", "B": "B: This is because there are many free tutorials online.", "C": "C: Therefore, it is a very useful educational tool.", "D": "D: Firstly, social media is a great place to learn new skills." }, "ans": { "P": "D", "E": "B", "Ex": "A", "L": "C" } },
            { "level": "Level 3: English (Challenge)", "desc": "Topic: Fake News", "sentences": { "A": "A: People often share stories without checking if they are true.", "B": "B: Consequently, this causes panic and confusion in society.", "C": "C: Moreover, fake news spreads very fast on social media.", "D": "D: For example, believing rumours about a new virus or celebrity." }, "ans": { "P": "C", "E": "A", "Ex": "D", "L": "B" } }
        ]
    }'::jsonb
) ON CONFLICT (module_id) DO UPDATE SET secure_data = EXCLUDED.secure_data, required_tier = EXCLUDED.required_tier;

