import re
import json

file_path = 'content/KSSR_Syllabus/Primary6/English/Revision2/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update text identifiers
content = content.replace('kssr-p6-en-revision1', 'kssr-p6-en-revision2')
content = content.replace('Revision 1 (Unit 1 & 2)', 'Revision 2 (Unit 1 & 2 Grammar)')
content = content.replace('Revision 1', 'Revision 2')

# 2. Update colors
# Replacing cyan -> rose
content = content.replace('cyan-600', 'rose-600')
content = content.replace('cyan-500', 'rose-500')
content = content.replace('cyan-700', 'rose-700')
content = content.replace('cyan-100', 'rose-100')
content = content.replace('cyan-50', 'rose-50')
# Replacing violet -> amber
content = content.replace('violet-600', 'amber-600')
content = content.replace('violet-500', 'amber-500')
content = content.replace('violet-700', 'amber-700')
content = content.replace('violet-100', 'amber-100')
content = content.replace('violet-50', 'amber-50')

# 3. Inject new vocabData
vocab = [
    [
        {"en": "was walking", "zh": "正在走 (过去)"},
        {"en": "were playing", "zh": "正在玩 (过去)"},
        {"en": "was reading", "zh": "正在读"},
        {"en": "were sleeping", "zh": "正在睡"},
        {"en": "was eating", "zh": "正在吃"},
        {"en": "were running", "zh": "正在跑"},
        {"en": "was watching", "zh": "正在看"},
        {"en": "were talking", "zh": "正在说话"},
        {"en": "was writing", "zh": "正在写"},
        {"en": "were studying", "zh": "正在学习"}
    ],
    [
        {"en": "used to be", "zh": "过去是"},
        {"en": "used to go", "zh": "过去常去"},
        {"en": "used to play", "zh": "过去常玩"},
        {"en": "used to live", "zh": "过去常住"},
        {"en": "used to have", "zh": "过去常有"},
        {"en": "used to work", "zh": "过去常工作"},
        {"en": "used to visit", "zh": "过去常拜访"},
        {"en": "used to watch", "zh": "过去常看"},
        {"en": "used to eat", "zh": "过去常吃"},
        {"en": "used to read", "zh": "过去常读"}
    ],
    [
        {"en": "because it rained", "zh": "因为下雨了"},
        {"en": "so I stayed", "zh": "所以我留下了"},
        {"en": "although it was late", "zh": "虽然很晚了"},
        {"en": "until he arrived", "zh": "直到他到达"},
        {"en": "while I was sleeping", "zh": "当我在睡觉时"},
        {"en": "when she called", "zh": "当她打电话时"},
        {"en": "before we left", "zh": "在我们离开之前"},
        {"en": "after they ate", "zh": "在他们吃完之后"},
        {"en": "because I was tired", "zh": "因为我很累"},
        {"en": "so we went home", "zh": "所以我们回家了"}
    ],
    [
        {"en": "why are you crying", "zh": "你为什么哭"},
        {"en": "why is he running", "zh": "他为什么跑"},
        {"en": "what were you doing", "zh": "你当时在做什么"},
        {"en": "where were they going", "zh": "他们当时去哪里"},
        {"en": "who was she talking to", "zh": "她当时在和谁说话"},
        {"en": "how did it happen", "zh": "它是怎么发生的"},
        {"en": "when did they arrive", "zh": "他们什么时候到的"},
        {"en": "what used to be here", "zh": "这里过去是什么"},
        {"en": "did you use to play", "zh": "你过去常玩吗"},
        {"en": "were they sleeping", "zh": "他们当时在睡觉吗"}
    ]
]

vocab_js = "const vocabData = " + json.dumps(vocab, ensure_ascii=False, indent=4) + ";"
content = re.sub(r'const\s+vocabData\s*=\s*\[.*?\n\];', vocab_js, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Primary 6 Revision 2 content.")
