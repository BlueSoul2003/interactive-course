import re
import json

file_path = 'content/KSSR_Syllabus/Primary6/English/Revision1/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update text identifiers
content = content.replace('Primary 3', 'Primary 6')
content = content.replace('Year 3', 'Year 6')
content = content.replace('kssr-p3-en-revision1', 'kssr-p6-en-revision1')
content = content.replace('kssr_p3_english', 'kssr_p6_english')

# 2. Update colors
# Replacing teal -> cyan
content = content.replace('teal-600', 'cyan-600')
content = content.replace('teal-500', 'cyan-500')
content = content.replace('teal-700', 'cyan-700')
content = content.replace('teal-100', 'cyan-100')
content = content.replace('teal-50', 'cyan-50')
# Replacing rose -> violet
content = content.replace('rose-600', 'violet-600')
content = content.replace('rose-500', 'violet-500')
content = content.replace('rose-700', 'violet-700')
content = content.replace('rose-100', 'violet-100')
content = content.replace('rose-50', 'violet-50')

# 3. Inject new vocabData
vocab = [
    [
        {"en": "journalist", "zh": "记者"},
        {"en": "photographer", "zh": "摄影师"},
        {"en": "mechanic", "zh": "技工"},
        {"en": "chef", "zh": "厨师"},
        {"en": "architect", "zh": "建筑师"},
        {"en": "dentist", "zh": "牙医"},
        {"en": "accountant", "zh": "会计师"},
        {"en": "engineer", "zh": "工程师"},
        {"en": "scientist", "zh": "科学家"},
        {"en": "veterinarian", "zh": "兽医"}
    ],
    [
        {"en": "emergency", "zh": "紧急情况"},
        {"en": "accident", "zh": "意外"},
        {"en": "ambulance", "zh": "救护车"},
        {"en": "injured", "zh": "受伤的"},
        {"en": "hospital", "zh": "医院"},
        {"en": "paramedic", "zh": "医务人员"},
        {"en": "rescue", "zh": "救援"},
        {"en": "siren", "zh": "警报器"},
        {"en": "bleeding", "zh": "流血"},
        {"en": "fainted", "zh": "晕倒"}
    ],
    [
        {"en": "was walking", "zh": "正在走 (过去)"},
        {"en": "were playing", "zh": "正在玩 (过去)"},
        {"en": "used to read", "zh": "过去常读"},
        {"en": "used to write", "zh": "过去常写"},
        {"en": "happened", "zh": "发生"},
        {"en": "witnessed", "zh": "目击"},
        {"en": "called", "zh": "打电话"},
        {"en": "arrived", "zh": "到达"},
        {"en": "explained", "zh": "解释"},
        {"en": "investigated", "zh": "调查"}
    ],
    [
        {"en": "diary", "zh": "日记"},
        {"en": "scared", "zh": "害怕的"},
        {"en": "relieved", "zh": "松了一口的"},
        {"en": "exhausted", "zh": "筋疲力尽的"},
        {"en": "anxious", "zh": "焦虑的"},
        {"en": "brave", "zh": "勇敢的"},
        {"en": "grateful", "zh": "感激的"},
        {"en": "terrified", "zh": "极度恐惧的"},
        {"en": "calm", "zh": "冷静的"},
        {"en": "worried", "zh": "担心的"}
    ]
]

vocab_js = "const vocabData = " + json.dumps(vocab, ensure_ascii=False, indent=4) + ";"
content = re.sub(r'const\s+vocabData\s*=\s*\[.*?\n\];', vocab_js, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Primary 6 Revision 1 content.")
